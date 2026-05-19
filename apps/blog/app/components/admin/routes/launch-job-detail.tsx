import { notFound } from "next/navigation";

import {
  AdminAccentNavLink,
  AdminPageSections,
  AdminPanel,
  AdminSubNav,
} from "@/app/components/admin/ui";
import { launchJobDetail as rs } from "@/app/components/admin/ui/admin-route-styles";
import { queuePostingJobDraft } from "@/lib/admin/job-actions";

type Props = { params: { slug: string; jobId: string } };

async function load(slug: string, jobId: string) {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { getLaunchBySlug } = await import("public-proof-db/queries/launches");
    const {
      getLaunchPostJobById,
      listLaunchPostJobEventsForJob,
      listLaunchPostJobItemsForJob,
    } = await import("public-proof-db/queries/launch-post-jobs");

    const db = getPublicProofDb();
    const launch = await getLaunchBySlug(db, slug);
    if (!launch) return null;

    const job = await getLaunchPostJobById(db, jobId);
    if (!job || job.launchId !== launch.id) return null;

    const items = await listLaunchPostJobItemsForJob(db, jobId);
    const events = await listLaunchPostJobEventsForJob(db, jobId);
    return { launch, job, items, events };
  } catch {
    return null;
  }
}

export default async function LaunchJobDetailPage({ params }: Props) {
  const data = await load(params.slug, params.jobId);
  if (!data) notFound();

  const { launch, job, items, events } = data;

  return (
    <AdminPageSections>
      <AdminSubNav>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}/jobs`}>← Jobs</AdminAccentNavLink>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}`}>Launch detail</AdminAccentNavLink>
      </AdminSubNav>
      <AdminPanel>
        <h1 className={rs.h1}>Job {job.status}</h1>
        <p className={rs.idLine}>{job.id}</p>
        <p className={rs.lead}>
          Audience gate · {job.audienceGate} · dryRun {String(job.dryRun)}
          {job.approvedAt ? ` · approved ${job.approvedAt.toISOString()}` : ""}
        </p>

        {job.status === "draft" && (job.dryRun || job.approvedAt) ? (
          <form action={queuePostingJobDraft} className={rs.queueForm}>
            <input type="hidden" name="slug" value={launch.slug} />
            <input type="hidden" name="jobId" value={job.id} />
            <button type="submit" className={rs.queueBtn}>
              Queue posting job
            </button>
            <span className={rs.queueHint}>
              Moves <code className={rs.codeMono}>draft</code> → <code className={rs.codeMono}>queued</code> when dry-run or already
              approved (<code className={rs.codeMono}>approvedAt</code> set).
            </span>
          </form>
        ) : null}

        {job.status === "draft" && !job.dryRun && !job.approvedAt ? (
          <p className={rs.draftWarning}>
            Live drafts need <code className={rs.codeMono}>approvedAt</code> before queuing — wire approval UI soon.
          </p>
        ) : null}

        <h2 className={rs.h2}>Items</h2>
        {items.length === 0 ? (
          <p className={rs.emptyItems}>No destinations on this job yet.</p>
        ) : (
          <table className={rs.table}>
            <thead>
              <tr>
                <th className={rs.th}>Provider</th>
                <th className={rs.th}>Status</th>
                <th className={rs.th}>URL</th>
              </tr>
            </thead>
            <tbody>
              {items.map((i) => (
                <tr key={i.id} className={rs.rowBorder}>
                  <td className={rs.tdMono}>{i.provider}</td>
                  <td className={rs.tdPlain}>{i.status}</td>
                  <td className={rs.tdUrl}>{i.url ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        <h2 className={rs.h2}>Timeline</h2>
        {events.length === 0 ? (
          <p className={rs.emptyEvents}>No events recorded yet.</p>
        ) : (
          <ol className={rs.timeline}>
            {events.map((e) => (
              <li key={e.id} className={rs.eventItem}>
                <span className={rs.eventTime}>{e.createdAt.toISOString()}</span> ·{" "}
                <span className={rs.eventType}>{e.eventType}</span>
                {e.message ? <span>{` — ${e.message}`}</span> : null}
              </li>
            ))}
          </ol>
        )}
      </AdminPanel>
    </AdminPageSections>
  );
}
