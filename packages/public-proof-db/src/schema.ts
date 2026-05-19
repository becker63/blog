import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

/** Single-owner + future viewers — role stored as text for simple migrations */
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").notNull().unique(),
  name: text("name"),
  role: text("role").notNull().default("viewer"), // owner | viewer
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const connectedAccounts = pgTable("connected_accounts", {
  id: uuid("id").primaryKey().defaultRandom(),
  provider: text("provider").notNull(),
  handle: text("handle"),
  displayName: text("display_name"),
  accountUrl: text("account_url"),
  accessTokenEncrypted: text("access_token_encrypted"),
  refreshTokenEncrypted: text("refresh_token_encrypted"),
  scopesJson: jsonb("scopes_json"),
  expiresAt: timestamp("expires_at", { mode: "date", withTimezone: true }),
  status: text("status").notNull().default("connected"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const launches = pgTable("launches", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  title: text("title").notNull(),
  postSlug: text("post_slug").notNull(),
  canonicalPath: text("canonical_path").notNull(),
  campaign: text("campaign").notNull(),
  primaryClaim: text("primary_claim").notNull(),
  resumeClaim: text("resume_claim").notNull(),
  audienceGate: text("audience_gate").notNull(),
  status: text("status").notNull().default("draft"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const launchDestinations = pgTable("launch_destinations", {
  id: uuid("id").primaryKey().defaultRandom(),
  launchId: uuid("launch_id")
    .notNull()
    .references(() => launches.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  accountId: uuid("account_id").references(() => connectedAccounts.id, { onDelete: "set null" }),
  enabled: boolean("enabled").notNull().default(true),
  mode: text("mode").notNull(),
  visibility: text("visibility"),
  gateBehavior: text("gate_behavior").notNull(),
  scheduledFor: timestamp("scheduled_for", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const drafts = pgTable("drafts", {
  id: uuid("id").primaryKey().defaultRandom(),
  launchId: uuid("launch_id")
    .notNull()
    .references(() => launches.id, { onDelete: "cascade" }),
  destinationId: uuid("destination_id").references(() => launchDestinations.id, { onDelete: "set null" }),
  provider: text("provider").notNull(),
  title: text("title"),
  body: text("body").notNull(),
  firstComment: text("first_comment"),
  canonicalUrl: text("canonical_url"),
  utmUrl: text("utm_url"),
  warningsJson: jsonb("warnings_json"),
  status: text("status").notNull().default("generated"),
  generatedBy: text("generated_by").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const approvals = pgTable("approvals", {
  id: uuid("id").primaryKey().defaultRandom(),
  draftId: uuid("draft_id")
    .notNull()
    .references(() => drafts.id, { onDelete: "cascade" }),
  approvedBy: text("approved_by").notNull(),
  approvalScope: text("approval_scope").notNull(),
  approvedAt: timestamp("approved_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  notes: text("notes"),
});

export const publications = pgTable("publications", {
  id: uuid("id").primaryKey().defaultRandom(),
  launchId: uuid("launch_id")
    .notNull()
    .references(() => launches.id, { onDelete: "cascade" }),
  destinationId: uuid("destination_id").references(() => launchDestinations.id, { onDelete: "set null" }),
  draftId: uuid("draft_id").references(() => drafts.id, { onDelete: "set null" }),
  provider: text("provider").notNull(),
  platformPostId: text("platform_post_id"),
  url: text("url"),
  status: text("status").notNull(),
  scheduledFor: timestamp("scheduled_for", { mode: "date", withTimezone: true }),
  publishedAt: timestamp("published_at", { mode: "date", withTimezone: true }),
  lastSyncedAt: timestamp("last_synced_at", { mode: "date", withTimezone: true }),
  rawJson: jsonb("raw_json"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const metricSnapshots = pgTable("metric_snapshots", {
  id: uuid("id").primaryKey().defaultRandom(),
  publicationId: uuid("publication_id").references(() => publications.id, { onDelete: "set null" }),
  launchId: uuid("launch_id").references(() => launches.id, { onDelete: "set null" }),
  provider: text("provider"),
  capturedAt: timestamp("captured_at", { mode: "date", withTimezone: true }).notNull(),
  source: text("source").notNull(),
  impressions: integer("impressions"),
  views: integer("views"),
  reactions: integer("reactions"),
  comments: integer("comments"),
  reposts: integer("reposts"),
  clicks: integer("clicks"),
  saves: integer("saves"),
  profileViews: integer("profile_views"),
  followersDelta: integer("followers_delta"),
  siteVisits: integer("site_visits"),
  rawJson: jsonb("raw_json"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const auditLog = pgTable("audit_log", {
  id: uuid("id").primaryKey().defaultRandom(),
  actor: text("actor").notNull(),
  event: text("event").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: text("entity_id"),
  metadataJson: jsonb("metadata_json"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const communityTargets = pgTable("community_targets", {
  id: uuid("id").primaryKey().defaultRandom(),
  launchId: uuid("launch_id")
    .notNull()
    .references(() => launches.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  communityName: text("community_name").notNull(),
  communityUrl: text("community_url"),
  topicFitScore: integer("topic_fit_score"),
  audienceFitScore: integer("audience_fit_score"),
  riskScore: integer("risk_score"),
  selfPromotionRisk: text("self_promotion_risk"),
  ruleRisk: text("rule_risk"),
  sentiment: text("sentiment"),
  recommendedAction: text("recommended_action"),
  rationale: text("rationale"),
  notesJson: jsonb("notes_json"),
  rawMetadataJson: jsonb("raw_metadata_json"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const communityDrafts = pgTable("community_drafts", {
  id: uuid("id").primaryKey().defaultRandom(),
  launchId: uuid("launch_id")
    .notNull()
    .references(() => launches.id, { onDelete: "cascade" }),
  communityTargetId: uuid("community_target_id").references(() => communityTargets.id, {
    onDelete: "set null",
  }),
  provider: text("provider").notNull(),
  draftKind: text("draft_kind").notNull(),
  title: text("title"),
  body: text("body").notNull(),
  firstComment: text("first_comment"),
  disclosure: text("disclosure"),
  riskNotesJson: jsonb("risk_notes_json"),
  generatedBy: text("generated_by").notNull(),
  status: text("status").notNull().default("generated"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const postingPlans = pgTable("posting_plans", {
  id: uuid("id").primaryKey().defaultRandom(),
  launchId: uuid("launch_id")
    .notNull()
    .references(() => launches.id, { onDelete: "cascade" }),
  status: text("status").notNull().default("generated"),
  audienceGate: text("audience_gate").notNull(),
  summary: text("summary"),
  warningsJson: jsonb("warnings_json"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const postingPlanItems = pgTable("posting_plan_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  postingPlanId: uuid("posting_plan_id")
    .notNull()
    .references(() => postingPlans.id, { onDelete: "cascade" }),
  communityTargetId: uuid("community_target_id").references(() => communityTargets.id, {
    onDelete: "set null",
  }),
  communityDraftId: uuid("community_draft_id").references(() => communityDrafts.id, {
    onDelete: "set null",
  }),
  status: text("status").notNull().default("proposed"),
  approvedAt: timestamp("approved_at", { mode: "date", withTimezone: true }),
  postedAt: timestamp("posted_at", { mode: "date", withTimezone: true }),
  platformPostId: text("platform_post_id"),
  url: text("url"),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const launchPostJobs = pgTable("launch_post_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  launchId: uuid("launch_id")
    .notNull()
    .references(() => launches.id, { onDelete: "cascade" }),
  postingPlanId: uuid("posting_plan_id").references(() => postingPlans.id, { onDelete: "set null" }),
  status: text("status").notNull().default("draft"),
  audienceGate: text("audience_gate").notNull(),
  createdBy: text("created_by"),
  approvedBy: text("approved_by"),
  approvedAt: timestamp("approved_at", { mode: "date", withTimezone: true }),
  queuedAt: timestamp("queued_at", { mode: "date", withTimezone: true }),
  startedAt: timestamp("started_at", { mode: "date", withTimezone: true }),
  completedAt: timestamp("completed_at", { mode: "date", withTimezone: true }),
  dryRun: boolean("dry_run").notNull().default(true),
  summary: text("summary"),
  warningsJson: jsonb("warnings_json"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const launchPostJobItems = pgTable("launch_post_job_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => launchPostJobs.id, { onDelete: "cascade" }),
  launchId: uuid("launch_id")
    .notNull()
    .references(() => launches.id, { onDelete: "cascade" }),
  provider: text("provider").notNull(),
  destinationName: text("destination_name"),
  communityTargetId: uuid("community_target_id").references(() => communityTargets.id, {
    onDelete: "set null",
  }),
  draftId: uuid("draft_id").references(() => drafts.id, { onDelete: "set null" }),
  status: text("status").notNull().default("pending"),
  visibility: text("visibility"),
  scheduledFor: timestamp("scheduled_for", { mode: "date", withTimezone: true }),
  platformPostId: text("platform_post_id"),
  url: text("url"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  startedAt: timestamp("started_at", { mode: "date", withTimezone: true }),
  completedAt: timestamp("completed_at", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const launchPostJobEvents = pgTable("launch_post_job_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  jobId: uuid("job_id")
    .notNull()
    .references(() => launchPostJobs.id, { onDelete: "cascade" }),
  jobItemId: uuid("job_item_id").references(() => launchPostJobItems.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  message: text("message"),
  metadataJson: jsonb("metadata_json"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

/** After `launchPostJobs`: optional FK when job is a queued posting executor */
export const scheduledJobs = pgTable("scheduled_jobs", {
  id: uuid("id").primaryKey().defaultRandom(),
  kind: text("kind").notNull(),
  launchId: uuid("launch_id").references(() => launches.id, { onDelete: "set null" }),
  publicationId: uuid("publication_id").references(() => publications.id, { onDelete: "set null" }),
  jobId: uuid("job_id").references(() => launchPostJobs.id, { onDelete: "set null" }),
  runAfter: timestamp("run_after", { mode: "date", withTimezone: true }).notNull(),
  status: text("status").notNull().default("pending"),
  attempts: integer("attempts").notNull().default(0),
  lastError: text("last_error"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const agentTraceRuns = pgTable("agent_trace_runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  launchId: uuid("launch_id").references(() => launches.id, { onDelete: "set null" }),
  taskName: text("task_name").notNull(),
  provider: text("provider").notNull().default("cursor-agent-sdk"),
  model: text("model"),
  status: text("status").notNull(),
  inputSummary: text("input_summary"),
  outputSummary: text("output_summary"),
  estimatedInputTokens: integer("estimated_input_tokens"),
  estimatedOutputTokens: integer("estimated_output_tokens"),
  startedAt: timestamp("started_at", { mode: "date", withTimezone: true }).notNull(),
  completedAt: timestamp("completed_at", { mode: "date", withTimezone: true }),
  error: text("error"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const agentTraceEvents = pgTable("agent_trace_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  traceRunId: uuid("trace_run_id")
    .notNull()
    .references(() => agentTraceRuns.id, { onDelete: "cascade" }),
  sequence: integer("sequence").notNull(),
  eventType: text("event_type").notNull(),
  payloadJson: jsonb("payload_json"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const agentTraceArtifacts = pgTable("agent_trace_artifacts", {
  id: uuid("id").primaryKey().defaultRandom(),
  traceRunId: uuid("trace_run_id")
    .notNull()
    .references(() => agentTraceRuns.id, { onDelete: "cascade" }),
  artifactKind: text("artifact_kind").notNull(),
  content: text("content"),
  contentType: text("content_type").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const launchReports = pgTable("launch_reports", {
  id: uuid("id").primaryKey().defaultRandom(),
  launchId: uuid("launch_id")
    .notNull()
    .references(() => launches.id, { onDelete: "cascade" }),
  postingJobId: uuid("posting_job_id").references(() => launchPostJobs.id, { onDelete: "set null" }),
  sourceKind: text("source_kind").notNull().default("render_report_cron"),
  bodyMarkdown: text("body_markdown").notNull(),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});

export const notificationEvents = pgTable("notification_events", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  launchId: uuid("launch_id").references(() => launches.id, { onDelete: "set null" }),
  jobId: uuid("job_id").references(() => launchPostJobs.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(),
  title: text("title"),
  body: text("body"),
  status: text("status").notNull().default("unread"),
  metadataJson: jsonb("metadata_json"),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  readAt: timestamp("read_at", { mode: "date", withTimezone: true }),
});

export const mobileDevices = pgTable("mobile_devices", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  expoPushToken: text("expo_push_token").notNull(),
  platform: text("platform").notNull(),
  deviceName: text("device_name"),
  lastSeenAt: timestamp("last_seen_at", { mode: "date", withTimezone: true }),
  createdAt: timestamp("created_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { mode: "date", withTimezone: true }).notNull().defaultNow(),
});
