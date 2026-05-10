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
      '{ "generatedAt": "ISO timestamp", "totalSeeds": number, "whatThisSeemsToSayAboutTheWork": string, "clusters": [{ "title": string, "thesis": string, "whatIssuesAreAbout": string, "whyPatternMatters": string, "whatIsActuallyInteresting": string, "connectionToLargerWork": string, "whatToDoNext": string, "relatedSeedIds": string[], "relatedIssueNumbers": number[], "score": object, "recommendedAction": string, "rationale": string, "possiblePostTitles": string[], "nextMoves": string[] }], "staleOrLowValueSeeds": StaleSeed[] }',
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
              whatIssuesAreAbout:
                "The aggregator can see the available issues, but has not interpreted them yet.",
              whyPatternMatters:
                "This preview checks that issue collection works before spending a Cursor run.",
              whatIsActuallyInteresting:
                "The useful part is that the digest can start from issues alone.",
              connectionToLargerWork:
                "This supports the larger repo-insight goal: keep generated ideas in the review queue instead of local files.",
              whatToDoNext:
                "Run without --dry-run to ask Cursor for real clustering.",
              relatedSeedIds: seeds.slice(0, 5).map((seed) => seed.id),
              relatedIssueNumbers: seeds.map((seed) => seed.issueNumber).filter((value): value is number => Boolean(value)),
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
