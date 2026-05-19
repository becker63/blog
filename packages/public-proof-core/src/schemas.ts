import { z } from "zod";

export const platformProviderSchema = z.enum([
  "website",
  "linkedin",
  "devto",
  "bluesky",
  "mastodon",
  "reddit",
  "substack",
]);

export const platformPlanSchema = z.object({
  provider: platformProviderSchema,
  enabled: z.boolean(),
  mode: z.enum(["api", "manual", "recommendation"]),
  scheduledFor: z.string().optional(),
  publishAsDraft: z.boolean().optional(),
});

export const launchSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  postSlug: z.string().min(1),
  canonicalPath: z.string().min(1),
  campaign: z.string().min(1),
  primaryClaim: z.string().min(1),
  resumeClaim: z.string().min(1),
  platforms: z.array(platformPlanSchema),
});

export const publicationStatusSchema = z.enum([
  "draft",
  "planned",
  "scheduled",
  "published",
  "manual",
  "failed",
  "skipped",
]);

export const publicationSchema = z.object({
  id: z.string().min(1),
  launchId: z.string().min(1),
  provider: z.string().min(1),
  status: publicationStatusSchema,
  url: z.string().url().optional(),
  platformPostId: z.string().optional(),
  platformMetadata: z.record(z.string(), z.unknown()).optional(),
  publishedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const publicationsFileSchema = z.object({
  publications: z.array(publicationSchema),
});

export const metricSnapshotSchema = z.object({
  publicationId: z.string().min(1),
  capturedAt: z.string(),
  source: z.enum(["api", "manual", "screenshot", "vercel", "posthog"]),
  impressions: z.number().optional(),
  views: z.number().optional(),
  reactions: z.number().optional(),
  comments: z.number().optional(),
  reposts: z.number().optional(),
  clicks: z.number().optional(),
  saves: z.number().optional(),
  profileViews: z.number().optional(),
  followersDelta: z.number().optional(),
  notes: z.string().optional(),
  screenshotPath: z.string().optional(),
});

export const utmLinksSchema = z.record(z.string(), z.string());

export type Launch = z.infer<typeof launchSchema>;
export type PlatformPlan = z.infer<typeof platformPlanSchema>;
export type Publication = z.infer<typeof publicationSchema>;
export type MetricSnapshot = z.infer<typeof metricSnapshotSchema>;
