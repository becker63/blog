"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getPublicProofDb } from "public-proof-db/client";
import { insertAuditLog } from "public-proof-db/queries/audit-log";
import { getLaunchBySlug } from "public-proof-db/queries/launches";
import {
  getCommunityDraftById,
  getCommunityTargetById,
  getPostingPlanById,
  getPostingPlanItemById,
  setPostingPlanItemDecision,
} from "public-proof-db/queries/posting-plan";

import { validateAdminCookies } from "./session-verify";

export async function approvePostingPlanItem(formData: FormData): Promise<void> {
  if (!validateAdminCookies()) redirect("/admin/login");
  const slug = String(formData.get("slug") ?? "").trim();
  const itemId = String(formData.get("itemId") ?? "").trim();
  if (!slug || !itemId) return;

  const db = getPublicProofDb();
  const launch = await getLaunchBySlug(db, slug);
  if (!launch) return;

  const item = await getPostingPlanItemById(db, itemId);
  if (!item) return;
  const plan = await getPostingPlanById(db, item.postingPlanId);
  if (!plan || plan.launchId !== launch.id) return;

  const ok = await setPostingPlanItemDecision(db, itemId, "approved");
  if (!ok) return;

  await insertAuditLog(db, {
    actor: "owner",
    event: "posting_plan_item_approved",
    entityType: "posting_plan_items",
    entityId: itemId,
    metadataJson: { slug, postingPlanId: item.postingPlanId },
  });

  revalidatePath(`/admin/launches/${slug}/posting-plan`);
  revalidatePath(`/admin/launches/${slug}`);
}

export async function rejectPostingPlanItem(formData: FormData): Promise<void> {
  if (!validateAdminCookies()) redirect("/admin/login");
  const slug = String(formData.get("slug") ?? "").trim();
  const itemId = String(formData.get("itemId") ?? "").trim();
  if (!slug || !itemId) return;

  const db = getPublicProofDb();
  const launch = await getLaunchBySlug(db, slug);
  if (!launch) return;

  const item = await getPostingPlanItemById(db, itemId);
  if (!item) return;
  const plan = await getPostingPlanById(db, item.postingPlanId);
  if (!plan || plan.launchId !== launch.id) return;

  const ok = await setPostingPlanItemDecision(db, itemId, "rejected");
  if (!ok) return;

  await insertAuditLog(db, {
    actor: "owner",
    event: "posting_plan_item_rejected",
    entityType: "posting_plan_items",
    entityId: itemId,
    metadataJson: { slug, postingPlanId: item.postingPlanId },
  });

  revalidatePath(`/admin/launches/${slug}/posting-plan`);
  revalidatePath(`/admin/launches/${slug}`);
}
