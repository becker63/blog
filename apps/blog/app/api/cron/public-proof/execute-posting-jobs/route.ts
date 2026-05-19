import type { NextRequest } from "next/server";

import { verifyCronRequest } from "@/lib/public-proof/cron-auth";

export const dynamic = "force-dynamic";

/** Bounded worker for queued launch post jobs. Requires `CRON_SECRET`. */
async function handler(request: NextRequest) {
  if (!verifyCronRequest(request)) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { executePostingJobsCron } = await import("public-proof-jobs");
    const db = getPublicProofDb();
    const result = await executePostingJobsCron(db, { limit: 5 });
    return Response.json({ ok: true, kind: "execute_launch_post_job", ...result }, { status: 200 });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    return Response.json({ ok: false, error: message }, { status: 500 });
  }
}

export const GET = handler;
export const POST = handler;
