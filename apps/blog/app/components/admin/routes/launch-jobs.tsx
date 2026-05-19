import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AdminAccentNavLink,
  AdminPageSections,
  AdminPanel,
  AdminSubNav,
} from "@/app/components/admin/ui";
import { launchJobs as rs } from "@/app/components/admin/ui/admin-route-styles";
import { createDryRunPostingJob } from "@/lib/admin/job-actions";

type Props = { params: { slug: string } };

async function load(slug: string) {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { getLaunchBySlug } = await import("public-proof-db/queries/launches");
    const { launchHasBlockingPostingJob, listLaunchPostJobsForLaunch } = await import(
      "public-proof-db/queries/launch-post-jobs"
    );
    const db = getPublicProofDb();
    const launch = await getLaunchBySlug(db, slug);
    if (!launch) return null;
    const blocking = await launchHasBlockingPostingJob(db, launch.id);
    const jobs = await listLaunchPostJobsForLaunch(db, launch.id);
    return { launch, jobs, blocking };
  } catch {
    return null;
  }
}

export default async function LaunchJobsPage({ params }: Props) {
  const data = await load(params.slug);
  if (data === null) notFound();
  const { launch, jobs, blocking } = data;

  return (
    <AdminPageSections>
      <AdminSubNav>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}`}>← Launch detail</AdminAccentNavLink>
      </AdminSubNav>
      <AdminPanel>
        <h1 className={rs.h1}>Posting jobs · {launch.title}</h1>
        <p className={rs.slugLine}>Slug · {launch.slug}</p>

        <form action={createDryRunPostingJob} className={rs.formRow}>
          <input type="hidden" name="slug" value={launch.slug} />
          <button type="submit" className={rs.btnGhost} disabled={blocking}>
            Create dry-run job (DEV.to)
          </button>
          <span className={rs.hintSpan}>
            {blocking
              ? "Another queued/running posting job exists for this launch."
              : "Adds a queued dry-run DEV.to item; POST /api/cron/public-proof/execute-posting-jobs with CRON_SECRET (or rely on Vercel cron)."}
          </span>
        </form>

        {jobs.length === 0 ? (
          <p className={rs.emptyState}>No historical jobs recorded yet.</p>
        ) : (
          <ul className={rs.jobList}>
            {jobs.map((j) => (
              <li key={j.id}>
                <Link href={`/admin/launches/${launch.slug}/jobs/${j.id}`} className={rs.jobLink}>
                  {j.status}
                </Link>
                <span className={rs.jobId}>{j.id}</span>
                <span className={rs.jobMeta}>
                  dryRun: {String(j.dryRun)} · queued: {j.queuedAt ? j.queuedAt.toISOString() : "—"}
                </span>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </AdminPageSections>
  );
}
