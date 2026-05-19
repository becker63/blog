import { and, count, desc, inArray } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "../schema";

export type LaunchAdminListRow = {
  launch: typeof schema.launches.$inferSelect;
  destinationCount: number;
  queuedOrRunningJobs: number;
};

const ACTIVE_JOB_STATUSES = ["queued", "running"] as const;

export async function listLaunchesWithAdminCounts(
  db: NeonHttpDatabase<typeof schema>,
): Promise<LaunchAdminListRow[]> {
  const launchesRows = await db.select().from(schema.launches).orderBy(desc(schema.launches.updatedAt));
  if (launchesRows.length === 0) return [];

  const ids = launchesRows.map((l) => l.id);

  const destAgg = await db
    .select({
      launchId: schema.launchDestinations.launchId,
      total: count(),
    })
    .from(schema.launchDestinations)
    .where(inArray(schema.launchDestinations.launchId, ids))
    .groupBy(schema.launchDestinations.launchId);

  const jobsAgg = await db
    .select({
      launchId: schema.launchPostJobs.launchId,
      total: count(),
    })
    .from(schema.launchPostJobs)
    .where(and(inArray(schema.launchPostJobs.launchId, ids), inArray(schema.launchPostJobs.status, [...ACTIVE_JOB_STATUSES])))
    .groupBy(schema.launchPostJobs.launchId);

  const destMap = new Map(destAgg.map((r) => [r.launchId, Number(r.total)]));
  const jobMap = new Map(jobsAgg.map((r) => [r.launchId, Number(r.total)]));

  return launchesRows.map((launch) => ({
    launch,
    destinationCount: destMap.get(launch.id) ?? 0,
    queuedOrRunningJobs: jobMap.get(launch.id) ?? 0,
  }));
}
