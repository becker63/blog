/**
 * Cron-driven executor for `launch_post_jobs` / `launch_post_job_items`.
 */
import { and, asc, eq, isNull, lte, or } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { DistributionSummary } from "public-proof-agent";
import type { Launch } from "public-proof-core";
import { canonicalUrl as buildCanonicalUrl, buildUtmUrl } from "public-proof-core";
import { heuristicSummarizePost, mdxToPlainText, readMdxPost } from "public-proof-content";
import { enqueueScheduledJob, insertNotificationEvent } from "public-proof-db";
import * as schema from "public-proof-db/schema";
import type { PublishInput, PlatformDraft } from "public-proof-platforms";
import { getProvider } from "public-proof-platforms";
import { assertSingleSubredditPublish } from "public-proof-platforms";

export type PublicProofDb = NeonHttpDatabase<typeof schema>;

const TERMINAL_ITEM = new Set(["published", "failed", "skipped", "needs_manual_action"]);

const logEvent = async (
  db: PublicProofDb,
  jobId: string,
  jobItemId: string | null,
  eventType: string,
  message: string,
  metadata?: Record<string, unknown>,
) => {
  await db.insert(schema.launchPostJobEvents).values({
    jobId,
    jobItemId,
    eventType,
    message,
    metadataJson: metadata ?? null,
  });
};

const failJob = async (db: PublicProofDb, jobId: string, summary: string) => {
  const now = new Date();
  await db
    .update(schema.launchPostJobs)
    .set({ status: "failed", completedAt: now, updatedAt: now, summary })
    .where(eq(schema.launchPostJobs.id, jobId));
};

const launchFromRow = (row: typeof schema.launches.$inferSelect): Launch => ({
  id: row.id,
  title: row.title,
  postSlug: row.postSlug,
  canonicalPath: row.canonicalPath,
  campaign: row.campaign,
  primaryClaim: row.primaryClaim,
  resumeClaim: row.resumeClaim,
  platforms: [],
});

const enqueueDeferredRenderReport = async (db: PublicProofDb, jobId: string) => {
  const launchRows = await db
    .select({ launchId: schema.launchPostJobs.launchId })
    .from(schema.launchPostJobs)
    .where(eq(schema.launchPostJobs.id, jobId))
    .limit(1);
  const launchFk = launchRows[0]?.launchId;
  if (!launchFk) return;

  await enqueueScheduledJob(db, {
    kind: "render_report",
    launchId: launchFk,
    jobId,
    publicationId: null,
    runAfter: new Date(Date.now() + 5000),
  });
};

const notifyPostingJobFinished = async (db: PublicProofDb, jobId: string, terminal: string) => {
  const rows = await db
    .select({ launchId: schema.launchPostJobs.launchId })
    .from(schema.launchPostJobs)
    .where(eq(schema.launchPostJobs.id, jobId))
    .limit(1);
  const launchFk = rows[0]?.launchId;
  if (!launchFk) return;

  const launchRows = await db
    .select({ slug: schema.launches.slug, title: schema.launches.title })
    .from(schema.launches)
    .where(eq(schema.launches.id, launchFk))
    .limit(1);
  const launch = launchRows[0];
  if (!launch) return;

  let eventType = "posting_job_completed";
  if (terminal === "failed") eventType = "posting_job_failed";
  else if (terminal === "partially_completed") eventType = "posting_job_partially_completed";

  await insertNotificationEvent(db, {
    eventType,
    launchId: launchFk,
    jobId,
    title: `${launch.slug}: posting job ${terminal.replace(/_/g, " ")}`,
    metadataJson: { terminal, slug: launch.slug },
  });
};

const finalizeJobIfAllTerminal = async (db: PublicProofDb, jobId: string) => {
  const items = await db
    .select({ status: schema.launchPostJobItems.status })
    .from(schema.launchPostJobItems)
    .where(eq(schema.launchPostJobItems.jobId, jobId));

  if (items.length === 0) {
    const now = new Date();
    await db
      .update(schema.launchPostJobs)
      .set({ status: "completed", completedAt: now, updatedAt: now })
      .where(eq(schema.launchPostJobs.id, jobId));
    await enqueueDeferredRenderReport(db, jobId);
    await notifyPostingJobFinished(db, jobId, "completed");
    return;
  }

  if (items.some((i) => !TERMINAL_ITEM.has(i.status))) return;

  const hasPublished = items.some((i) => i.status === "published");
  const hasFailed = items.some((i) => i.status === "failed");
  const hasManual = items.some((i) => i.status === "needs_manual_action");

  let status: "completed" | "failed" | "partially_completed" = "completed";
  if (hasFailed && hasPublished) status = "partially_completed";
  else if (hasFailed && !hasPublished) status = "failed";
  else if (hasManual && hasPublished) status = "partially_completed";
  else if (hasManual && !hasPublished) status = "failed";

  const now = new Date();
  await db
    .update(schema.launchPostJobs)
    .set({ status, completedAt: now, updatedAt: now })
    .where(eq(schema.launchPostJobs.id, jobId));
  await logEvent(db, jobId, null, "job_finalized", `Job finished as ${status}`, { status });
  await enqueueDeferredRenderReport(db, jobId);
  await notifyPostingJobFinished(db, jobId, status);
};

export const executePostingJobsCron = async (
  db: PublicProofDb,
  opts?: { limit?: number },
): Promise<{ processed: number; jobIds: string[] }> => {
  const limit = opts?.limit ?? 5;
  const jobs = await db
    .select()
    .from(schema.launchPostJobs)
    .where(eq(schema.launchPostJobs.status, "queued"))
    .orderBy(asc(schema.launchPostJobs.queuedAt))
    .limit(limit);

  for (const job of jobs) {
    await executeLaunchPostJob(db, job.id);
  }

  return { processed: jobs.length, jobIds: jobs.map((j) => j.id) };
};

export const executeLaunchPostJob = async (
  db: PublicProofDb,
  jobId: string,
): Promise<{ ok: boolean; error?: string }> => {
  const jobRows = await db
    .select()
    .from(schema.launchPostJobs)
    .where(eq(schema.launchPostJobs.id, jobId))
    .limit(1);
  const job = jobRows[0];
  if (!job) return { ok: false, error: "job_not_found" };
  if (job.status !== "queued" && job.status !== "running") return { ok: false, error: "invalid_job_status" };

  const launchRows = await db
    .select()
    .from(schema.launches)
    .where(eq(schema.launches.id, job.launchId))
    .limit(1);
  const launchRow = launchRows[0];
  if (!launchRow) {
    await failJob(db, job.id, "Launch row missing");
    await logEvent(db, job.id, null, "launch_missing", "Launch not found for job");
    return { ok: false, error: "launch_not_found" };
  }

  if (job.audienceGate !== launchRow.audienceGate) {
    await failJob(db, job.id, "Audience gate mismatch");
    await logEvent(db, job.id, null, "gate_mismatch", "Job audience_gate does not match launch", {
      jobGate: job.audienceGate,
      launchGate: launchRow.audienceGate,
    });
    return { ok: false, error: "audience_gate_mismatch" };
  }

  if (!job.dryRun && !job.approvedAt) {
    await failJob(db, job.id, "Live job requires approval");
    await logEvent(db, job.id, null, "approval_missing", "approvedAt is required when dryRun is false");
    return { ok: false, error: "not_approved" };
  }

  const redditItems = await db
    .select()
    .from(schema.launchPostJobItems)
    .where(
      and(eq(schema.launchPostJobItems.jobId, job.id), eq(schema.launchPostJobItems.provider, "reddit")),
    );
  if (redditItems.length > 1) {
    const msg = "Refusing to run job with multiple Reddit items; consolidate to one item per job.";
    await failJob(db, job.id, msg);
    await logEvent(db, job.id, null, "reddit_guard", msg);
    return { ok: false, error: "reddit_multi_item" };
  }

  const now = new Date();
  if (job.status === "queued") {
    await db
      .update(schema.launchPostJobs)
      .set({ status: "running", startedAt: job.startedAt ?? now, updatedAt: now })
      .where(eq(schema.launchPostJobs.id, job.id));
    await logEvent(db, job.id, null, "job_started", "Executor marked job running");
    await insertNotificationEvent(db, {
      eventType: "posting_job_started",
      launchId: launchRow.id,
      jobId: job.id,
      title: `${launchRow.slug}: posting job running`,
      body: `${job.dryRun ? "Dry-run executor" : "Live executor"} started job ${job.id}.`,
      metadataJson: { slug: launchRow.slug, dryRun: job.dryRun },
    });
  }

  const pending = await db
    .select()
    .from(schema.launchPostJobItems)
    .where(and(eq(schema.launchPostJobItems.jobId, job.id), eq(schema.launchPostJobItems.status, "pending")))
    .orderBy(asc(schema.launchPostJobItems.createdAt));

  for (const item of pending) {
    await executeLaunchPostJobItem(db, job, launchRow, item.id);
  }

  await finalizeJobIfAllTerminal(db, job.id);
  return { ok: true };
};

export const executeLaunchPostJobItem = async (
  db: PublicProofDb,
  job: typeof schema.launchPostJobs.$inferSelect,
  launchRow: typeof schema.launches.$inferSelect,
  itemId: string,
): Promise<void> => {
  const itemRows = await db
    .select()
    .from(schema.launchPostJobItems)
    .where(eq(schema.launchPostJobItems.id, itemId))
    .limit(1);
  const item = itemRows[0];
  if (!item || item.jobId !== job.id) return;
  const now = new Date();

  if (
    ((item.platformPostId ?? "").toString().trim() !== "" ||
      (item.url ?? "").toString().trim() !== "") &&
    item.status === "pending"
  ) {
    const resolved = item.completedAt ?? now;
    await db
      .update(schema.launchPostJobItems)
      .set({ status: "published", completedAt: resolved, updatedAt: resolved, lastError: null })
      .where(eq(schema.launchPostJobItems.id, itemId));
    await logEvent(db, job.id, itemId, "item_idempotent_marker", "Item already referenced URL/platform id — marked published without re-posting.");
    await finalizeJobIfAllTerminal(db, job.id);
    return;
  }
  if (item.status !== "pending") return;

  if (item.scheduledFor && item.scheduledFor.getTime() > now.getTime()) {
    return;
  }

  const claimed = await db
    .update(schema.launchPostJobItems)
    .set({
      status: "running",
      startedAt: item.startedAt ?? now,
      attempts: item.attempts + 1,
      updatedAt: now,
    })
    .where(
      and(
        eq(schema.launchPostJobItems.id, itemId),
        eq(schema.launchPostJobItems.status, "pending"),
        or(isNull(schema.launchPostJobItems.scheduledFor), lte(schema.launchPostJobItems.scheduledFor, now)),
      ),
    )
    .returning({ id: schema.launchPostJobItems.id });

  if (claimed.length === 0) return;

  try {
    const launch = launchFromRow(launchRow);
    const post = readMdxPost(launch.postSlug);
    const summary = heuristicSummarizePost(post, launch.primaryClaim) as DistributionSummary;
    const canonical = buildCanonicalUrl(launch.canonicalPath);
    const utmUrl = buildUtmUrl(canonical, {
      source: item.provider,
      medium: "social",
      campaign: launch.campaign,
    });
    const markdown = post.body;
    const plainText = mdxToPlainText(post.body);

    const renderBase: Omit<PublishInput, "draft" | "confirm" | "dryRun" | "subreddit"> = {
      launch,
      post,
      summary,
      canonicalUrl: canonical,
      utmUrl,
      markdown,
      plainText,
    };

    const adapter = getProvider(item.provider);
    let draft: PlatformDraft;

    if (item.draftId) {
      const draftRows = await db
        .select()
        .from(schema.drafts)
        .where(eq(schema.drafts.id, item.draftId))
        .limit(1);
      const d = draftRows[0];
      if (d) {
        const warnings = Array.isArray(d.warningsJson) ? (d.warningsJson as string[]) : [];
        draft = {
          provider: item.provider,
          title: d.title ?? undefined,
          body: d.body,
          firstComment: d.firstComment ?? undefined,
          warnings,
          metadata: { source: "drafts_table" },
        };
      } else {
        draft = await adapter.renderDraft(renderBase);
      }
    } else {
      draft = await adapter.renderDraft(renderBase);
    }

    if (!adapter.publish) {
      const done = new Date();
      await db
        .update(schema.launchPostJobItems)
        .set({
          status: "needs_manual_action",
          completedAt: done,
          updatedAt: done,
          lastError: null,
        })
        .where(eq(schema.launchPostJobItems.id, itemId));
      await logEvent(db, job.id, itemId, "manual_only", "Provider has no publish implementation", {
        provider: item.provider,
      });
      return;
    }

    if (item.provider === "reddit" && item.destinationName) {
      assertSingleSubredditPublish([item.destinationName]);
    }

    const publishInput: PublishInput = {
      ...renderBase,
      draft,
      confirm: !job.dryRun,
      dryRun: job.dryRun,
      subreddit: item.destinationName ?? undefined,
    };

    const pub = await adapter.publish(publishInput);
    const finished = new Date();

    if (!job.dryRun && pub.status === "published" && pub.url) {
      const inserted = await db
        .insert(schema.publications)
        .values({
          launchId: launch.id,
          destinationId: null,
          draftId: item.draftId,
          provider: item.provider,
          platformPostId: pub.platformPostId ?? null,
          url: pub.url,
          status: pub.status,
          scheduledFor: null,
          publishedAt: pub.publishedAt ? new Date(pub.publishedAt) : finished,
          rawJson: pub as unknown as Record<string, unknown>,
        })
        .returning({ id: schema.publications.id });
      const pubId = inserted[0]?.id;
      if (pubId) {
        await enqueueScheduledJob(db, {
          kind: "sync_metrics",
          launchId: launch.id,
          publicationId: pubId,
          jobId: job.id,
          runAfter: new Date(Date.now() + 60 * 60 * 1000),
        });
      }
    }

    await db
      .update(schema.launchPostJobItems)
      .set({
        status: "published",
        platformPostId: pub.platformPostId ?? null,
        url: pub.url ?? null,
        completedAt: finished,
        updatedAt: finished,
        lastError: null,
      })
      .where(eq(schema.launchPostJobItems.id, itemId));

    await logEvent(db, job.id, itemId, "item_published", `Published with status ${pub.status}`, {
      dryRun: job.dryRun,
      publicationStatus: pub.status,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const done = new Date();
    await db
      .update(schema.launchPostJobItems)
      .set({
        status: "failed",
        completedAt: done,
        updatedAt: done,
        lastError: msg,
      })
      .where(eq(schema.launchPostJobItems.id, itemId));
    await logEvent(db, job.id, itemId, "item_failed", msg);
  }
};
