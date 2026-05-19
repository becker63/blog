import { desc, eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "../schema";

export const listLaunches = async (
  db: NeonHttpDatabase<typeof schema>,
): Promise<Array<typeof schema.launches.$inferSelect>> => {
  return db.select().from(schema.launches).orderBy(desc(schema.launches.updatedAt));
};

export const getLaunchBySlug = async (
  db: NeonHttpDatabase<typeof schema>,
  slug: string,
): Promise<typeof schema.launches.$inferSelect | undefined> => {
  const rows = await db.select().from(schema.launches).where(eq(schema.launches.slug, slug)).limit(1);
  return rows[0];
};

/** Returns the launch row id when update matched; otherwise `null`. */
export const setLaunchAudienceGateBySlug = async (
  db: NeonHttpDatabase<typeof schema>,
  slug: string,
  audienceGate: string,
): Promise<{ id: string } | null> => {
  const now = new Date();
  const rows = await db
    .update(schema.launches)
    .set({ audienceGate, updatedAt: now })
    .where(eq(schema.launches.slug, slug))
    .returning({ id: schema.launches.id });
  return rows[0] ?? null;
};
