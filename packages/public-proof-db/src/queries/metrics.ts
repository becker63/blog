import { desc, eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "../schema";

export const listMetricSnapshotsForLaunch = async (
  db: NeonHttpDatabase<typeof schema>,
  launchId: string,
  limit = 40,
): Promise<Array<typeof schema.metricSnapshots.$inferSelect>> => {
  return db
    .select()
    .from(schema.metricSnapshots)
    .where(eq(schema.metricSnapshots.launchId, launchId))
    .orderBy(desc(schema.metricSnapshots.capturedAt))
    .limit(limit);
};

/** Owner-entered rollup row (Hermes Phase F manual path). Coerce blanks to SQL null integers. */
export async function insertManualMetricSnapshotRow(
  db: NeonHttpDatabase<typeof schema>,
  input: {
    launchId: string;
    provider?: string | null;
    capturedAt: Date;
    impressions?: number | null;
    views?: number | null;
    reactions?: number | null;
    comments?: number | null;
    reposts?: number | null;
    clicks?: number | null;
    saves?: number | null;
    profileViews?: number | null;
    followersDelta?: number | null;
    siteVisits?: number | null;
    notes?: string | null;
  },
): Promise<string> {
  const [row] = await db
    .insert(schema.metricSnapshots)
    .values({
      publicationId: null,
      launchId: input.launchId,
      provider: input.provider ?? null,
      capturedAt: input.capturedAt,
      source: "manual",
      impressions: input.impressions ?? null,
      views: input.views ?? null,
      reactions: input.reactions ?? null,
      comments: input.comments ?? null,
      reposts: input.reposts ?? null,
      clicks: input.clicks ?? null,
      saves: input.saves ?? null,
      profileViews: input.profileViews ?? null,
      followersDelta: input.followersDelta ?? null,
      siteVisits: input.siteVisits ?? null,
      rawJson: null,
      notes: input.notes ?? null,
    })
    .returning({ id: schema.metricSnapshots.id });

  return row!.id as string;
}
