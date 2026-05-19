import { appendFile } from "node:fs/promises";
import {
  aggregateInsights,
  deterministicDigestPreviewWithoutCursor,
} from "../aggregate/aggregate-insights";
import { collectInsightSeeds } from "../aggregate/collect-insights";
import { GitHubDigestIssuePublisher } from "../aggregate/github-digest-issue";
import { renderDigestIssue } from "../aggregate/render-digest-issue";
import { buildAuthorProfile } from "../context/build-author-profile";
import { buildWritingCorpus } from "../context/build-writing-corpus";
import { InsightDigest } from "../model/types";
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

/** In GitHub Actions, surfaces outcome on the job summary tab (does nothing locally). */
const appendGithubStepSummary = async (markdown: string) => {
  const path = process.env.GITHUB_STEP_SUMMARY;
  if (!path) return;
  await appendFile(path, `\n${markdown}\n`, "utf8");
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

  const digest: InsightDigest = skipModel
    ? deterministicDigestPreviewWithoutCursor(seeds)
    : await aggregateInsights(seeds, ctx, { onUsageEstimate });

  if (!dryRun) {
    await writeBudgetStateIfChanged(recordAggregatorRun(budgetState, usage));
  }

  const body = renderDigestIssue({ digest, seeds });

  if (!skipModel) {
    console.log(ci ? `usage-estimate inputTokens≈${usage.inputTokens} outputTokens≈${usage.outputTokens} model=${usage.model}` : `Usage estimate: inputTokens≈${usage.inputTokens} outputTokens≈${usage.outputTokens} model=${usage.model}`);
  } else if (!ci) {
    console.log("(Set CURSOR_API_KEY to run the full editorial digest model.)");
  }

  const issue = await publisher.publish(body);

  if (ci && !dryRun) {
    await appendGithubStepSummary(
      [
        "## Repo Insight Aggregate — digest updated",
        "",
        `- **Issue:** ${issue.url}`,
        `- **Action:** ${issue.action}`,
        `- **Clusters:** ${digest.clusters.length}`,
        `- **Seeds:** ${seeds.length}`,
        skipModel ? "- **Note:** model skipped (dry-run without CURSOR_API_KEY); body is placeholder." : "",
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  if (ci) {
    console.log(
      `aggregate digestIssue=${issue.action === "dry-run" ? "dry-run" : "updated"} seeds=${seeds.length} clusters=${digest.clusters.length} issue=${issue.url}`,
    );
  } else {
    console.log(
      ["Repo Insight Digest", `  seeds: ${seeds.length}`, `  clusters: ${digest.clusters.length}`, `  issue: ${issue.url}`, `  action: ${issue.action}`].join(
        "\n",
      ),
    );
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
