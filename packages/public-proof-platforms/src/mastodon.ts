import { splitIntoThread } from "public-proof-content";
import type { ProviderAdapter } from "./provider";

const nowIso = () => new Date().toISOString();

export const mastodonProvider: ProviderAdapter = {
  provider: "mastodon",
  capabilities: { publish: true, schedule: true, fetchMetrics: false, manual: false },
  async renderDraft({ summary, utmUrl }) {
    const thread = splitIntoThread(`${summary.shortSummary}\n\n${utmUrl}`, 500);
    const body = thread.map((c) => c.text).join("\n\n");
    return {
      provider: "mastodon",
      body,
      warnings: [],
      metadata: { thread, scheduledFor: undefined },
    };
  },
  async publish({ launch, draft, confirm, dryRun }) {
    const id = `${launch.id}-mastodon`;
    if (dryRun || !confirm) {
      return {
        id,
        launchId: launch.id,
        provider: "mastodon",
        status: "planned",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        platformMetadata: { dryRun: true },
      };
    }
    const baseUrl = process.env.MASTODON_INSTANCE_URL;
    const token = process.env.MASTODON_ACCESS_TOKEN;
    if (!baseUrl || !token) {
      throw new Error("MASTODON_INSTANCE_URL and MASTODON_ACCESS_TOKEN are required");
    }
    const response = await fetch(`${baseUrl.replace(/\/$/, "")}/api/v1/statuses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ status: draft.body }),
    });
    if (!response.ok) {
      throw new Error(`Mastodon publish failed (${response.status}): ${await response.text()}`);
    }
    const data = (await response.json()) as { id: string; url: string };
    return {
      id,
      launchId: launch.id,
      provider: "mastodon",
      status: "published",
      url: data.url,
      platformPostId: data.id,
      publishedAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
  },
};
