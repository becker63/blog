import { z } from "zod";

/** Distribution blast radius (Postgres-backed operational state uses the same literals). */
export const audienceGateSchema = z.enum([
  "private_draft",
  "small_circle",
  "professional_network",
  "technical_public",
  "community_manual",
  "global_public",
]);

export type AudienceGate = z.infer<typeof audienceGateSchema>;

/** Platform / editorial channel routing for gates (HN is manual-only via matrix). */
export const gateChannelSchema = z.enum([
  "linkedin",
  "devto",
  "bluesky",
  "mastodon",
  "reddit",
  "substack",
  "hackernews",
]);

export type GateChannel = z.infer<typeof gateChannelSchema>;

export type GateDisposition =
  | "draft_only"
  | "disable"
  | "allow_connections"
  | "unlisted_or_private"
  | "allow_public_or_connections"
  | "manual_review"
  | "allow"
  | "allow_public_or_unlisted";

/** Normalized disposition per channel derived from launches.audienceGate and launch_destinations. */
export type AudienceGateMatrix = Record<AudienceGate, Record<GateChannel, GateDisposition>>;

export const audienceGateMatrix: AudienceGateMatrix = {
  private_draft: {
    linkedin: "draft_only",
    devto: "draft_only",
    bluesky: "disable",
    mastodon: "draft_only",
    reddit: "disable",
    substack: "draft_only",
    hackernews: "disable",
  },
  small_circle: {
    linkedin: "allow_connections",
    devto: "draft_only",
    bluesky: "disable",
    mastodon: "unlisted_or_private",
    reddit: "disable",
    substack: "draft_only",
    hackernews: "disable",
  },
  professional_network: {
    linkedin: "allow_public_or_connections",
    devto: "draft_only",
    bluesky: "disable",
    mastodon: "draft_only",
    reddit: "disable",
    substack: "manual_review",
    hackernews: "disable",
  },
  technical_public: {
    linkedin: "manual_review",
    devto: "allow",
    bluesky: "allow",
    mastodon: "allow_public_or_unlisted",
    reddit: "manual_review",
    substack: "manual_review",
    hackernews: "manual_review",
  },
  community_manual: {
    linkedin: "manual_review",
    devto: "manual_review",
    bluesky: "manual_review",
    mastodon: "manual_review",
    reddit: "manual_review",
    substack: "manual_review",
    hackernews: "manual_review",
  },
  global_public: {
    linkedin: "manual_review",
    devto: "allow",
    bluesky: "allow",
    mastodon: "allow",
    reddit: "manual_review",
    substack: "manual_review",
    hackernews: "manual_review",
  },
};

export const dispositionForGate = (gate: AudienceGate, channel: GateChannel): GateDisposition =>
  audienceGateMatrix[gate][channel];
