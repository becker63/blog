import { desc } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "../schema";

export type InsertAuditRow = {
  actor: string;
  event: string;
  entityType: string;
  entityId?: string | null;
  metadataJson?: Record<string, unknown> | null;
};

/** Append-only audit rows for destructive or security-sensitive mutations. */
export const insertAuditLog = async (
  db: NeonHttpDatabase<typeof schema>,
  row: InsertAuditRow,
): Promise<void> => {
  await db.insert(schema.auditLog).values({
    actor: row.actor,
    event: row.event,
    entityType: row.entityType,
    entityId: row.entityId ?? null,
    metadataJson: row.metadataJson ?? null,
  });
};

export const listRecentAuditLogs = async (
  db: NeonHttpDatabase<typeof schema>,
  limit = 50,
): Promise<Array<typeof schema.auditLog.$inferSelect>> => {
  return db
    .select()
    .from(schema.auditLog)
    .orderBy(desc(schema.auditLog.createdAt))
    .limit(limit);
};
