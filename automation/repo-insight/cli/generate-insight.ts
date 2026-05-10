import { GitHubIssuePublisher } from "../adapters/github-issues";
import { CursorSdkAgentBackend } from "../adapters/cursor-sdk-agent";
import { discoverTopRepos } from "../adapters/github-repos";
import { buildAuthorProfile } from "../context/build-author-profile";
import { buildWritingCorpus } from "../context/build-writing-corpus";
import { CuratorInput, InsightRunTrigger } from "../model/types";
import { AccessibleRepo } from "../packing/types";
import { packTopRepos } from "../packing/pack-top-repos";
import { compactPacks } from "../packing/compact-packs";
import { readRepoCatalog } from "../storage/repo-catalog";
import { buildUpdatedPollState, diffPollState, PollStateChange, readPollState, writePollState } from "../storage/poll-state";
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

const toPollingTrigger = (
  changes: PollStateChange[],
  repos: AccessibleRepo[],
): InsightRunTrigger => {
  const changedRepo = changes[0]?.repo;
  const topRepo = changedRepo ?? repos[0];
  if (!topRepo) {
    throw new Error("No accessible repositories were selected for repo insight generation.");
  }

  return {
    kind: "poll",
    repo: topRepo.fullName,
    branch: topRepo.defaultBranch,
    pushedAt: topRepo.pushedAt,
    lastSeenAt: changes[0]?.previous?.lastSeenAt,
    lastSeenSha: changes[0]?.previous?.lastSeenSha,
    changedFiles: [],
    note: "No repository_dispatch payload was provided; this run was triggered by scheduled polling and inferred from recently pushed repositories.",
  };
};

const main = async () => {
  const force = hasFlag("--force");
  const reporter = new Reporter({ ci: hasFlag("--ci") });

  const catalog = await readRepoCatalog();
  const repos = await discoverTopRepos({ catalog });
  const previousPollState = await readPollState();
  const pollChanges = diffPollState(repos, previousPollState);
  const trigger = toPollingTrigger(pollChanges, repos);
  reporter.polling({ reposChecked: repos.length, changes: pollChanges, trigger });

  if (!force && pollChanges.length === 0) {
    return;
  }

  reporter.trigger(trigger);
  const packs = await packTopRepos({ catalog, repos });
  reporter.packs(packs);

  const { capsules, cacheEvents } = await compactPacks(packs);
  reporter.capsuleCache(cacheEvents);
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
    trigger,
    capsules,
    mode: force ? "force" : "discretionary",
  };

  const decision = await new CursorSdkAgentBackend().generateInsight(input);
  reporter.decision(decision);
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
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
