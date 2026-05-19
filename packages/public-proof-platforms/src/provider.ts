import type { Launch, Publication } from "public-proof-core";
import type { DistributionSummary } from "public-proof-agent";
import type { MdxPost } from "public-proof-content";

export type ProviderCapabilities = {
  publish: boolean;
  schedule: boolean;
  fetchMetrics: boolean;
  manual: boolean;
  recommendOnly?: boolean;
};

export type PlatformDraft = {
  provider: string;
  title?: string;
  body: string;
  firstComment?: string;
  checklist?: string[];
  warnings: string[];
  metadata?: Record<string, unknown>;
};

export type RenderDraftInput = {
  launch: Launch;
  post: MdxPost;
  summary: DistributionSummary;
  canonicalUrl: string;
  utmUrl: string;
  markdown: string;
  plainText: string;
};

export type PublishInput = RenderDraftInput & {
  draft: PlatformDraft;
  confirm: boolean;
  dryRun: boolean;
  subreddit?: string;
};

export type ProviderAdapter = {
  provider: string;
  capabilities: ProviderCapabilities;
  renderDraft(input: RenderDraftInput): Promise<PlatformDraft>;
  publish?(input: PublishInput): Promise<Publication>;
  fetchMetrics?(publication: Publication): Promise<import("public-proof-core").MetricSnapshot>;
};
