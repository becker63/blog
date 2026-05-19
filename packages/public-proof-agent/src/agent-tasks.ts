import { z } from "zod";
import {
  buildPlatformVariantsPrompt,
  platformVariantsExpectedShape,
} from "./prompts/platform-variants";
import {
  buildRedditRankerPrompt,
  redditRankerExpectedShape,
} from "./prompts/reddit-ranker";
import {
  buildResumeBulletsPrompt,
  resumeBulletsExpectedShape,
} from "./prompts/resume-bullets";
import {
  buildSummarizePostPrompt,
  summarizePostExpectedShape,
} from "./prompts/summarize-post";
import {
  distributionSummarySchema,
  platformVariantSetSchema,
  redditRecommendationSetSchema,
  resumeBulletSetSchema,
  type DistributionSummary,
  type PlatformVariantSet,
  type RedditRecommendationSet,
  type ResumeBulletSet,
} from "./schemas";
import {
  runPublicProofAgentJson,
  type UsageEstimate,
} from "./cursor-json";
import { runPublicProofAgentJsonTraced } from "./cursor-json-traced";

const PG_LAUNCH_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const runCursorJsonWithOptionalTrace = async <Schema extends z.ZodTypeAny>(opts: {
  launchId?: string | null;
  taskName: string;
  prompt: string;
  schema: Schema;
  expectedShape?: string;
  model?: string;
  onUsageEstimate?: (usage: UsageEstimate) => void;
}): Promise<z.infer<Schema>> => {
  const { launchId, taskName, onUsageEstimate, prompt, schema, expectedShape, model } = opts;
  const traceLaunchPk =
    typeof launchId === "string" && PG_LAUNCH_UUID.test(launchId) ? launchId : undefined;
  const traced =
    traceLaunchPk != null
      ? runPublicProofAgentJsonTraced({
          launchId: traceLaunchPk,
          taskName,
          prompt,
          schema,
          expectedShape,
          model,
          onUsageEstimate,
        })
      : null;

  return (
    traced ??
    runPublicProofAgentJson({
      name: taskName,
      prompt,
      schema,
      expectedShape,
      model,
      onUsageEstimate,
    })
  );
};

export const summarizePostForDistribution = async (
  input: {
    title: string;
    description: string;
    tags: string[];
    canonicalUrl: string;
    plainTextBody: string;
  },
  onUsageEstimate?: (usage: UsageEstimate) => void,
  /** When this is a Postgres `launches.id` UUID, traces persist under that FK (non-UUID values are ignored). */
  launchId?: string | null,
): Promise<DistributionSummary> =>
  runCursorJsonWithOptionalTrace({
    launchId,
    taskName: "public-proof-summarize-post",
    prompt: buildSummarizePostPrompt(input),
    schema: distributionSummarySchema,
    expectedShape: summarizePostExpectedShape,
    onUsageEstimate,
  });

export const generatePlatformVariants = async (
  input: {
    summary: DistributionSummary;
    utmLinks: Record<string, string>;
    platforms: string[];
  },
  onUsageEstimate?: (usage: UsageEstimate) => void,
  /** Postgres launch UUID only (see summarizePostForDistribution). */
  launchId?: string | null,
): Promise<PlatformVariantSet> =>
  runCursorJsonWithOptionalTrace({
    launchId,
    taskName: "public-proof-platform-variants",
    prompt: buildPlatformVariantsPrompt(input),
    schema: platformVariantSetSchema,
    expectedShape: platformVariantsExpectedShape,
    onUsageEstimate,
  });

export const rankSubreddits = async (
  input: {
    summary: DistributionSummary;
    candidates: Array<Record<string, unknown>>;
  },
  onUsageEstimate?: (usage: UsageEstimate) => void,
  /** Postgres launch UUID only (see summarizePostForDistribution). */
  launchId?: string | null,
): Promise<RedditRecommendationSet> =>
  runCursorJsonWithOptionalTrace({
    launchId,
    taskName: "public-proof-reddit-ranker",
    prompt: buildRedditRankerPrompt(input),
    schema: redditRecommendationSetSchema,
    expectedShape: redditRankerExpectedShape,
    onUsageEstimate,
  });

export const generateResumeBullets = async (
  input: {
    launch: unknown;
    publications: unknown[];
    metrics: unknown[];
  },
  onUsageEstimate?: (usage: UsageEstimate) => void,
  /** Postgres launch UUID only (see summarizePostForDistribution). */
  launchId?: string | null,
): Promise<ResumeBulletSet> =>
  runCursorJsonWithOptionalTrace({
    launchId,
    taskName: "public-proof-resume-bullets",
    prompt: buildResumeBulletsPrompt(input),
    schema: resumeBulletSetSchema,
    expectedShape: resumeBulletsExpectedShape,
    onUsageEstimate,
  });
