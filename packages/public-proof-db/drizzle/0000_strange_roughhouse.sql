CREATE TABLE "agent_trace_artifacts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trace_run_id" uuid NOT NULL,
	"artifact_kind" text NOT NULL,
	"content" text,
	"content_type" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_trace_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"trace_run_id" uuid NOT NULL,
	"sequence" integer NOT NULL,
	"event_type" text NOT NULL,
	"payload_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "agent_trace_runs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"launch_id" uuid,
	"task_name" text NOT NULL,
	"provider" text DEFAULT 'cursor-agent-sdk' NOT NULL,
	"model" text,
	"status" text NOT NULL,
	"input_summary" text,
	"output_summary" text,
	"estimated_input_tokens" integer,
	"estimated_output_tokens" integer,
	"started_at" timestamp with time zone NOT NULL,
	"completed_at" timestamp with time zone,
	"error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "approvals" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"draft_id" uuid NOT NULL,
	"approved_by" text NOT NULL,
	"approval_scope" text NOT NULL,
	"approved_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "audit_log" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"actor" text NOT NULL,
	"event" text NOT NULL,
	"entity_type" text NOT NULL,
	"entity_id" text,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"launch_id" uuid NOT NULL,
	"community_target_id" uuid,
	"provider" text NOT NULL,
	"draft_kind" text NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"first_comment" text,
	"disclosure" text,
	"risk_notes_json" jsonb,
	"generated_by" text NOT NULL,
	"status" text DEFAULT 'generated' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "community_targets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"launch_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"community_name" text NOT NULL,
	"community_url" text,
	"topic_fit_score" integer,
	"audience_fit_score" integer,
	"risk_score" integer,
	"self_promotion_risk" text,
	"rule_risk" text,
	"sentiment" text,
	"recommended_action" text,
	"rationale" text,
	"notes_json" jsonb,
	"raw_metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "connected_accounts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider" text NOT NULL,
	"handle" text,
	"display_name" text,
	"account_url" text,
	"access_token_encrypted" text,
	"refresh_token_encrypted" text,
	"scopes_json" jsonb,
	"expires_at" timestamp with time zone,
	"status" text DEFAULT 'connected' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drafts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"launch_id" uuid NOT NULL,
	"destination_id" uuid,
	"provider" text NOT NULL,
	"title" text,
	"body" text NOT NULL,
	"first_comment" text,
	"canonical_url" text,
	"utm_url" text,
	"warnings_json" jsonb,
	"status" text DEFAULT 'generated' NOT NULL,
	"generated_by" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launch_destinations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"launch_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"account_id" uuid,
	"enabled" boolean DEFAULT true NOT NULL,
	"mode" text NOT NULL,
	"visibility" text,
	"gate_behavior" text NOT NULL,
	"scheduled_for" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launch_post_job_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"job_item_id" uuid,
	"event_type" text NOT NULL,
	"message" text,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launch_post_job_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_id" uuid NOT NULL,
	"launch_id" uuid NOT NULL,
	"provider" text NOT NULL,
	"destination_name" text,
	"community_target_id" uuid,
	"draft_id" uuid,
	"status" text DEFAULT 'pending' NOT NULL,
	"visibility" text,
	"scheduled_for" timestamp with time zone,
	"platform_post_id" text,
	"url" text,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launch_post_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"launch_id" uuid NOT NULL,
	"posting_plan_id" uuid,
	"status" text DEFAULT 'draft' NOT NULL,
	"audience_gate" text NOT NULL,
	"created_by" text,
	"approved_by" text,
	"approved_at" timestamp with time zone,
	"queued_at" timestamp with time zone,
	"started_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"dry_run" boolean DEFAULT true NOT NULL,
	"summary" text,
	"warnings_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launches" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"title" text NOT NULL,
	"post_slug" text NOT NULL,
	"canonical_path" text NOT NULL,
	"campaign" text NOT NULL,
	"primary_claim" text NOT NULL,
	"resume_claim" text NOT NULL,
	"audience_gate" text NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "launches_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "metric_snapshots" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"publication_id" uuid,
	"launch_id" uuid,
	"provider" text,
	"captured_at" timestamp with time zone NOT NULL,
	"source" text NOT NULL,
	"impressions" integer,
	"views" integer,
	"reactions" integer,
	"comments" integer,
	"reposts" integer,
	"clicks" integer,
	"saves" integer,
	"profile_views" integer,
	"followers_delta" integer,
	"site_visits" integer,
	"raw_json" jsonb,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mobile_devices" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"expo_push_token" text NOT NULL,
	"platform" text NOT NULL,
	"device_name" text,
	"last_seen_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notification_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid,
	"launch_id" uuid,
	"job_id" uuid,
	"event_type" text NOT NULL,
	"title" text,
	"body" text,
	"status" text DEFAULT 'unread' NOT NULL,
	"metadata_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"read_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "posting_plan_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"posting_plan_id" uuid NOT NULL,
	"community_target_id" uuid,
	"community_draft_id" uuid,
	"status" text DEFAULT 'proposed' NOT NULL,
	"approved_at" timestamp with time zone,
	"posted_at" timestamp with time zone,
	"platform_post_id" text,
	"url" text,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "posting_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"launch_id" uuid NOT NULL,
	"status" text DEFAULT 'generated' NOT NULL,
	"audience_gate" text NOT NULL,
	"summary" text,
	"warnings_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "publications" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"launch_id" uuid NOT NULL,
	"destination_id" uuid,
	"draft_id" uuid,
	"provider" text NOT NULL,
	"platform_post_id" text,
	"url" text,
	"status" text NOT NULL,
	"scheduled_for" timestamp with time zone,
	"published_at" timestamp with time zone,
	"last_synced_at" timestamp with time zone,
	"raw_json" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "scheduled_jobs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"launch_id" uuid,
	"publication_id" uuid,
	"job_id" uuid,
	"run_after" timestamp with time zone NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"last_error" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"name" text,
	"role" text DEFAULT 'viewer' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
ALTER TABLE "agent_trace_artifacts" ADD CONSTRAINT "agent_trace_artifacts_trace_run_id_agent_trace_runs_id_fk" FOREIGN KEY ("trace_run_id") REFERENCES "public"."agent_trace_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_trace_events" ADD CONSTRAINT "agent_trace_events_trace_run_id_agent_trace_runs_id_fk" FOREIGN KEY ("trace_run_id") REFERENCES "public"."agent_trace_runs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "agent_trace_runs" ADD CONSTRAINT "agent_trace_runs_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "approvals" ADD CONSTRAINT "approvals_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."drafts"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_drafts" ADD CONSTRAINT "community_drafts_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_drafts" ADD CONSTRAINT "community_drafts_community_target_id_community_targets_id_fk" FOREIGN KEY ("community_target_id") REFERENCES "public"."community_targets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "community_targets" ADD CONSTRAINT "community_targets_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "drafts" ADD CONSTRAINT "drafts_destination_id_launch_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."launch_destinations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_destinations" ADD CONSTRAINT "launch_destinations_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_destinations" ADD CONSTRAINT "launch_destinations_account_id_connected_accounts_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."connected_accounts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_post_job_events" ADD CONSTRAINT "launch_post_job_events_job_id_launch_post_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."launch_post_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_post_job_events" ADD CONSTRAINT "launch_post_job_events_job_item_id_launch_post_job_items_id_fk" FOREIGN KEY ("job_item_id") REFERENCES "public"."launch_post_job_items"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_post_job_items" ADD CONSTRAINT "launch_post_job_items_job_id_launch_post_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."launch_post_jobs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_post_job_items" ADD CONSTRAINT "launch_post_job_items_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_post_job_items" ADD CONSTRAINT "launch_post_job_items_community_target_id_community_targets_id_fk" FOREIGN KEY ("community_target_id") REFERENCES "public"."community_targets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_post_job_items" ADD CONSTRAINT "launch_post_job_items_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."drafts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_post_jobs" ADD CONSTRAINT "launch_post_jobs_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_post_jobs" ADD CONSTRAINT "launch_post_jobs_posting_plan_id_posting_plans_id_fk" FOREIGN KEY ("posting_plan_id") REFERENCES "public"."posting_plans"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metric_snapshots" ADD CONSTRAINT "metric_snapshots_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metric_snapshots" ADD CONSTRAINT "metric_snapshots_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "mobile_devices" ADD CONSTRAINT "mobile_devices_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_events" ADD CONSTRAINT "notification_events_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_events" ADD CONSTRAINT "notification_events_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notification_events" ADD CONSTRAINT "notification_events_job_id_launch_post_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."launch_post_jobs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posting_plan_items" ADD CONSTRAINT "posting_plan_items_posting_plan_id_posting_plans_id_fk" FOREIGN KEY ("posting_plan_id") REFERENCES "public"."posting_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posting_plan_items" ADD CONSTRAINT "posting_plan_items_community_target_id_community_targets_id_fk" FOREIGN KEY ("community_target_id") REFERENCES "public"."community_targets"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posting_plan_items" ADD CONSTRAINT "posting_plan_items_community_draft_id_community_drafts_id_fk" FOREIGN KEY ("community_draft_id") REFERENCES "public"."community_drafts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "posting_plans" ADD CONSTRAINT "posting_plans_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_destination_id_launch_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."launch_destinations"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "publications" ADD CONSTRAINT "publications_draft_id_drafts_id_fk" FOREIGN KEY ("draft_id") REFERENCES "public"."drafts"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_publication_id_publications_id_fk" FOREIGN KEY ("publication_id") REFERENCES "public"."publications"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "scheduled_jobs" ADD CONSTRAINT "scheduled_jobs_job_id_launch_post_jobs_id_fk" FOREIGN KEY ("job_id") REFERENCES "public"."launch_post_jobs"("id") ON DELETE set null ON UPDATE no action;