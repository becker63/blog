import type { NextRequest } from "next/server";

import { verifyCronRequest } from "@/lib/public-proof/cron-auth";

export const dynamic = "force-dynamic";

const RENDER_REPORT_KIND = "render_report";
const BATCH_LIMIT = 10;

/** Persist Markdown into `launch_reports` for queued `scheduled_jobs.render_report`; requires `CRON_SECRET`. */
async function handler(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { compileLaunchReportMarkdown } = await import("public-proof-db/queries/launch-report-compile");
    const { insertLaunchReport } = await import("public-proof-db/queries/reports");
    const { finalizeScheduledJob, pickPendingScheduledJobs } = await import("public-proof-db/queries/scheduled-jobs");

    const db = getPublicProofDb();
    const jobs = await pickPendingScheduledJobs(db, {
      kind: RENDER_REPORT_KIND,
      limit: BATCH_LIMIT,
    });

    const jobIds: string[] = [];
    const reportIds: string[] = [];
    const errors: string[] = [];

    for (const job of jobs) {
      if (!job.launchId) {
        await finalizeScheduledJob(db, job.id, {
          status: "failed",
          lastError: "render_report_missing_launch_id",
        });
        jobIds.push(job.id);
        errors.push(`${job.id}:missing_launch`);
        continue;
      }

      try {
        const bodyMarkdown = await compileLaunchReportMarkdown(db, job.launchId, job.jobId ?? null);
        const rid = await insertLaunchReport(db, {
          launchId: job.launchId,
          postingJobId: job.jobId,
          bodyMarkdown,
        });
        reportIds.push(rid);
        await finalizeScheduledJob(db, job.id, { status: "completed", lastError: null });
        jobIds.push(job.id);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        await finalizeScheduledJob(db, job.id, {
          status: "failed",
          lastError: message,
        });
        jobIds.push(job.id);
        errors.push(`${job.id}:${message}`);
      }
    }

    return Response.json(
      {
        ok: errors.length === 0,
        kind: RENDER_REPORT_KIND,
        processed: jobs.length,
        jobIds,
        reportIds,
        errors,
      },
      { status: 200 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
