import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AdminAccentNavLink,
  AdminPageSections,
  AdminPanel,
  AdminSubNav,
} from "@/app/components/admin/ui";
import { launchAgents as rs } from "@/app/components/admin/ui/admin-route-styles";

type Props = { params: { slug: string } };

async function load(slug: string) {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { getLaunchBySlug } = await import("public-proof-db/queries/launches");
    const { listAgentTracesForLaunch } = await import("public-proof-db/queries/agent-traces");
    const db = getPublicProofDb();
    const launch = await getLaunchBySlug(db, slug);
    if (!launch) return null;
    const traces = await listAgentTracesForLaunch(db, launch.id, 40);
    return { launch, traces };
  } catch {
    return null;
  }
}

export default async function LaunchAgentsPage({ params }: Props) {
  const data = await load(params.slug);
  if (data === null) notFound();
  const { launch, traces } = data;

  return (
    <AdminPageSections>
      <AdminSubNav>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}`}>← Launch detail</AdminAccentNavLink>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}/jobs`}>Posting jobs</AdminAccentNavLink>
      </AdminSubNav>
      <AdminPanel>
        <h1 className={rs.h1}>Agent traces · {launch.title}</h1>
        <p className={rs.lead}>
          Cursor JSON runs stored in <code className={rs.codeMono}>agent_trace_*</code>.
        </p>
        {traces.length === 0 ? (
          <p className={rs.emptyState}>No traces yet for this launch (run agent tasks with Postgres + launch UUID).</p>
        ) : (
          <ul className={rs.traceList}>
            {traces.map((t) => (
              <li key={t.id}>
                <Link href={`/admin/launches/${launch.slug}/agents/${t.id}`} className={rs.traceLink}>
                  {t.taskName}
                </Link>
                <span className={rs.traceStatus}>{t.status}</span>
                <span className={rs.traceId}>{t.id}</span>
                <span className={rs.traceTime}>{t.startedAt.toISOString()}</span>
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </AdminPageSections>
  );
}
