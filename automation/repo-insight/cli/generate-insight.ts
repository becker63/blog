import { GitHubIssuePublisher } from "../adapters/github-issues";
import { CursorSdkAgentBackend } from "../adapters/cursor-sdk-agent";
import { discoverAccessibleRepos } from "../adapters/github-repos";
import { buildAuthorProfile } from "../context/build-author-profile";
import { buildWritingCorpus } from "../context/build-writing-corpus";
import { CuratorInput, InsightWakeReason } from "../model/types";
import { packTopRepos } from "../packing/pack-top-repos";
import { compactPacks } from "../packing/compact-packs";
import { selectReposForPacking } from "../packing/select-repos";
import { readRepoCatalog } from "../storage/repo-catalog";
import {
  canRunProducerScheduled,
  estimateTokens,
  readBudgetState,
  recordProducerManualRun,
  recordProducerScheduledRun,
  writeBudgetStateIfChanged,
} from "../storage/budget-state";
import { buildUpdatedPollState, diffPollState, readPollState, writePollState } from "../storage/poll-state";
import { buildTasteProfile } from "../taste-profile";
import { hasFlag } from "./args";
import { Reporter } from "./reporter";

const runId = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

const stripUnsafeQuotes = <T extends { issue: { evidence: Array<{ repo: string; quote?: string }> } }>(
  decision: T,
  safeRepos: Set<string>,
) => ({
  ...decision,
  issue: {
    ...decision.issue,
    evidence: decision.issue.evidence.map((item) =>
      safeRepos.has(item.repo) ? item : { ...item, quote: undefined },
    ),
  },
});

const main = async () => {
  const force = hasFlag("--force");
  const ignoreBudget = hasFlag("--ignore-budget");
  const budgetStatus = hasFlag("--budget-status");
  const scheduledRun = process.env.GITHUB_EVENT_NAME === "schedule";
  const wakeReason: InsightWakeReason = force ? "manual-force" : scheduledRun ? "scheduled-poll" : "manual-normal";
  const reporter = new Reporter({ ci: hasFlag("--ci") });

  let budgetState = await readBudgetState();
  let producerBudget = canRunProducerScheduled(budgetState);

  if (budgetStatus) {
    reporter.producerBudgetLine({
      scheduled: scheduledRun && !ignoreBudget,
      used: producerBudget.used,
      limit: producerBudget.limit,
    });
    return;
  }

  const catalog = await readRepoCatalog();
  const repos = await discoverAccessibleRepos({ catalog });
  const previousPollState = await readPollState();
  const pollChanges = diffPollState(repos, previousPollState);
  reporter.polling({ reposChecked: repos.length, changes: pollChanges });

  if (!force && pollChanges.length === 0) {
    return;
  }

  if (scheduledRun && !ignoreBudget && !producerBudget.ok) {
    reporter.producerBudgetLine({
      scheduled: true,
      used: producerBudget.used,
      limit: producerBudget.limit,
      exhausted: true,
    });
    return;
  }

  reporter.producerBudgetLine({
    scheduled: scheduledRun && !ignoreBudget,
    used: producerBudget.used,
    limit: producerBudget.limit,
  });

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

  let curatorAttempted = false;
  let curatorFinished = false;
  let budgetRecorded = false;
  const finalizeProducerBudgetOnce = async () => {
    if (budgetRecorded) return;
    /** Count scheduled/manual runs toward quota only after the curator agent call is attempted (compaction-only paths do not increment runs). */
    if (!curatorAttempted) return;

    budgetState = scheduledRun && !ignoreBudget ? recordProducerScheduledRun(budgetState, usage) : recordProducerManualRun(budgetState, usage);
    await writeBudgetStateIfChanged(budgetState);
    budgetRecorded = true;
  };

  try {
    const selection = selectReposForPacking({ repos, changes: pollChanges });
    if (selection.selectedRepos.length === 0) {
      throw new Error("No repositories were selected for repo insight generation.");
    }
    reporter.selection(selection);

    const maxRepoBytes = Number(process.env.REPO_INSIGHT_MAX_PACK_BYTES ?? "100000");
    const maxTotalBytes = Number(process.env.REPO_INSIGHT_MAX_TOTAL_PACK_BYTES ?? "300000");
    reporter.packBudget(maxRepoBytes, maxTotalBytes);

    const packs = await packTopRepos({ catalog, repos: selection.selectedRepos, maxTotalBytes });
    reporter.packs(packs);

    const maxNewCompactions =
      scheduledRun && !force && !ignoreBudget ? Number(process.env.REPO_INSIGHT_MAX_NEW_COMPACTIONS_PER_RUN ?? "2") : undefined;

    const { capsules, cacheEvents } = await compactPacks(packs, { maxNewCompactions, onUsageEstimate });
    reporter.capsuleCacheSummary(cacheEvents);
    reporter.capsules(capsules, cacheEvents);

    const currentRunId = runId();
    const writingContext = await buildWritingCorpus();
    const profileContext = await buildAuthorProfile();
    reporter.writingContext(writingContext);
    reporter.profileContext(profileContext);
    const input: CuratorInput = {
      runId: currentRunId,
      generatedAt: new Date().toISOString(),
      tasteProfile: await buildTasteProfile({ write: false }),
      writingCorpus: writingContext.capsule,
      authorProfile: profileContext.capsule,
      previousInsightTitles: [],
      activitySignal: {
        wakeReason,
        changedRepos: selection.changedRepos.map((repo) => repo.fullName),
        note:
          "Scheduled activity only answers whether repos changed vs poll state — it does not designate a focal repo. Candidate and selected repos are a sampled context window; no repo or commit ordering implies importance.",
      },
      selection: {
        mode: selection.mode,
        randomSeed: selection.randomSeed,
        candidateRepoCount: selection.candidateRepos.length,
        selectedRepoCount: selection.selectedRepos.length,
        changedRepoCount: selection.changedRepos.length,
        selectedRepos: selection.selectedRepos.map((repo) => repo.fullName),
        changedRepos: selection.changedRepos.map((repo) => repo.fullName),
        wakeReason,
      },
      capsules,
      mode: force ? "force" : "discretionary",
    };

    curatorAttempted = true;
    const decision = await new CursorSdkAgentBackend({ onUsageEstimate }).generateInsight(input);
    curatorFinished = true;
    reporter.usageEstimate(usage);
    reporter.decision(decision);
    await finalizeProducerBudgetOnce();

    const updatedPollState = buildUpdatedPollState(repos, previousPollState);

    if (decision.kind === "no_insight") {
      if (force) throw new Error("generate-insight:force received no_insight, which is invalid in force mode.");
      await writePollState(updatedPollState);
      reporter.output({});
      return;
    }

    const safeDecision = stripUnsafeQuotes(
      decision,
      new Set(packs.filter((pack) => pack.safeToQuote).map((pack) => pack.fullName)),
    );

    await buildTasteProfile();
    const issue = await new GitHubIssuePublisher().publishInsightIssue({
      issue: safeDecision.issue,
    });

    if (!issue) throw new Error("Expected GitHub issue creation to return an issue outside dry-run mode.");

    await writePollState(updatedPollState);
    reporter.output({ issueUrl: issue.url });
  } catch (error) {
    await finalizeProducerBudgetOnce();
    throw error;
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
