import type { Launch, MetricSnapshot, Publication } from "public-proof-core";
import type { ResumeBulletSet } from "public-proof-agent";

const sum = (values: Array<number | undefined>) =>
  values.reduce((acc: number, v) => acc + (v ?? 0), 0);

export const renderLaunchReport = (input: {
  launch: Launch;
  canonicalUrl: string;
  draftProviders: string[];
  publications: Publication[];
  metrics: MetricSnapshot[];
  resumeBullets: ResumeBulletSet;
  utmLinks: Record<string, string>;
}): string => {
  const published = input.publications.filter((p) =>
    ["published", "manual"].includes(p.status),
  );
  const impressions = sum(input.metrics.map((m) => m.impressions));
  const views = sum(input.metrics.map((m) => m.views));
  const reactions = sum(input.metrics.map((m) => m.reactions));
  const comments = sum(input.metrics.map((m) => m.comments));
  const reposts = sum(input.metrics.map((m) => m.reposts));

  const lines = [
    `# Launch report: ${input.launch.title}`,
    "",
    `**Canonical URL:** ${input.canonicalUrl}`,
    `**Primary claim:** ${input.launch.primaryClaim}`,
    `**Resume claim:** ${input.launch.resumeClaim}`,
    "",
    "## Enabled platforms",
    ...input.launch.platforms
      .filter((p) => p.enabled)
      .map((p) => `- ${p.provider} (${p.mode})`),
    "",
    "## Drafts generated",
    ...input.draftProviders.map((p) => `- ${p}`),
    "",
    "## Publications",
    ...(published.length
      ? published.map((p) => `- ${p.provider}: ${p.status} ${p.url ?? ""}`)
      : ["- (none published yet)"]),
    "",
    "## Metrics aggregate",
    `- impressions: ${impressions || "n/a"}`,
    `- views: ${views || "n/a"}`,
    `- reactions: ${reactions || "n/a"}`,
    `- comments: ${comments || "n/a"}`,
    `- reposts: ${reposts || "n/a"}`,
    "",
    "## UTM links",
    ...Object.entries(input.utmLinks).map(([k, v]) => `- ${k}: ${v}`),
    "",
    "## Resume bullets",
    ...input.resumeBullets.bullets.map((b) => `- (${b.style}) ${b.text}`),
    "",
    "## Missing metrics",
    ...input.resumeBullets.bullets.flatMap((b) =>
      b.missingMetrics.length ? b.missingMetrics.map((m) => `- ${m}`) : [],
    ),
    "",
    "## Default bullet (before metrics)",
    "Built PublicProof, an Nx-integrated TypeScript publishing pipeline that converts canonical MDX posts into platform-native drafts, distributes technical writing across multiple platforms, and preserves launch artifacts for market/resume evidence.",
  ];

  if (impressions || views) {
    lines.push(
      "",
      "## Metrics bullet (template)",
      `Published and distributed ${input.launch.title}, generating ${impressions || "?"} cross-platform impressions, ${views || "?"} site visits, and ${comments + reposts || "?"} technical comments/reposts.`,
    );
  }

  return lines.join("\n");
};

export const defaultResumeBullets = (launch: Launch): ResumeBulletSet => ({
  bullets: [
    {
      style: "engineering",
      text: "Built PublicProof, an Nx-integrated TypeScript publishing pipeline that converts canonical MDX posts into platform-native drafts, distributes technical writing across multiple platforms, and preserves launch artifacts for market/resume evidence.",
      requiresMetrics: false,
      missingMetrics: [],
    },
    {
      style: "market",
      text: `Published and distributed ${launch.title} — add metrics via record-metrics for the metrics bullet.`,
      requiresMetrics: true,
      missingMetrics: ["cross-platform impressions", "site visits", "comments/reposts"],
    },
  ],
});
