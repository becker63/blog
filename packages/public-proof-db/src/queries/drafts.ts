import { desc, eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "../schema";

export const listDraftsForLaunch = async (
  db: NeonHttpDatabase<typeof schema>,
  launchId: string,
): Promise<Array<typeof schema.drafts.$inferSelect>> => {
  return db
    .select()
    .from(schema.drafts)
    .where(eq(schema.drafts.launchId, launchId))
    .orderBy(desc(schema.drafts.updatedAt));
};
