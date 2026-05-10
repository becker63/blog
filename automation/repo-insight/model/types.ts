import { z } from "zod";
import {
  curatorDecisionSchema,
  dispatchPayloadSchema,
  evidenceItemSchema,
  forcedInsightDecisionSchema,
  authorProfileCapsuleSchema,
  insightArtifactSchema,
  insightClusterSchema,
  insightDigestSchema,
  insightFrontmatterSchema,
  insightIndexSchema,
  insightSeedSchema,
  packStatsSchema,
  projectCapsuleSchema,
  repoInsightContextConfigSchema,
  repoInsightPollStateSchema,
  repoCatalogSchema,
  writingCorpusCapsuleSchema,
} from "./schemas";

export type DispatchPayload = z.infer<typeof dispatchPayloadSchema>;
export type RepoCatalog = z.infer<typeof repoCatalogSchema>;
export type RepoInsightPollState = z.infer<typeof repoInsightPollStateSchema>;
export type RepoCatalogEntry = RepoCatalog["repos"][number];
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type InsightFrontmatter = z.infer<typeof insightFrontmatterSchema>;
export type InsightArtifact = z.infer<typeof insightArtifactSchema>;
export type InsightSeed = z.infer<typeof insightSeedSchema>;
export type InsightCluster = z.infer<typeof insightClusterSchema>;
export type InsightDigest = z.infer<typeof insightDigestSchema>;
export type CuratorDecision = z.infer<typeof curatorDecisionSchema>;
export type ForcedInsightDecision = z.infer<typeof forcedInsightDecisionSchema>;
export type InsightIndex = z.infer<typeof insightIndexSchema>;
export type PackStats = z.infer<typeof packStatsSchema>;
export type ProjectCapsule = z.infer<typeof projectCapsuleSchema>;
export type RepoInsightContextConfig = z.infer<typeof repoInsightContextConfigSchema>;
export type WritingCorpusCapsule = z.infer<typeof writingCorpusCapsuleSchema>;
export type AuthorProfileCapsule = z.infer<typeof authorProfileCapsuleSchema>;

export type InsightRunTrigger = {
  kind: "poll";
  repo: string;
  branch?: string;
  pushedAt?: string;
  lastSeenSha?: string;
  lastSeenAt?: string;
  before?: string;
  after?: string;
  pusher?: string;
  eventType?: string;
  changedFiles?: string[];
  note?: string;
};

export type RepoEvidenceBundle = {
  repo: string;
  events: unknown[];
  commits: Array<{
    sha: string;
    message: string;
    url?: string;
  }>;
  files: Array<{
    path: string;
    changeType?: string;
    excerpt?: string;
  }>;
  contextFiles: Array<{
    path: string;
    reason: string;
    excerpt?: string;
  }>;
  notes: string[];
};

export type CuratorInput = {
  runId: string;
  generatedAt: string;
  tasteProfile: string;
  writingCorpus: WritingCorpusCapsule;
  authorProfile: AuthorProfileCapsule;
  previousInsightTitles: string[];
  trigger: InsightRunTrigger;
  capsules: ProjectCapsule[];
  mode: "discretionary" | "force";
};
