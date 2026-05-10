import { InsightDigest, InsightSeed } from "../model/types";
import { digestIssueMarker, digestIssueTitle } from "./github-digest-issue";

const list = (items: string[]) => (items.length ? items.map((item) => `- ${item}`).join("\n") : "- none");

const seedLabel = (seed: InsightSeed) => {
  const issue = seed.issueNumber ? `#${seed.issueNumber} — ` : "";
  return `${issue}${seed.title}`;
};

const relatedSeeds = (digestSeedIds: string[], seedsById: Map<string, InsightSeed>) =>
  digestSeedIds
    .map((id) => seedsById.get(id))
    .filter((seed): seed is InsightSeed => Boolean(seed))
    .map((seed) => `- ${seedLabel(seed)}`)
    .join("\n") || "- none";

const scoreRows = (score: InsightDigest["clusters"][number]["score"]) =>
  [
    "| Dimension | Score |",
    "|---|---:|",
    `| Novelty | ${score.novelty}/5 |`,
    `| Evidence strength | ${score.evidenceStrength}/5 |`,
    `| Profile fit | ${score.profileFit}/5 |`,
    `| Writing potential | ${score.writingPotential}/5 |`,
    `| Promotion readiness | ${score.promotionReadiness}/5 |`,
  ].join("\n");

export const renderDigestIssue = ({ digest, seeds }: { digest: InsightDigest; seeds: InsightSeed[] }) => {
  const seedsById = new Map(seeds.map((seed) => [seed.id, seed]));
  const promotions = digest.clusters.filter((cluster) => cluster.recommendedAction === "promote").length;
  const watchlist = digest.clusters.filter((cluster) => cluster.recommendedAction === "watch").length;

  return [
    `# ${digestIssueTitle}`,
    "",
    `Generated: ${digest.generatedAt}`,
    "",
    "## Summary",
    "",
    `- Total seeds inspected: ${digest.totalSeeds}`,
    `- Strong clusters: ${digest.clusters.length}`,
    `- Recommended promotions: ${promotions}`,
    `- Watchlist: ${watchlist}`,
    "",
    "## What this seems to say about the work",
    "",
    digest.whatThisSeemsToSayAboutTheWork,
    "",
    "## Strongest emerging themes",
    "",
    ...(digest.clusters.length
      ? digest.clusters.flatMap((cluster, index) => [
          `### ${index + 1}. ${cluster.title}`,
          "",
          cluster.plainLanguageThesis,
          "",
          cluster.philosophicalSummary,
          "",
          "**What this says about the work**",
          "",
          cluster.whatThisSaysAboutTheWork,
          "",
          "**What kind of essay it could become**",
          "",
          cluster.essayDirection,
          "",
          "**Related seeds**",
          "",
          relatedSeeds(cluster.relatedSeedIds, seedsById),
          ...cluster.relatedArtifactPaths.map((artifactPath) => `- ${artifactPath}`),
          "",
          "**Scores**",
          "",
          scoreRows(cluster.score),
          "",
          "**Editorial rationale**",
          "",
          cluster.rationale,
          "",
          "**Possible post titles**",
          "",
          list(cluster.possiblePostTitles),
          "",
          "**Next moves**",
          "",
          list(cluster.nextMoves),
          "",
          `**Recommended action:** ${cluster.recommendedAction}`,
          "",
        ])
      : ["No clusters found yet.", ""]),
    "## Low-value or stale seeds",
    "",
    ...(digest.staleOrLowValueSeeds.length
      ? digest.staleOrLowValueSeeds.map(
          (seed) => `- ${seed.seedId} — ${seed.reason} — ${seed.recommendedAction}`,
        )
      : ["- none"]),
    "",
    "## Review actions",
    "",
    "- [ ] Promote top cluster into a draft",
    "- [ ] Merge related generated issues",
    "- [ ] Close stale generated issues",
    "- [ ] Leave digest open for next aggregation pass",
    "",
    digestIssueMarker,
    "",
  ].join("\n");
};
