import { splitIntoThread } from "public-proof-content";
import type { ProviderAdapter } from "./provider";

const nowIso = () => new Date().toISOString();

export const blueskyProvider: ProviderAdapter = {
  provider: "bluesky",
  capabilities: { publish: true, schedule: false, fetchMetrics: false, manual: false },
  async renderDraft({ summary, utmUrl }) {
    const thread = splitIntoThread(`${summary.shortSummary}\n\n${utmUrl}`, 300);
    const body =
      thread.length > 1
        ? thread.map((chunk, i) => `${i + 1}/${thread.length} ${chunk.text}`).join("\n\n---\n\n")
        : thread[0]?.text ?? summary.shortSummary;
    return {
      provider: "bluesky",
      body,
      warnings: thread.some((c) => c.charCount > 300)
        ? ["Some thread chunks exceed 300 chars — review before posting."]
        : [],
      metadata: { thread },
    };
  },
  async publish({ launch, draft, confirm, dryRun }) {
    const id = `${launch.id}-bluesky`;
    if (dryRun || !confirm) {
      return {
        id,
        launchId: launch.id,
        provider: "bluesky",
        status: "planned",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        platformMetadata: { dryRun: true },
      };
    }
    const handle = process.env.BLUESKY_HANDLE;
    const appPassword = process.env.BLUESKY_APP_PASSWORD;
    if (!handle || !appPassword) {
      throw new Error("BLUESKY_HANDLE and BLUESKY_APP_PASSWORD are required to publish");
    }
    // Minimal ATProto post — production would use @atproto/api
    void handle;
    void appPassword;
    void draft;
    throw new Error(
      "Bluesky publish is configured but requires @atproto/api wiring; use dry-run until credentials are validated.",
    );
  },
};
