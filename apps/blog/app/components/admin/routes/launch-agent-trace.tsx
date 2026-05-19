import {
  AdminAccentNavLink,
  AdminPageSections,
  AdminPanel,
  AdminSubNav,
} from "@/app/components/admin/ui";
import { launchAgentTrace as rs } from "@/app/components/admin/ui/admin-route-styles";
import { notFound } from "next/navigation";

type Props = { params: { slug: string; traceRunId: string } };

const truncate = (text: string | null, max = 4000) => {
  if (text == null) return "—";
  if (text.length <= max) return text;
  return `${text.slice(0, max)}\n…[truncated in UI]`;
};

async function load(slug: string, traceRunId: string) {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { getLaunchBySlug } = await import("public-proof-db/queries/launches");
    const {
      getAgentTraceRun,
      listAgentTraceArtifacts,
      listAgentTraceEvents,
    } = await import("public-proof-db/queries/agent-traces");
    const db = getPublicProofDb();
    const launch = await getLaunchBySlug(db, slug);
    if (!launch) return null;
    const trace = await getAgentTraceRun(db, traceRunId);
    if (!trace || trace.launchId !== launch.id) return null;
    const events = await listAgentTraceEvents(db, traceRunId);
    const artifacts = await listAgentTraceArtifacts(db, traceRunId);
    return { launch, trace, events, artifacts };
  } catch {
    return null;
  }
}

export default async function AgentTraceDetailPage({ params }: Props) {
  const data = await load(params.slug, params.traceRunId);
  if (data === null) notFound();

  const { launch, trace, events, artifacts } = data;

  return (
    <AdminPageSections>
      <AdminSubNav>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}/agents`}>← Traces</AdminAccentNavLink>
      </AdminSubNav>
      <AdminPanel>
        <h1 className={rs.h1}>{trace.taskName}</h1>
        <p className={rs.idLine}>{trace.id}</p>
        <p className={rs.statusLine}>
          status <span className={rs.mono}>{trace.status}</span> · model{" "}
          <span className={rs.mono}>{trace.model ?? "—"}</span> · started {trace.startedAt.toISOString()}
        </p>

        <h2 className={rs.h2}>Events</h2>
        {events.length === 0 ? (
          <p className={rs.emptyEvents}>No events.</p>
        ) : (
          <ol className={rs.eventList}>
            {events.map((e) => (
              <li key={e.id} className={rs.eventItem}>
                <span className={rs.eventSeq}># {e.sequence}</span> ·{" "}
                <span className={rs.eventType}>{e.eventType}</span> · <span className={rs.eventTime}>{e.createdAt.toISOString()}</span>
                {e.payloadJson ? <pre className={rs.payloadPre}>{truncate(JSON.stringify(e.payloadJson, null, 2), 3500)}</pre> : null}
              </li>
            ))}
          </ol>
        )}

        <h2 className={rs.h2}>Artifacts</h2>
        {artifacts.length === 0 ? (
          <p className={rs.emptyArtifacts}>No artifacts.</p>
        ) : (
          <table className={rs.table}>
            <thead>
              <tr>
                <th className={rs.th}>Kind</th>
                <th className={rs.th}>MIME</th>
              </tr>
            </thead>
            <tbody>
              {artifacts.map((a) => (
                <tr key={a.id} className={rs.rowBorder}>
                  <td className={rs.tdKind}>{a.artifactKind}</td>
                  <td className={rs.tdMime}>
                    <span className={rs.mimeLabel}>{a.contentType}</span>
                    <pre className={rs.artifactPre}>{truncate(a.content ?? null)}</pre>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </AdminPanel>
    </AdminPageSections>
  );
}
