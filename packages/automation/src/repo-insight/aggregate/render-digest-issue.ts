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

const duplicateBlock = (duplicateOfIssueNumbers?: number[]) =>
  duplicateOfIssueNumbers?.length
    ? [
        "**Duplicate / merge group hints**",
        "",
        `- Issues #: ${duplicateOfIssueNumbers.join(", ")}`,
        "",
      ].join("\n")
    : "";

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
  const promotes = digest.clusters.filter((cluster) => cluster.editorialDecision === "promote").length;
  const watchlist = digest.clusters.filter((cluster) => cluster.editorialDecision === "watch").length;
  const mergeOrClose =
    digest.clusters.filter((c) => c.editorialDecision === "merge" || c.editorialDecision === "close").length;

  return [
    `# ${digestIssueTitle}`,
    "",
    `Generated: ${digest.generatedAt}`,
    "",
    "## Editorial decisions",
    "",
    list(digest.editorialDecisions),
    "",
    "## Summary",
    "",
    `- Total seeds inspected: ${digest.totalSeeds}`,
    `- Strong clusters rendered: ${digest.clusters.length}`,
    `- Editorial promote: ${promotes} • watch: ${watchlist} • merge/close: ${mergeOrClose}`,
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
          cluster.thesis,
          "",
          "**What these issues are about**",
          "",
          cluster.whatIssuesAreAbout,
          "",
          "**Why the pattern matters**",
          "",
          cluster.whyPatternMatters,
          "",
          "**What is actually interesting here**",
          "",
          cluster.whatIsActuallyInteresting,
          "",
          "**How this connects to Taylor's larger work**",
          "",
          cluster.connectionToLargerWork,
          "",
          "**Profile connection**",
          "",
          cluster.profileConnection,
          "",
          "**What to do next**",
          "",
          cluster.whatToDoNext,
          "",
          "**Interesting or not — why**",
          "",
          cluster.whyThisIsOrIsNotInteresting,
          "",
          "**What would make it stronger**",
          "",
          cluster.whatWouldMakeItStronger,
          "",
          "**Related issues**",
          "",
          relatedSeeds(cluster.relatedSeedIds, seedsById),
          "",
          duplicateBlock(cluster.duplicateOfIssueNumbers),
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
          `**Cluster editorial decision:** ${cluster.editorialDecision}`,
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
    "- [ ] Execute editorial decisions above",
    "- [ ] Merge or close duplicates or weak variants called out above",
    "- [ ] Leave digest open for the next aggregation pass",
    "",
    digestIssueMarker,
    "",
  ].join("\n");
};
