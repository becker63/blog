import { aggregateInsights, deterministicDryRunWithoutCursorDecision } from "../aggregate/aggregate-insights";
import { collectInsightSeeds } from "../aggregate/collect-insights";
import { GitHubDigestIssuePublisher } from "../aggregate/github-digest-issue";
import { renderDigestIssue } from "../aggregate/render-digest-issue";
import { buildAuthorProfile } from "../context/build-author-profile";
import { buildWritingCorpus } from "../context/build-writing-corpus";
import { AggregateDecision } from "../model/types";
import {
  canRunAggregator,
  estimateTokens,
  readBudgetState,
  recordAggregatorRun,
  writeBudgetStateIfChanged,
} from "../storage/budget-state";
import { buildTasteProfile } from "../taste-profile";
import { getArgValue, hasFlag } from "./args";
import { Reporter } from "./reporter";

const formatWeakPatterns = (patterns: string[]) =>
  patterns.length === 0 ? "(none listed)" : patterns.map((p) => `  - ${p}`).join("\n");

const logAggregateDecision = (ci: boolean, seeds: number, decision: AggregateDecision) => {
  if (decision.kind === "no_digest_update") {
    if (ci) {
      const weak = decision.weakPatterns.length ? decision.weakPatterns.join("|") : "none";
      console.log(`aggregate digestWouldUpdate=no seeds=${seeds} weakPatterns=${weak}`);
      console.log(`aggregate no_digest reason=${decision.reason.replace(/\s+/g, " ").slice(0, 400)}`);
      if (decision.suggestedIssueActions?.length) {
        console.log(
          `aggregate suggestedActions=${decision.suggestedIssueActions
            .map((a) => `#${a.issueNumber}:${a.action}`)
            .join(",")}`,
        );
      }
    } else {
      console.log(`Seeds collected: ${seeds}`);
      console.log("Editorial gate: digest would NOT update.");
      console.log(`Reason: ${decision.reason}`);
      console.log("Weak / rejected patterns:");
      console.log(formatWeakPatterns(decision.weakPatterns));
      if (decision.suggestedIssueActions?.length) {
        console.log("Suggested issue actions:");
        for (const a of decision.suggestedIssueActions) {
          console.log(`  - #${a.issueNumber}: ${a.action}${a.note ? ` — ${a.note}` : ""}`);
        }
      }
    }
    return;
  }

  if (ci) {
    console.log(`aggregate digestWouldUpdate=yes seeds=${seeds} clusters=${decision.digest.clusters.length}`);
  } else {
    console.log(`Editorial gate: digest WOULD update (${decision.digest.clusters.length} clusters).`);
  }
};

const main = async () => {
  const dryRun = hasFlag("--dry-run");
  const ci = hasFlag("--ci") || process.env.CI === "true";
  const scheduledRun = process.env.GITHUB_EVENT_NAME === "schedule";
  const ignoreBudget = hasFlag("--ignore-budget");
  const budgetStatus = hasFlag("--budget-status");
  const repo = getArgValue("--repo");
  const maxSeeds = Number(getArgValue("--max-seeds") ?? process.env.REPO_INSIGHT_AGGREGATOR_MAX_SEEDS ?? "30");
  const includeClosed = !hasFlag("--no-closed");
  const noGithub = hasFlag("--no-github");
  const budgetState = await readBudgetState();
  const budget = canRunAggregator(budgetState);
  const reporter = new Reporter({ ci });

  const runsLabel = `${budget.used}/${budget.limit}`;

  if (budgetStatus) {
    console.log(`aggregate budget=${budget.ok ? "ok" : "exhausted"} runs=${runsLabel}`);
    return;
  }

  const seeds = await collectInsightSeeds({ repo, includeClosed, noGithub, maxSeeds });
  if (seeds.length < 2) {
    console.log(
      ci
        ? `aggregate skip=too_few_seeds budget=${budget.ok ? "ok" : "exhausted"} runs=${runsLabel} seeds=${seeds.length}`
        : `Only ${seeds.length} repo-insight seed found; skipping.`,
    );
    return;
  }

  const publisher = new GitHubDigestIssuePublisher({ repo, dryRun });
  const existingDigest = await publisher.existingDigestIssue();
  if (!dryRun && scheduledRun && !ignoreBudget && existingDigest) {
    const ageMs = Date.now() - Date.parse(existingDigest.updatedAt);
    if (ageMs < 20 * 60 * 60 * 1000) {
      console.log(
        ci
          ? `aggregate skip=recently_updated runs=${runsLabel} seeds=${seeds.length} updatedAt=${existingDigest.updatedAt}`
          : `Digest was updated recently (${existingDigest.updatedAt}); skipping.`,
      );
      return;
    }
  }

  if (scheduledRun && !ignoreBudget && !budget.ok) {
    console.log(ci ? `aggregate budget=exhausted runs=${runsLabel} seeds=${seeds.length}` : `Aggregator budget exhausted (${budget.used}/${budget.limit}).`);
    return;
  }

  console.log(ci ? `aggregate budget=ok runs=${runsLabel} seeds=${seeds.length}` : `Aggregate budget ok (${budget.used}/${budget.limit}); seeds: ${seeds.length}/${maxSeeds}`);

  const tasteProfile = await buildTasteProfile({ write: false });
  const writing = await buildWritingCorpus();
  const profile = await buildAuthorProfile();
  reporter.aggregateContext({ writingSources: writing.sourceCount, profileSources: profile.sourceCount });

  const ctx = {
    tasteProfile,
    writingCorpus: writing.capsule,
    authorProfile: profile.capsule,
  };

  const usage = {
    inputTokens: 0,
    outputTokens: 0,
    model: process.env.CURSOR_MODEL ?? "composer-2",
  };
  const onUsageEstimate = (event: { inputChars: number; outputChars: number; model: string }) => {
    usage.inputTokens += estimateTokens(event.inputChars);
    usage.outputTokens += estimateTokens(event.outputChars);
    usage.model = event.model;
  };

  const skipModel = dryRun && !process.env.CURSOR_API_KEY;

  const decision: AggregateDecision = skipModel
    ? deterministicDryRunWithoutCursorDecision(seeds)
    : await aggregateInsights(seeds, ctx, { onUsageEstimate });

  if (!dryRun) {
    await writeBudgetStateIfChanged(recordAggregatorRun(budgetState, usage));
  }

  logAggregateDecision(ci, seeds.length, decision);

  if (!skipModel) {
    console.log(ci ? `usage-estimate inputTokens≈${usage.inputTokens} outputTokens≈${usage.outputTokens} model=${usage.model}` : `Usage estimate: inputTokens≈${usage.inputTokens} outputTokens≈${usage.outputTokens} model=${usage.model}`);
  }

  if (decision.kind === "no_digest_update") {
    if (skipModel && !ci) {
      console.log(`(Set CURSOR_API_KEY to run the editorial model locally; ${seeds.length} seeds ready.)`);
    }
    return;
  }

  const body = renderDigestIssue({ digest: decision.digest, seeds });
  const issue = await publisher.publish(body);

  console.log(
    ci
      ? `aggregate seeds=${seeds.length} clusters=${decision.digest.clusters.length} issue=${issue.url}`
      : [
          "Repo Insight Digest",
          `  seeds: ${seeds.length}`,
          `  clusters: ${decision.digest.clusters.length}`,
          `  issue: ${issue.url}`,
          `  action: ${issue.action}`,
        ].join("\n"),
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
