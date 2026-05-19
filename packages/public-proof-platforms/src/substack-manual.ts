import type { ProviderAdapter } from "./provider";

export const substackManualProvider: ProviderAdapter = {
  provider: "substack",
  capabilities: { publish: false, schedule: false, fetchMetrics: false, manual: true },
  async renderDraft({ launch, summary, utmUrl, markdown }) {
    return {
      provider: "substack",
      title: launch.title,
      body: `${markdown}\n\n---\n\nRead on the site: ${utmUrl}`,
      checklist: [
        "Create Substack draft from generated Markdown",
        "Set canonical link in footer",
        "Do not use browser automation",
      ],
      warnings: ["Substack v1 is manual only."],
    };
  },
};
