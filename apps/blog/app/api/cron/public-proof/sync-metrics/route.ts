import type { NextRequest } from "next/server";

import { verifyCronRequest } from "@/lib/public-proof/cron-auth";

export const dynamic = "force-dynamic";

const SYNC_METRICS_KIND = "sync_metrics";
const BATCH_LIMIT = 10;

/** Bounded worker for `scheduled_jobs` metric sync. Requires `CRON_SECRET`. */
async function handler(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { finalizeScheduledJob, pickPendingScheduledJobs } = await import("public-proof-db/queries/scheduled-jobs");
    const db = getPublicProofDb();
    const jobs = await pickPendingScheduledJobs(db, {
      kind: SYNC_METRICS_KIND,
      limit: BATCH_LIMIT,
    });

    const jobIds: string[] = [];
    for (const job of jobs) {
      // v1: no metric provider sync yet — mark completed so cron stays idempotent-ish.
      await finalizeScheduledJob(db, job.id, { status: "completed", lastError: null });
      jobIds.push(job.id);
    }

    return Response.json(
      { ok: true, kind: SYNC_METRICS_KIND, processed: jobs.length, jobIds },
      { status: 200 },
    );
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
