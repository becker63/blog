/**
 * Idempotent-ish demo seed for Postgres: posting plan skeleton, snapshot, launch report, notification.
 * Run from repo root: `bun run public-proof:seed-demo`
 */
import { and, eq } from "drizzle-orm";
import {
  compileLaunchReportMarkdown,
  getLaunchBySlug,
  getPublicProofDb,
  insertLaunchReport,
  insertManualMetricSnapshotRow,
  insertNotificationEvent,
  listLaunchReportsForLaunch,
  listPostingPlansForLaunch,
} from "../src/index";
import * as schema from "../src/schema";

const DEMO_METRIC_NOTE = "demo_seed_publicproof";
const SEED_MARKER = "publicproof_demo_seed";

const main = async () => {
  const db = getPublicProofDb();

  const launch = await getLaunchBySlug(db, "searchbench-100x");
  if (!launch) {
    throw new Error(
      'Launch "searchbench-100x" not found. Import first: bunx nx run public-proof-cli:import-launch --configuration=persist --launch=searchbench-100x',
    );
  }

  const existingPlans = await listPostingPlansForLaunch(db, launch.id);
  if (existingPlans.length === 0) {
    const now = new Date();
    const [target] = await db
      .insert(schema.communityTargets)
      .values({
        launchId: launch.id,
        provider: "reddit",
        communityName: "r/MachineLearning",
        communityUrl: "https://reddit.com/r/MachineLearning",
        topicFitScore: 72,
        audienceFitScore: 68,
        riskScore: 35,
        selfPromotionRisk: "medium",
        ruleRisk: "medium",
        sentiment: "skeptical",
        recommendedAction: "manual_review",
        rationale: "High-signal ML readers; skeptical of vendor posts without measurement detail.",
        notesJson: [SEED_MARKER],
        rawMetadataJson: { seed: true },
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: schema.communityTargets.id });

    const [draft] = await db
      .insert(schema.communityDrafts)
      .values({
        launchId: launch.id,
        communityTargetId: target!.id,
        provider: "reddit",
        draftKind: "link_post",
        title: "SearchBench: ~100× context reduction in agent code-search",
        body: [
          "Running an agent codebase search workload, peak request context dropped from ~617kB to ~6kB while keeping correctness.",
          "",
          `Write-up (canonical): built from ${launch.title}. Happy to dive into instrumentation if useful.`,
          "",
          "(Demo draft generated for PublicProof dashboard — edit before submitting.)",
        ].join("\n"),
        disclosure: "Author-built tooling; synthetic demo seed.",
        riskNotesJson: [SEED_MARKER],
        generatedBy: "admin_seed_demo",
        status: "generated",
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: schema.communityDrafts.id });

    const [plan] = await db
      .insert(schema.postingPlans)
      .values({
        launchId: launch.id,
        status: "generated",
        audienceGate: launch.audienceGate,
        summary:
          "Demo plan: prioritize one technical subreddit after LinkedIn warmup. Approve destinations before creating a frozen posting job.",
        warningsJson: [
          "Inserted by packages/public-proof-db/scripts/seed-demo-sample.ts",
          "Verify audience gate + subreddit rules before any live post.",
        ],
        createdAt: now,
        updatedAt: now,
      })
      .returning({ id: schema.postingPlans.id });

    await db.insert(schema.postingPlanItems).values({
      postingPlanId: plan!.id,
      communityTargetId: target!.id,
      communityDraftId: draft!.id,
      status: "proposed",
      createdAt: now,
      updatedAt: now,
    });

    void process.stdout.write(`Seeded posting plan + community target/draft for ${launch.slug}\n`);
  } else {
    void process.stdout.write(`Skipping plan seed (launch already has ${existingPlans.length} plan(s))\n`);
  }

  const existingDemoMetric = await db
    .select({ id: schema.metricSnapshots.id })
    .from(schema.metricSnapshots)
    .where(eq(schema.metricSnapshots.notes, DEMO_METRIC_NOTE))
    .limit(1);
  if (existingDemoMetric.length === 0) {
    const id = await insertManualMetricSnapshotRow(db, {
      launchId: launch.id,
      provider: "site",
      capturedAt: new Date(),
      impressions: 1200,
      views: 430,
      reactions: 18,
      comments: 6,
      reposts: 2,
      siteVisits: 190,
      notes: DEMO_METRIC_NOTE,
    });
    void process.stdout.write(`Seeded manual metric snapshot ${id}\n`);
  } else {
    void process.stdout.write("Skipping metric seed (demo row already exists)\n");
  }

  const reports = await listLaunchReportsForLaunch(db, launch.id, 12);
  const hasSeedReport = reports.some((r) => r.sourceKind === "admin_seed_demo");
  if (!hasSeedReport) {
    const body = await compileLaunchReportMarkdown(db, launch.id, null);
    const footer = ["", "---", "_Seed layer: pre-job compile for UI smoke test (`admin_seed_demo`)._"].join("\n");
    const rid = await insertLaunchReport(db, {
      launchId: launch.id,
      postingJobId: null,
      bodyMarkdown: body + footer,
      sourceKind: "admin_seed_demo",
    });
    void process.stdout.write(`Seeded launch report ${rid}\n`);
  } else {
    void process.stdout.write("Skipping launch report seed (admin_seed_demo already present)\n");
  }

  const [existingNotif] = await db
    .select({ id: schema.notificationEvents.id })
    .from(schema.notificationEvents)
    .where(
      and(
        eq(schema.notificationEvents.launchId, launch.id),
        eq(schema.notificationEvents.title, `${launch.slug}: demo notification`),
      ),
    )
    .limit(1);

  if (!existingNotif) {
    await insertNotificationEvent(db, {
      eventType: "launch_needs_review",
      launchId: launch.id,
      title: `${launch.slug}: demo notification`,
      body: "Sample notification row for /admin/notifications.",
      metadataJson: { seed: "publicproof_demo", marker: SEED_MARKER },
    });
    void process.stdout.write("Seeded notification event\n");
  } else {
    void process.stdout.write("Skipping notification seed (demo title already exists)\n");
  }

  void process.stdout.write("public-proof seed demo done.\n");
};

main().catch((e) => {
  void process.stderr.write(`${(e as Error).message ?? e}\n`);
  process.exitCode = 1;
});
