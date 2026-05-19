import { and, asc, desc, eq, inArray } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "../schema";

export const listLaunchPostJobsForLaunch = async (
  db: NeonHttpDatabase<typeof schema>,
  launchId: string,
): Promise<Array<typeof schema.launchPostJobs.$inferSelect>> => {
  return db
    .select()
    .from(schema.launchPostJobs)
    .where(eq(schema.launchPostJobs.launchId, launchId))
    .orderBy(desc(schema.launchPostJobs.createdAt));
};

export const getLaunchPostJobById = async (
  db: NeonHttpDatabase<typeof schema>,
  jobId: string,
): Promise<typeof schema.launchPostJobs.$inferSelect | undefined> => {
  const rows = await db
    .select()
    .from(schema.launchPostJobs)
    .where(eq(schema.launchPostJobs.id, jobId))
    .limit(1);
  return rows[0];
};

export const listLaunchPostJobItemsForJob = async (
  db: NeonHttpDatabase<typeof schema>,
  jobId: string,
): Promise<Array<typeof schema.launchPostJobItems.$inferSelect>> => {
  return db
    .select()
    .from(schema.launchPostJobItems)
    .where(eq(schema.launchPostJobItems.jobId, jobId))
    .orderBy(asc(schema.launchPostJobItems.createdAt));
};

export const listLaunchPostJobEventsForJob = async (
  db: NeonHttpDatabase<typeof schema>,
  jobId: string,
): Promise<Array<typeof schema.launchPostJobEvents.$inferSelect>> => {
  return db
    .select()
    .from(schema.launchPostJobEvents)
    .where(eq(schema.launchPostJobEvents.jobId, jobId))
    .orderBy(asc(schema.launchPostJobEvents.createdAt));
};

export const LAUNCH_JOB_ACTIVE_POSTING_STATUSES = ["queued", "running"] as const;

export async function launchHasBlockingPostingJob(
  db: NeonHttpDatabase<typeof schema>,
  launchId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: schema.launchPostJobs.id })
    .from(schema.launchPostJobs)
    .where(
      and(
        eq(schema.launchPostJobs.launchId, launchId),
        inArray(schema.launchPostJobs.status, [...LAUNCH_JOB_ACTIVE_POSTING_STATUSES]),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

/** Lab helper: enqueue a dry-run DEV.to item — safe default for cron smoke tests. */
export async function insertQueuedDryRunDevtoJob(
  db: NeonHttpDatabase<typeof schema>,
  launch: typeof schema.launches.$inferSelect,
): Promise<{ jobId: string }> {
  const now = new Date();
  const insertedJob = await db
    .insert(schema.launchPostJobs)
    .values({
      launchId: launch.id,
      postingPlanId: null,
      status: "queued",
      audienceGate: launch.audienceGate,
      createdBy: "admin_dashboard",
      dryRun: true,
      queuedAt: now,
      updatedAt: now,
    })
    .returning({ id: schema.launchPostJobs.id });

  const jobId = insertedJob[0]!.id;

  await db.insert(schema.launchPostJobItems).values({
    jobId,
    launchId: launch.id,
    provider: "devto",
    updatedAt: now,
  });

  return { jobId };
}

/** `draft` → `queued` when dry-run OR `approvedAt` set for live runs. */
export async function queueDraftPostingJob(db: NeonHttpDatabase<typeof schema>, jobId: string): Promise<boolean> {
  const job = await getLaunchPostJobById(db, jobId);
  if (!job || job.status !== "draft") return false;
  if (!job.dryRun && !job.approvedAt) return false;

  const now = new Date();
  await db
    .update(schema.launchPostJobs)
    .set({ status: "queued", queuedAt: now, updatedAt: now })
    .where(eq(schema.launchPostJobs.id, jobId));
  return true;
}
