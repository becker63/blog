import type { ProviderAdapter, PlatformDraft } from "./provider";
import type { Publication } from "public-proof-core";

const nowIso = () => new Date().toISOString();

export const devtoProvider: ProviderAdapter = {
  provider: "devto",
  capabilities: { publish: true, schedule: false, fetchMetrics: false, manual: false },
  async renderDraft({ launch, markdown, utmUrl, summary }) {
    return {
      provider: "devto",
      title: launch.title,
      body: `${markdown}\n\n---\n\nOriginally published at [becker63.digital](${utmUrl}).`,
      warnings: summary.caveats,
      metadata: { canonical_url: utmUrl },
    };
  },
  async publish({ launch, draft, confirm, dryRun }) {
    const id = `${launch.id}-devto`;
    if (dryRun || !confirm) {
      return {
        id,
        launchId: launch.id,
        provider: "devto",
        status: "planned",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        platformMetadata: { dryRun: true, draft },
      };
    }
    const apiKey = process.env.DEVTO_API_KEY;
    if (!apiKey) {
      throw new Error("DEVTO_API_KEY is required to publish to DEV.to");
    }
    const response = await fetch("https://dev.to/api/articles", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        article: {
          title: draft.title ?? launch.title,
          body_markdown: draft.body,
          published: !launch.platforms.find((p) => p.provider === "devto")?.publishAsDraft,
          canonical_url: (draft.metadata?.canonical_url as string) ?? undefined,
        },
      }),
    });
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`DEV.to publish failed (${response.status}): ${text}`);
    }
    const data = (await response.json()) as { id: number; url: string };
    return {
      id,
      launchId: launch.id,
      provider: "devto",
      status: "published",
      url: data.url,
      platformPostId: String(data.id),
      publishedAt: nowIso(),
      createdAt: nowIso(),
      updatedAt: nowIso(),
    };
  },
};

export const validateDevtoDraft = (draft: PlatformDraft) => {
  if (draft.body.length > 100_000) {
    throw new Error("DEV.to draft exceeds safe length");
  }
};
