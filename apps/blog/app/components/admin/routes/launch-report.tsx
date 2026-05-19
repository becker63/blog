import {
  AdminAccentNavLink,
  AdminPageSections,
  AdminPanel,
  AdminSubNav,
} from "@/app/components/admin/ui";
import { launchReport as rs } from "@/app/components/admin/ui/admin-route-styles";
import { notFound } from "next/navigation";

type Props = { params: { slug: string } };

async function load(slug: string) {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { getLaunchBySlug } = await import("public-proof-db/queries/launches");
    const { listLaunchReportsForLaunch } = await import("public-proof-db/queries/reports");
    const db = getPublicProofDb();
    const launch = await getLaunchBySlug(db, slug);
    if (!launch) return null;
    const reports = await listLaunchReportsForLaunch(db, launch.id, 8);
    return { launch, reports };
  } catch {
    return null;
  }
}

export default async function LaunchReportPage({ params }: Props) {
  const data = await load(params.slug);
  if (!data) notFound();

  const { launch, reports } = data;

  return (
    <AdminPageSections>
      <AdminSubNav>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}`}>← Launch detail</AdminAccentNavLink>
      </AdminSubNav>

      <AdminPanel>
        <h1 className={rs.h1}>Launch report · {launch.title}</h1>
        <p className={rs.lead}>
          Latest Markdown blobs come from Postgres <code className={rs.codeMonoXs}>launch_reports</code>{" "}
          after the cron worker runs <code className={rs.codeMonoXs}>render_report</code> jobs.
        </p>
        <ul className={rs.factsList}>
          <li>Canonical · {launch.canonicalPath}</li>
          <li>Gate · {launch.audienceGate}</li>
          <li>
            Cron · POST <code className={rs.codeMonoXs}>/api/cron/public-proof/render-reports</code>
          </li>
        </ul>

        {reports.length === 0 ? (
          <p className={rs.emptyState}>No persisted reports yet.</p>
        ) : (
          reports.map((r) => (
            <section key={r.id} className={rs.section}>
              <p className={rs.jobIdLine}>{r.postingJobId ? `${r.postingJobId.slice(0, 8)}…` : "none"}</p>
              <pre className={rs.preBody}>{r.bodyMarkdown}</pre>
            </section>
          ))
        )}
      </AdminPanel>
    </AdminPageSections>
  );
}
