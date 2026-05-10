import { aggregateDecisionSchema } from "../model/schemas";
import { AggregateDecision, AuthorProfileCapsule, InsightSeed, WritingCorpusCapsule } from "../model/types";
import { runCursorJson } from "../adapters/cursor-sdk-json";
import { buildAggregateInsightsPrompt } from "../prompting/build-aggregate-insights-prompt";

export type AggregateInsightsContext = {
  tasteProfile: string;
  writingCorpus: WritingCorpusCapsule;
  authorProfile: AuthorProfileCapsule;
};

export const aggregateInsights = async (
  seeds: InsightSeed[],
  ctx: AggregateInsightsContext,
  options: {
    onUsageEstimate?: (event: { inputChars: number; outputChars: number; model: string; name: string }) => void;
  } = {},
): Promise<AggregateDecision> => {
  const generatedAt = new Date().toISOString();
  const expectedShape =
    '{ "kind": "digest", "digest": { ... InsightDigest ... } } OR { "kind": "no_digest_update", "reason": string, "weakPatterns": string[], "suggestedIssueActions?" }';
  return runCursorJson({
    prompt: buildAggregateInsightsPrompt({ generatedAt, seeds, ...ctx }),
    schema: aggregateDecisionSchema,
    model: process.env.CURSOR_MODEL ?? "composer-2",
    name: `repo-insight-digest-${generatedAt.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    expectedShape,
    onUsageEstimate: options.onUsageEstimate,
  });
};

/** Used when `--dry-run` runs without CURSOR_API_KEY (no editorial model call possible). */
export const deterministicDryRunWithoutCursorDecision = (_seeds: InsightSeed[]): AggregateDecision =>
  aggregateDecisionSchema.parse({
    kind: "no_digest_update",
    reason:
      "Dry-run did not call Cursor (CURSOR_API_KEY is unset). Set CURSOR_API_KEY locally to preview the editorial gate without publishing a digest update.",
    weakPatterns: [],
    suggestedIssueActions: undefined,
  });
