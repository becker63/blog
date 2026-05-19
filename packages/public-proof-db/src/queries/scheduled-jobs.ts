import { and, asc, eq, lte } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "../schema";

export type PickPendingScheduledJobsOpts = {
  kind: string;
  limit?: number;
};

/** Pending rows due now, oldest `runAfter` first. */
export const pickPendingScheduledJobs = async (
  db: NeonHttpDatabase<typeof schema>,
  opts: PickPendingScheduledJobsOpts,
): Promise<Array<typeof schema.scheduledJobs.$inferSelect>> => {
  const limit = opts.limit ?? 10;
  const now = new Date();
  return db
    .select()
    .from(schema.scheduledJobs)
    .where(
      and(
        eq(schema.scheduledJobs.kind, opts.kind),
        eq(schema.scheduledJobs.status, "pending"),
        lte(schema.scheduledJobs.runAfter, now),
      ),
    )
    .orderBy(asc(schema.scheduledJobs.runAfter))
    .limit(limit);
};

export type FinalizeScheduledJobResult = {
  status: "completed" | "failed";
  lastError?: string | null;
};

/** Terminal update: increments `attempts`, sets `status` / `lastError` / `updatedAt`. */
export type EnqueueScheduledJobInput = {
  kind: string;
  launchId?: string | null;
  publicationId?: string | null;
  jobId?: string | null;
  runAfter: Date;
};

export const enqueueScheduledJob = async (
  db: NeonHttpDatabase<typeof schema>,
  input: EnqueueScheduledJobInput,
): Promise<string> => {
  const rows = await db
    .insert(schema.scheduledJobs)
    .values({
      kind: input.kind,
      launchId: input.launchId ?? null,
      publicationId: input.publicationId ?? null,
      jobId: input.jobId ?? null,
      runAfter: input.runAfter,
      status: "pending",
    })
    .returning({ id: schema.scheduledJobs.id });
  return rows[0]!.id as string;
};

export const finalizeScheduledJob = async (
  db: NeonHttpDatabase<typeof schema>,
  jobId: string,
  result: FinalizeScheduledJobResult,
): Promise<void> => {
  const rows = await db
    .select({ attempts: schema.scheduledJobs.attempts })
    .from(schema.scheduledJobs)
    .where(eq(schema.scheduledJobs.id, jobId))
    .limit(1);
  const row = rows[0];
  if (!row) return;

  const now = new Date();
  await db
    .update(schema.scheduledJobs)
    .set({
      status: result.status,
      attempts: row.attempts + 1,
      lastError: result.lastError ?? null,
      updatedAt: now,
    })
    .where(eq(schema.scheduledJobs.id, jobId));
};
