import { readFile } from "node:fs/promises";
import { GitHubIssuePublisher } from "../adapters/github-issues";
import { CursorSdkAgentBackend } from "../adapters/cursor-sdk-agent";
import { dispatchPayloadSchema } from "../model/schemas";
import { CuratorInput, DispatchPayload, InsightRunTrigger } from "../model/types";
import { packTopRepos } from "../packing/pack-top-repos";
import { compactPacks } from "../packing/compact-packs";
import { writeInsightIssueMetadata } from "../render/index-json";
import { readRepoCatalog } from "../storage/repo-catalog";
import { writeInsightArtifact } from "../storage/insight-store";
import { insightIndexPath } from "../storage/paths";
import { buildTasteProfile } from "../taste-profile";
import { getArgValue, hasFlag } from "./args";
import { Reporter } from "./reporter";

const runId = () => new Date().toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");

const readOptionalTriggerHint = async (): Promise<DispatchPayload | undefined> => {
  const payloadArg = getArgValue("--payload");
  const payloadFile = getArgValue("--payload-file");
  const envPayload = process.env.REPO_INSIGHT_PAYLOAD?.trim();

  if (payloadArg) return dispatchPayloadSchema.parse(JSON.parse(payloadArg));
  if (payloadFile) return dispatchPayloadSchema.parse(JSON.parse(await readFile(payloadFile, "utf8")));
  if (envPayload) return dispatchPayloadSchema.parse(JSON.parse(envPayload));

  return undefined;
};

const readPreviousInsightTitles = async () => {
  try {
    const raw = JSON.parse(await readFile(insightIndexPath, "utf8")) as {
      insights?: Array<{ title?: string }>;
    };
    return raw.insights?.map((insight) => insight.title).filter((title): title is string => Boolean(title)) ?? [];
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
    throw error;
  }
};

const stripUnsafeQuotes = <T extends { artifact: { sections: { evidence: Array<{ repo: string; quote?: string }> } } }>(
  decision: T,
  safeRepos: Set<string>,
) => ({
  ...decision,
  artifact: {
    ...decision.artifact,
    sections: {
      ...decision.artifact.sections,
      evidence: decision.artifact.sections.evidence.map((item) =>
        safeRepos.has(item.repo) ? item : { ...item, quote: undefined },
      ),
    },
  },
});

const toTrigger = (
  triggerHint: DispatchPayload | undefined,
  packs: Array<{ fullName: string; defaultBranch: string }>,
): InsightRunTrigger => {
  if (triggerHint) {
    return {
      kind: "github-push",
      repo: triggerHint.repo,
      branch: triggerHint.branch,
      before: triggerHint.before,
      after: triggerHint.after,
      pusher: triggerHint.pusher,
      eventType: triggerHint.eventType,
      changedFiles: triggerHint.changedFiles,
    };
  }

  const topRepo = packs[0];
  if (!topRepo) {
    throw new Error("No accessible repositories were selected for repo insight generation.");
  }

  return {
    kind: "inferred-top-repo",
    repo: topRepo.fullName,
    branch: topRepo.defaultBranch,
    note: "No explicit push payload was provided; this run was inferred from the most recently pushed accessible repo.",
  };
};

const main = async () => {
  const force = hasFlag("--force");
  const reporter = new Reporter({ ci: hasFlag("--ci") });
  const triggerHint = await readOptionalTriggerHint();

  const catalog = await readRepoCatalog();
  const packs = await packTopRepos({ catalog, triggerHint });
  const trigger = toTrigger(triggerHint, packs);
  reporter.trigger(trigger);
  reporter.packs(packs);

  const capsules = await compactPacks(packs);
  reporter.capsules(capsules);

  const currentRunId = runId();
  const input: CuratorInput = {
    runId: currentRunId,
    generatedAt: new Date().toISOString(),
    tasteProfile: await buildTasteProfile({ write: false }),
    previousInsightTitles: await readPreviousInsightTitles(),
    trigger,
    capsules,
    mode: force ? "force" : "discretionary",
  };

  const decision = await new CursorSdkAgentBackend().generateInsight(input);
  reporter.decision(decision);

  if (decision.kind === "no_insight") {
    if (force) throw new Error("generate-insight:force received no_insight, which is invalid in force mode.");
    reporter.output({});
    return;
  }

  const safeDecision = stripUnsafeQuotes(
    decision,
    new Set(packs.filter((pack) => pack.safeToQuote).map((pack) => pack.fullName)),
  );

  await buildTasteProfile();
  const artifactPath = await writeInsightArtifact(safeDecision.artifact);
  const issue = await new GitHubIssuePublisher().publishInsightIssue({
    artifact: safeDecision.artifact,
    artifactPath,
  });

  if (!issue) throw new Error("Expected GitHub issue creation to return an issue outside dry-run mode.");

  await writeInsightIssueMetadata({
    artifactPath,
    runId: safeDecision.artifact.frontmatter.runId,
    issue,
  });
  reporter.output({ artifactPath, issueUrl: issue.url });
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
