import { z } from "zod";

export const distributionSummarySchema = z.object({
  primaryClaim: z.string(),
  technicalTopics: z.array(z.string()),
  audienceTags: z.array(z.string()),
  shortSummary: z.string(),
  longSummary: z.string(),
  caveats: z.array(z.string()),
  suggestedHooks: z.array(z.string()),
});

export const platformVariantSetSchema = z.object({
  variants: z.array(
    z.object({
      platform: z.string(),
      title: z.string().optional(),
      body: z.string(),
      firstComment: z.string().optional(),
      warnings: z.array(z.string()),
    }),
  ),
});

export const redditRecommendationSetSchema = z.object({
  recommendations: z.array(
    z.object({
      subreddit: z.string(),
      url: z.string(),
      score: z.number(),
      reason: z.string(),
      audienceFit: z.string(),
      ruleRisk: z.enum(["low", "medium", "high", "unknown"]),
      selfPromotionRisk: z.enum(["low", "medium", "high", "unknown"]),
      recommendedAction: z.enum(["skip", "manual_review", "submit_candidate"]),
      suggestedTitle: z.string(),
      suggestedBody: z.string(),
      notes: z.array(z.string()),
    }),
  ),
});

export const resumeBulletSetSchema = z.object({
  bullets: z.array(
    z.object({
      style: z.enum(["engineering", "market", "combined"]),
      text: z.string(),
      requiresMetrics: z.boolean(),
      missingMetrics: z.array(z.string()),
    }),
  ),
});

export type DistributionSummary = z.infer<typeof distributionSummarySchema>;
export type PlatformVariantSet = z.infer<typeof platformVariantSetSchema>;
export type RedditRecommendationSet = z.infer<typeof redditRecommendationSetSchema>;
export type ResumeBulletSet = z.infer<typeof resumeBulletSetSchema>;
