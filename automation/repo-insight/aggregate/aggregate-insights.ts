import { insightClusterSchema, insightDigestSchema } from "../model/schemas";
import { AuthorProfileCapsule, InsightDigest, InsightSeed, WritingCorpusCapsule } from "../model/types";
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
): Promise<InsightDigest> => {
  const generatedAt = new Date().toISOString();
  return runCursorJson({
    prompt: buildAggregateInsightsPrompt({ generatedAt, seeds, ...ctx }),
    schema: insightDigestSchema,
    model: process.env.CURSOR_MODEL ?? "composer-2",
    name: `repo-insight-digest-${generatedAt.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    expectedShape: "One InsightDigest JSON object: generatedAt, totalSeeds, whatThisSeemsToSayAboutTheWork, editorialDecisions[], clusters[] (min 1), staleOrLowValueSeeds.",
    onUsageEstimate: options.onUsageEstimate,
  });
};

const previewCluster = (seeds: InsightSeed[]) =>
  insightClusterSchema.parse({
    title: "Dry-run placeholder (no model)",
    thesis: "CURSOR_API_KEY was not set; install the key locally to run the real digest model.",
    whatIssuesAreAbout: "Seed list is available; no interpretation was performed.",
    whyPatternMatters: "Dry run validates GitHub + rendering only.",
    whatIsActuallyInteresting: "Nothing yet — this is a stub cluster.",
    connectionToLargerWork: "Run with CURSOR_API_KEY for corpus-aware clustering.",
    whatToDoNext: "Re-run `pnpm aggregate-insights:dry-run` with API credentials.",
    relatedSeedIds: seeds.slice(0, 5).map((s) => s.id),
    relatedIssueNumbers: seeds.map((s) => s.issueNumber).filter((n): n is number => Boolean(n)),
    score: { novelty: 1, evidenceStrength: 1, profileFit: 1, writingPotential: 1, promotionReadiness: 1 },
    editorialDecision: "watch",
    whyThisIsOrIsNotInteresting: "Placeholder only.",
    whatWouldMakeItStronger: "Run the aggregator with Cursor.",
    profileConnection: "Not evaluated in this mode.",
    rationale: "Deterministic dry-run stub.",
    possiblePostTitles: [],
    nextMoves: ["Configure CURSOR_API_KEY and re-run to produce a real digest."],
  });

/** Used when `--dry-run` runs without CURSOR_API_KEY (no model call). */
export const deterministicDigestPreviewWithoutCursor = (seeds: InsightSeed[]): InsightDigest =>
  insightDigestSchema.parse({
    generatedAt: new Date().toISOString(),
    totalSeeds: seeds.length,
    whatThisSeemsToSayAboutTheWork:
      "Dry-run without CURSOR_API_KEY: seeds were collected but the editorial model did not run. Set the key to evaluate a real digest locally.",
    editorialDecisions: [
      "This body is a placeholder — configure CURSOR_API_KEY to generate an actionable digest.",
      `Collected ${seeds.length} seed issue(s) for the next real run.`,
    ],
    clusters: [previewCluster(seeds)],
    staleOrLowValueSeeds: [],
  });
