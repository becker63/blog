import { eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { AudienceGate } from "public-proof-core";
import * as schema from "../schema";

export type FixtureLaunchDbRow = Omit<
  typeof schema.launches.$inferInsert,
  "id" | "createdAt" | "updatedAt"
> &
  Partial<Pick<typeof schema.launches.$inferInsert, "id">> & {
    audienceGate: AudienceGate;
    status?: string;
  };

/** Upserts by unique `slug`; returns row. */
export const upsertLaunchFromFixtureRow = async (
  db: NeonHttpDatabase<typeof schema>,
  row: FixtureLaunchDbRow,
) => {
  const payload = {
    slug: row.slug,
    title: row.title,
    postSlug: row.postSlug,
    canonicalPath: row.canonicalPath,
    campaign: row.campaign,
    primaryClaim: row.primaryClaim,
    resumeClaim: row.resumeClaim,
    audienceGate: row.audienceGate,
    status: row.status ?? "draft",
    updatedAt: new Date(),
  };
  await db.insert(schema.launches).values(payload).onConflictDoUpdate({
    target: schema.launches.slug,
    set: payload,
  });
  const refreshed = await db
    .select()
    .from(schema.launches)
    .where(eq(schema.launches.slug, row.slug))
    .limit(1);
  return refreshed[0]!;
};
