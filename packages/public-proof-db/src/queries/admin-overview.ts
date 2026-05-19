import { count, eq, inArray } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "../schema";

export const LAUNCH_JOB_RUN_STATUSES = ["queued", "running"] as const;
export const LAUNCH_JOB_ISSUE_STATUSES = ["failed", "partially_completed"] as const;

export async function countLaunchPostJobsMatchingStatuses(
  db: NeonHttpDatabase<typeof schema>,
  statuses: readonly string[],
): Promise<number> {
  if (statuses.length === 0) return 0;
  const [row] = await db
    .select({ value: count() })
    .from(schema.launchPostJobs)
    .where(inArray(schema.launchPostJobs.status, [...statuses]));
  return Number(row?.value ?? 0);
}

export async function countPostingPlanItemsAwaitingDecision(
  db: NeonHttpDatabase<typeof schema>,
): Promise<number> {
  const [row] = await db
    .select({ value: count() })
    .from(schema.postingPlanItems)
    .where(eq(schema.postingPlanItems.status, "proposed"));
  return Number(row?.value ?? 0);
}
