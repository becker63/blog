import { insightDigestSchema } from "../model/schemas";
import { InsightDigest, InsightSeed } from "../model/types";
import { runCursorJson } from "../adapters/cursor-sdk-json";
import { buildAggregateInsightsPrompt } from "../prompting/build-aggregate-insights-prompt";

export const aggregateInsights = async (seeds: InsightSeed[]): Promise<InsightDigest> => {
  const generatedAt = new Date().toISOString();
  return runCursorJson({
    prompt: buildAggregateInsightsPrompt({ generatedAt, seeds }),
    schema: insightDigestSchema,
    model: process.env.CURSOR_MODEL ?? "composer-2",
    name: `repo-insight-digest-${generatedAt.replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z")}`,
    expectedShape:
      '{ "generatedAt": "ISO timestamp", "totalSeeds": number, "whatThisSeemsToSayAboutTheWork": string, "clusters": InsightCluster[], "staleOrLowValueSeeds": StaleSeed[] }',
  });
};

export const deterministicDigestPreview = (seeds: InsightSeed[]): InsightDigest =>
  insightDigestSchema.parse({
    generatedAt: new Date().toISOString(),
    totalSeeds: seeds.length,
    whatThisSeemsToSayAboutTheWork:
      "Dry-run mode does not call Cursor, but the collected seeds are ready for an editorial synthesis pass.",
    clusters:
      seeds.length === 0
        ? []
        : [
            {
              title: "Dry-run preview cluster",
              thesis: "Dry-run mode does not call Cursor; this preview confirms seed collection and issue rendering.",
              plainLanguageThesis: "The aggregator can see the available seeds, but has not interpreted them yet.",
              philosophicalSummary:
                "This is only a preview. It proves that the notes can be gathered into one editorial surface before asking Cursor what they seem to be circling around.",
              whatThisSaysAboutTheWork:
                "The dry-run does not make claims about the work. It only shows which seeds would be available for a real synthesis.",
              essayDirection:
                "Run without --dry-run to ask what kind of essay these seeds might become.",
              relatedSeedIds: seeds.slice(0, 5).map((seed) => seed.id),
              relatedIssueNumbers: seeds.map((seed) => seed.issueNumber).filter((value): value is number => Boolean(value)),
              relatedArtifactPaths: seeds.map((seed) => seed.artifactPath).filter((value): value is string => Boolean(value)),
              score: {
                novelty: 1,
                evidenceStrength: 1,
                profileFit: 1,
                writingPotential: 1,
                promotionReadiness: 1,
              },
              recommendedAction: "watch",
              rationale: "Dry-run preview only.",
              possiblePostTitles: seeds.slice(0, 3).map((seed) => seed.title),
              nextMoves: ["Run without --dry-run to ask Cursor for real clustering."],
            },
          ],
    staleOrLowValueSeeds: [],
  });
