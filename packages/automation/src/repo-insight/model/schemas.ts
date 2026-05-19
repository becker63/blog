import { z } from "zod";

const isoDateString = z.string().refine((value) => !Number.isNaN(Date.parse(value)), {
  message: "Expected an ISO-compatible date string",
});

const shaString = z.string().regex(/^[0-9a-f]{7,40}$/i, "Expected a git SHA");
const repoFullName = z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/);

export const dispatchPayloadSchema = z.object({
  repo: repoFullName,
  before: shaString,
  after: shaString,
  branch: z.string().min(1),
  pusher: z.string().min(1).optional(),
  eventType: z.string().min(1).default("push"),
  changedFiles: z.array(z.string().min(1)).optional(),
});

export const repoCatalogSchema = z.object({
  schemaVersion: z.literal(1),
  repos: z.array(
    z.object({
      fullName: repoFullName,
      defaultBranch: z.string().min(1).optional(),
      enabled: z.boolean().default(true),
      visibility: z.enum(["public", "private"]).optional(),
      localPath: z.string().optional(),
      topics: z.array(z.string()).default([]),
      writingThemes: z.array(z.string()).default([]),
      safeToQuote: z.boolean().default(false),
      includeForks: z.boolean().optional(),
      pinned: z.boolean().default(false),
      selectionWeight: z.number().positive().optional(),
      ignorePatterns: z.array(z.string()).default([]),
      maxPackBytes: z.number().int().positive().optional(),
      inspect: z
        .object({
          githubApi: z.boolean().default(true),
          checkout: z.boolean().default(false),
          maxFiles: z.number().int().positive().optional(),
          maxBytesPerFile: z.number().int().positive().optional(),
          maxTotalBytes: z.number().int().positive().optional(),
        })
        .default({
          githubApi: true,
          checkout: false,
        }),
    }),
  ),
});

export const repoInsightPollStateSchema = z.object({
  schemaVersion: z.literal(1),
  updatedAt: isoDateString,
  repos: z.record(
    repoFullName,
    z.object({
      pushedAt: isoDateString,
      defaultBranch: z.string().min(1),
      lastSeenSha: z.string().min(7).optional(),
      lastSeenAt: isoDateString,
    }),
  ),
});

export const repoInsightBudgetDaySchema = z.object({
  producerScheduledRuns: z.number().int().nonnegative().default(0),
  producerManualRuns: z.number().int().nonnegative().default(0),
  aggregatorRuns: z.number().int().nonnegative().default(0),
  estimatedInputTokens: z.number().int().nonnegative().default(0),
  estimatedOutputTokens: z.number().int().nonnegative().default(0),
  lastProducerRunAt: isoDateString.optional(),
  lastAggregatorRunAt: isoDateString.optional(),
});

export const repoInsightBudgetStateSchema = z.object({
  schemaVersion: z.literal(1),
  days: z.record(z.string().regex(/^\d{4}-\d{2}-\d{2}$/), repoInsightBudgetDaySchema),
});

export const packStatsSchema = z.object({
  byteCount: z.number().int().nonnegative(),
  truncated: z.boolean(),
  includedFileCount: z.number().int().nonnegative(),
  ignoredFileCount: z.number().int().nonnegative(),
});

export const projectCapsuleSchema = z.object({
  repo: repoFullName,
  generatedAt: isoDateString,
  purpose: z.string().min(1),
  currentShape: z.string().min(1),
  recentActivitySignals: z.array(z.string()).default([]),
  importantFiles: z.array(z.string()).default([]),
  recurringThemes: z.array(z.string()).default([]),
  technicalTensions: z.array(z.string()).default([]),
  possibleWritingAngles: z.array(z.string()).default([]),
  evidencePointers: z.array(z.string()).default([]),
  uncertainty: z.string().min(1),
  packStats: packStatsSchema,
});

const contextSourceSchema = z.object({
  name: z.string().min(1),
  path: z.string().min(1),
  enabled: z.boolean().default(true),
});

export const repoInsightContextConfigSchema = z.object({
  externalWritingRoots: z
    .array(
      contextSourceSchema.extend({
        include: z.array(z.string().min(1)).default(["*.mdx", "*.md", "README.md"]),
      }),
    )
    .default([]),
  externalProfileFiles: z.array(contextSourceSchema).default([]),
});

export const writingCorpusCapsuleSchema = z.object({
  sourceNames: z.array(z.string().min(1)).default([]),
  recurringThemes: z.array(z.string().min(1)).default([]),
  strongClaims: z.array(z.string().min(1)).default([]),
  favoriteConcepts: z.array(z.string().min(1)).default([]),
  voiceNotes: z.array(z.string().min(1)).default([]),
  existingPostMap: z.array(z.object({ title: z.string().min(1), path: z.string().min(1), summary: z.string().min(1) })).default([]),
  overusedIdeasToAvoid: z.array(z.string().min(1)).default([]),
  openThreads: z.array(z.string().min(1)).default([]),
  representativeHooks: z.array(z.string().min(1)).default([]),
});

export const authorProfileCapsuleSchema = z.object({
  sourceNames: z.array(z.string().min(1)).default([]),
  publicPositioning: z.array(z.string().min(1)).default([]),
  targetLanes: z.array(z.string().min(1)).default([]),
  proofPoints: z.array(z.string().min(1)).default([]),
  recurringStrengths: z.array(z.string().min(1)).default([]),
  marketNarrative: z.array(z.string().min(1)).default([]),
  projectsToConnect: z.array(z.string().min(1)).default([]),
  avoidFraming: z.array(z.string().min(1)).default([]),
  preferredFraming: z.array(z.string().min(1)).default([]),
  storyBankHighlights: z.array(z.string().min(1)).default([]),
});

export const evidenceItemSchema = z.object({
  repo: repoFullName,
  commit: z.string().min(7).optional(),
  path: z.string().min(1).optional(),
  quote: z.string().min(1).optional(),
  summary: z.string().min(1),
});

export const repoInsightIssueDraftSchema = z.object({
  title: z.string().min(8),
  sourceRepos: z.array(repoFullName).min(1),
  relatedCommits: z.array(z.string().regex(/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+@[0-9a-f]{7,40}$/i)).min(1),
  hiddenThesis: z.string().min(20),
  whySelected: z.string().min(40),
  whatChanged: z.string().min(40),
  evidence: z.array(evidenceItemSchema).min(1),
  possibleHooks: z.array(z.string().min(10)).min(1),
  relationToPreviousWriting: z.string().min(20),
  followUpQuestions: z.array(z.string().min(10)).min(1),
  reviewActions: z.array(z.string().min(5)).default([
    "Promote into a real post",
    "Merge with another generated issue",
    "Leave open and watch for more evidence",
    "Close as not useful",
  ]),
  runId: z.string().min(8),
  generatedAt: isoDateString,
  confidence: z.enum(["low", "medium", "high"]),
});

export const insightSeedSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  source: z.literal("issue"),
  issueNumber: z.number().int().positive().optional(),
  issueUrl: z.string().url().optional(),
  createdAt: isoDateString.optional(),
  sourceRepos: z.array(repoFullName).default([]),
  relatedCommits: z.array(z.string().min(1)).default([]),
  hiddenThesis: z.string().min(1).optional(),
  whySelected: z.string().min(1).optional(),
  possibleHooks: z.array(z.string().min(1)).default([]),
  relationToPreviousWriting: z.string().min(1).optional(),
  followUpQuestions: z.array(z.string().min(1)).default([]),
  evidenceSummaries: z.array(z.string().min(1)).default([]),
  labels: z.array(z.string().min(1)).optional(),
  state: z.enum(["open", "closed"]).optional(),
});

const scoreSchema = z.number().int().min(1).max(5);

export const editorialClusterActionSchema = z.enum(["promote", "merge", "watch", "close", "ignore"]);

export const insightClusterSchema = z.object({
  title: z.string().min(1),
  thesis: z.string().min(1),
  whatIssuesAreAbout: z.string().min(1),
  whyPatternMatters: z.string().min(1),
  whatIsActuallyInteresting: z.string().min(1),
  connectionToLargerWork: z.string().min(1),
  whatToDoNext: z.string().min(1),
  relatedSeedIds: z.array(z.string().min(1)).default([]),
  relatedIssueNumbers: z.array(z.number().int().positive()).default([]),
  score: z.object({
    novelty: scoreSchema,
    evidenceStrength: scoreSchema,
    profileFit: scoreSchema,
    writingPotential: scoreSchema,
    promotionReadiness: scoreSchema,
  }),
  editorialDecision: editorialClusterActionSchema,
  whyThisIsOrIsNotInteresting: z.string().min(1),
  whatWouldMakeItStronger: z.string().min(1),
  profileConnection: z.string().min(1),
  duplicateOfIssueNumbers: z.array(z.number().int().positive()).optional(),
  rationale: z.string().min(1),
  possiblePostTitles: z.array(z.string().min(1)).default([]),
  nextMoves: z.array(z.string().min(1)).default([]),
});

export const insightDigestSchema = z.object({
  generatedAt: isoDateString,
  totalSeeds: z.number().int().nonnegative(),
  whatThisSeemsToSayAboutTheWork: z.string().min(1),
  /** Concrete batch-level actions near the top of the rendered digest (merge, close, wait, etc.). */
  editorialDecisions: z.array(z.string().min(1)).min(1),
  clusters: z.array(insightClusterSchema).min(1),
  staleOrLowValueSeeds: z
    .array(
      z.object({
        seedId: z.string().min(1),
        reason: z.string().min(1),
        recommendedAction: z.enum(["promote", "merge", "watch", "close"]),
      }),
    )
    .default([]),
});

export const curatorDecisionSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("no_insight"),
    reason: z.string().min(10),
  }),
  z.object({
    kind: z.literal("insight"),
    issue: repoInsightIssueDraftSchema,
  }),
]);

export const forcedInsightDecisionSchema = z.object({
  kind: z.literal("insight"),
  issue: repoInsightIssueDraftSchema,
});
