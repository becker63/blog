import { and, asc, desc, eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "../schema";

export const listPostingPlansForLaunch = async (
  db: NeonHttpDatabase<typeof schema>,
  launchId: string,
): Promise<Array<typeof schema.postingPlans.$inferSelect>> => {
  return db
    .select()
    .from(schema.postingPlans)
    .where(eq(schema.postingPlans.launchId, launchId))
    .orderBy(desc(schema.postingPlans.updatedAt));
};

export const getPostingPlanById = async (
  db: NeonHttpDatabase<typeof schema>,
  planId: string,
): Promise<typeof schema.postingPlans.$inferSelect | undefined> => {
  const [row] = await db.select().from(schema.postingPlans).where(eq(schema.postingPlans.id, planId)).limit(1);
  return row;
};

/** Most recently updated plan for a launch (typical “current” plan in admin UI). */
export const getLatestPostingPlanForLaunch = async (
  db: NeonHttpDatabase<typeof schema>,
  launchId: string,
): Promise<typeof schema.postingPlans.$inferSelect | undefined> => {
  const [row] = await db
    .select()
    .from(schema.postingPlans)
    .where(eq(schema.postingPlans.launchId, launchId))
    .orderBy(desc(schema.postingPlans.updatedAt))
    .limit(1);
  return row;
};

export const listPostingPlanItems = async (
  db: NeonHttpDatabase<typeof schema>,
  postingPlanId: string,
): Promise<Array<typeof schema.postingPlanItems.$inferSelect>> => {
  return db
    .select()
    .from(schema.postingPlanItems)
    .where(eq(schema.postingPlanItems.postingPlanId, postingPlanId))
    .orderBy(asc(schema.postingPlanItems.createdAt));
};

export const getPostingPlanItemById = async (
  db: NeonHttpDatabase<typeof schema>,
  itemId: string,
): Promise<typeof schema.postingPlanItems.$inferSelect | undefined> => {
  const [row] = await db
    .select()
    .from(schema.postingPlanItems)
    .where(eq(schema.postingPlanItems.id, itemId))
    .limit(1);
  return row;
};

export type PostingPlanItemStatus = "proposed" | "approved" | "rejected" | "posted" | "failed" | "skipped";

export const setPostingPlanItemDecision = async (
  db: NeonHttpDatabase<typeof schema>,
  itemId: string,
  decision: Extract<PostingPlanItemStatus, "approved" | "rejected">,
): Promise<boolean> => {
  const now = new Date();
  const rows = await db
    .update(schema.postingPlanItems)
    .set({
      status: decision,
      approvedAt: decision === "approved" ? now : null,
      updatedAt: now,
    })
    .where(and(eq(schema.postingPlanItems.id, itemId), eq(schema.postingPlanItems.status, "proposed")))
    .returning({ id: schema.postingPlanItems.id });
  return rows.length > 0;
};

export const listCommunityTargetsForLaunch = async (
  db: NeonHttpDatabase<typeof schema>,
  launchId: string,
): Promise<Array<typeof schema.communityTargets.$inferSelect>> => {
  return db
    .select()
    .from(schema.communityTargets)
    .where(eq(schema.communityTargets.launchId, launchId))
    .orderBy(desc(schema.communityTargets.updatedAt));
};

export const getCommunityTargetById = async (
  db: NeonHttpDatabase<typeof schema>,
  id: string,
): Promise<typeof schema.communityTargets.$inferSelect | undefined> => {
  const [row] = await db.select().from(schema.communityTargets).where(eq(schema.communityTargets.id, id)).limit(1);
  return row;
};

export const listCommunityDraftsForLaunch = async (
  db: NeonHttpDatabase<typeof schema>,
  launchId: string,
): Promise<Array<typeof schema.communityDrafts.$inferSelect>> => {
  return db
    .select()
    .from(schema.communityDrafts)
    .where(eq(schema.communityDrafts.launchId, launchId))
    .orderBy(desc(schema.communityDrafts.updatedAt));
};

export const getCommunityDraftById = async (
  db: NeonHttpDatabase<typeof schema>,
  id: string,
): Promise<typeof schema.communityDrafts.$inferSelect | undefined> => {
  const [row] = await db.select().from(schema.communityDrafts).where(eq(schema.communityDrafts.id, id)).limit(1);
  return row;
};
