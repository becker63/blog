"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getPublicProofDb } from "public-proof-db/client";
import { insertAuditLog } from "public-proof-db/queries/audit-log";
import { getLaunchBySlug } from "public-proof-db/queries/launches";
import {
  getLaunchPostJobById,
  insertQueuedDryRunDevtoJob,
  launchHasBlockingPostingJob,
  queueDraftPostingJob,
} from "public-proof-db/queries/launch-post-jobs";
import { insertNotificationEvent } from "public-proof-db/queries/notifications";

import { validateAdminCookies } from "./session-verify";

export async function createDryRunPostingJob(formData: FormData): Promise<void> {
  if (!validateAdminCookies()) redirect("/admin/login");
  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return;

  const db = getPublicProofDb();
  const launch = await getLaunchBySlug(db, slug);
  if (!launch) return;

  if (await launchHasBlockingPostingJob(db, launch.id)) {
    return;
  }

  const { jobId } = await insertQueuedDryRunDevtoJob(db, launch);
  await insertAuditLog(db, {
    actor: "owner",
    event: "posting_job_dry_run_created",
    entityType: "launch_post_jobs",
    entityId: jobId,
    metadataJson: { slug, draft: true, provider: "devto" },
  });

  await insertNotificationEvent(db, {
    eventType: "posting_job_queued",
    launchId: launch.id,
    jobId,
    title: `${slug}: dry-run posting job queued`,
    body: "Queued DEV.to dry-run item from admin dashboard.",
    metadataJson: { slug, dryRun: true },
  });

  revalidatePath(`/admin/launches/${slug}/jobs`);
  revalidatePath(`/admin/launches/${slug}`);
}

export async function queuePostingJobDraft(formData: FormData): Promise<void> {
  if (!validateAdminCookies()) redirect("/admin/login");
  const slug = String(formData.get("slug") ?? "").trim();
  const jobId = String(formData.get("jobId") ?? "").trim();
  if (!slug || !jobId) return;

  const db = getPublicProofDb();
  const launch = await getLaunchBySlug(db, slug);
  if (!launch) return;

  const job = await getLaunchPostJobById(db, jobId);
  if (!job || job.launchId !== launch.id) return;

  const ok = await queueDraftPostingJob(db, jobId);
  if (!ok) return;

  await insertAuditLog(db, {
    actor: "owner",
    event: "posting_job_queued_from_draft",
    entityType: "launch_post_jobs",
    entityId: jobId,
    metadataJson: { slug },
  });

  await insertNotificationEvent(db, {
    eventType: "posting_job_queued",
    launchId: launch.id,
    jobId,
    title: `${slug}: posting job queued`,
    body: "Draft promoted to queued (executor-ready).",
    metadataJson: { slug, dryRun: job.dryRun },
  });

  revalidatePath(`/admin/launches/${slug}/jobs`);
  revalidatePath(`/admin/launches/${slug}/jobs/${jobId}`);
}
