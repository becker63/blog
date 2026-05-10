import { z } from "zod";
import {
  curatorDecisionSchema,
  dispatchPayloadSchema,
  evidenceItemSchema,
  forcedInsightDecisionSchema,
  authorProfileCapsuleSchema,
  insightClusterSchema,
  insightDigestSchema,
  insightSeedSchema,
  packStatsSchema,
  projectCapsuleSchema,
  repoInsightIssueDraftSchema,
  repoInsightBudgetStateSchema,
  repoInsightContextConfigSchema,
  repoInsightPollStateSchema,
  repoCatalogSchema,
  writingCorpusCapsuleSchema,
} from "./schemas";

export type DispatchPayload = z.infer<typeof dispatchPayloadSchema>;
export type RepoCatalog = z.infer<typeof repoCatalogSchema>;
export type RepoInsightPollState = z.infer<typeof repoInsightPollStateSchema>;
export type RepoInsightBudgetState = z.infer<typeof repoInsightBudgetStateSchema>;
export type RepoCatalogEntry = RepoCatalog["repos"][number];
export type EvidenceItem = z.infer<typeof evidenceItemSchema>;
export type RepoInsightIssueDraft = z.infer<typeof repoInsightIssueDraftSchema>;
export type InsightSeed = z.infer<typeof insightSeedSchema>;
export type InsightCluster = z.infer<typeof insightClusterSchema>;
export type InsightDigest = z.infer<typeof insightDigestSchema>;
export type CuratorDecision = z.infer<typeof curatorDecisionSchema>;
export type ForcedInsightDecision = z.infer<typeof forcedInsightDecisionSchema>;
export type PackStats = z.infer<typeof packStatsSchema>;
export type ProjectCapsule = z.infer<typeof projectCapsuleSchema>;
export type RepoInsightContextConfig = z.infer<typeof repoInsightContextConfigSchema>;
export type WritingCorpusCapsule = z.infer<typeof writingCorpusCapsuleSchema>;
export type AuthorProfileCapsule = z.infer<typeof authorProfileCapsuleSchema>;

export type InsightWakeReason = "scheduled-poll" | "manual-force" | "manual-normal";

export type RepoSelectionSummary = {
  mode: "uniform" | "latest" | "pinned";
  randomSeed?: string;
  candidateRepoCount: number;
  selectedRepoCount: number;
  changedRepoCount: number;
  selectedRepos: string[];
  changedRepos: string[];
  wakeReason: InsightWakeReason;
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
  activitySignal: {
    wakeReason: InsightWakeReason;
    changedRepos: string[];
    note: string;
  };
  selection: RepoSelectionSummary;
  capsules: ProjectCapsule[];
  mode: "discretionary" | "force";
};
