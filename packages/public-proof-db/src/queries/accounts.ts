import { desc } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "../schema";

export const listConnectedAccounts = async (
  db: NeonHttpDatabase<typeof schema>,
): Promise<Array<typeof schema.connectedAccounts.$inferSelect>> => {
  return db.select().from(schema.connectedAccounts).orderBy(desc(schema.connectedAccounts.updatedAt));
};
