CREATE TABLE "launch_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"launch_id" uuid NOT NULL,
	"posting_job_id" uuid,
	"source_kind" text DEFAULT 'render_report_cron' NOT NULL,
	"body_markdown" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "launch_reports" ADD CONSTRAINT "launch_reports_launch_id_launches_id_fk" FOREIGN KEY ("launch_id") REFERENCES "public"."launches"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launch_reports" ADD CONSTRAINT "launch_reports_posting_job_id_launch_post_jobs_id_fk" FOREIGN KEY ("posting_job_id") REFERENCES "public"."launch_post_jobs"("id") ON DELETE set null ON UPDATE no action;