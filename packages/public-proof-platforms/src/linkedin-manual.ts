import type { ProviderAdapter } from "./provider";

export const linkedinManualProvider: ProviderAdapter = {
  provider: "linkedin",
  capabilities: { publish: false, schedule: false, fetchMetrics: false, manual: true },
  async renderDraft({ launch, summary, utmUrl, post }) {
    const body = [
      summary.shortSummary,
      "",
      `Read the full case study: ${utmUrl}`,
      "",
      `#${launch.campaign.replace(/_/g, "")}`,
    ].join("\n");
    return {
      provider: "linkedin",
      body,
      firstComment: `Canonical link: ${utmUrl}`,
      checklist: [
        "Paste post into LinkedIn composer",
        "Add first comment with UTM link",
        "Record final post URL via public-proof record-publication",
      ],
      warnings: ["LinkedIn v1 is manual only — no API publish."],
    };
  },
};
