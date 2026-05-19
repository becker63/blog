import { count, desc, eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "../schema";

export const listRecentNotificationEvents = async (
  db: NeonHttpDatabase<typeof schema>,
  limit = 50,
): Promise<Array<typeof schema.notificationEvents.$inferSelect>> => {
  return db
    .select()
    .from(schema.notificationEvents)
    .orderBy(desc(schema.notificationEvents.createdAt))
    .limit(limit);
};

export const countUnreadNotificationEvents = async (db: NeonHttpDatabase<typeof schema>): Promise<number> => {
  const [row] = await db
    .select({ value: count() })
    .from(schema.notificationEvents)
    .where(eq(schema.notificationEvents.status, "unread"));
  return Number(row?.value ?? 0);
};

export type InsertNotificationRow = {
  eventType: string;
  title?: string | null;
  body?: string | null;
  launchId?: string | null;
  jobId?: string | null;
  userId?: string | null;
  metadataJson?: Record<string, unknown> | null;
  status?: string;
};

export async function insertNotificationEvent(
  db: NeonHttpDatabase<typeof schema>,
  row: InsertNotificationRow,
): Promise<void> {
  await db.insert(schema.notificationEvents).values({
    eventType: row.eventType,
    title: row.title ?? null,
    body: row.body ?? null,
    launchId: row.launchId ?? null,
    jobId: row.jobId ?? null,
    userId: row.userId ?? null,
    metadataJson: row.metadataJson ?? null,
    status: row.status ?? "unread",
    createdAt: new Date(),
    readAt: null,
  });
}
