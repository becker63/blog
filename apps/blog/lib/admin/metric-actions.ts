"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  manualMetricSnapshotFormSchema,
  parseOptionalNonNegativeInt,
} from "public-proof-core/manual-metric-form-schema";
import { getPublicProofDb } from "public-proof-db/client";
import { insertAuditLog } from "public-proof-db/queries/audit-log";
import { getLaunchBySlug } from "public-proof-db/queries/launches";
import { insertManualMetricSnapshotRow } from "public-proof-db/queries/metrics";

import { validateAdminCookies } from "./session-verify";

export async function recordManualLaunchMetricSnapshot(formData: FormData): Promise<void> {
  if (!validateAdminCookies()) redirect("/admin/login");

  const raw = Object.fromEntries(formData.entries());

  const base = manualMetricSnapshotFormSchema.safeParse({
    slug: raw.slug,
    capturedAt: raw.capturedAt,
    provider: raw.provider,
    notes: raw.notes,
  });
  if (!base.success) return;

  let impressions: number | undefined;
  let views: number | undefined;
  let reactions: number | undefined;
  let comments: number | undefined;
  let reposts: number | undefined;
  let clicks: number | undefined;
  let saves: number | undefined;
  let profileViews: number | undefined;
  let followersDelta: number | undefined;
  let siteVisits: number | undefined;

  try {
    impressions = parseOptionalNonNegativeInt(formData.get("impressions"));
    views = parseOptionalNonNegativeInt(formData.get("views"));
    reactions = parseOptionalNonNegativeInt(formData.get("reactions"));
    comments = parseOptionalNonNegativeInt(formData.get("comments"));
    reposts = parseOptionalNonNegativeInt(formData.get("reposts"));
    clicks = parseOptionalNonNegativeInt(formData.get("clicks"));
    saves = parseOptionalNonNegativeInt(formData.get("saves"));
    profileViews = parseOptionalNonNegativeInt(formData.get("profileViews"));
    followersDelta = parseOptionalNonNegativeInt(formData.get("followersDelta"));
    siteVisits = parseOptionalNonNegativeInt(formData.get("siteVisits"));
  } catch {
    return;
  }

  const capturedDate = new Date(base.data.capturedAt);
  if (Number.isNaN(capturedDate.getTime())) return;

  const db = getPublicProofDb();
  const launch = await getLaunchBySlug(db, base.data.slug);
  if (!launch) return;

  const snapshotId = await insertManualMetricSnapshotRow(db, {
    launchId: launch.id,
    capturedAt: capturedDate,
    provider: base.data.provider ?? null,
    notes: base.data.notes ?? null,
    impressions: impressions ?? null,
    views: views ?? null,
    reactions: reactions ?? null,
    comments: comments ?? null,
    reposts: reposts ?? null,
    clicks: clicks ?? null,
    saves: saves ?? null,
    profileViews: profileViews ?? null,
    followersDelta: followersDelta ?? null,
    siteVisits: siteVisits ?? null,
  });

  await insertAuditLog(db, {
    actor: "owner",
    event: "metric_snapshot_manual_written",
    entityType: "metric_snapshots",
    entityId: snapshotId,
    metadataJson: { slug: base.data.slug, source: "manual" },
  });

  revalidatePath(`/admin/launches/${base.data.slug}/metrics`);
}
