import Link from "next/link";
import { notFound } from "next/navigation";

import { sumPartialMetrics } from "public-proof-core/metric-aggregate";

import {
  AdminAccentNavLink,
  AdminPageSections,
  AdminPanel,
  AdminSubNav,
} from "@/app/components/admin/ui";
import { launchMetrics as rs } from "@/app/components/admin/ui/admin-route-styles";
import { recordManualLaunchMetricSnapshot } from "@/lib/admin/metric-actions";

type Props = { params: { slug: string } };

async function load(slug: string) {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { getLaunchBySlug } = await import("public-proof-db/queries/launches");
    const { listMetricSnapshotsForLaunch } = await import("public-proof-db/queries/metrics");
    const db = getPublicProofDb();
    const launch = await getLaunchBySlug(db, slug);
    if (!launch) return null;
    const snapshots = await listMetricSnapshotsForLaunch(db, launch.id, 80);
    return { launch, snapshots };
  } catch {
    return null;
  }
}

export default async function LaunchMetricsPage({ params }: Props) {
  const data = await load(params.slug);
  if (!data) notFound();

  const { launch, snapshots } = data;
  const totals = sumPartialMetrics(snapshots);

  const nowIso = new Date().toISOString().slice(0, 16);

  return (
    <AdminPageSections>
      <AdminSubNav>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}`}>← Launch detail</AdminAccentNavLink>
      </AdminSubNav>

      <AdminPanel>
        <h1 className={rs.h1}>Metrics · {launch.title}</h1>
        <p className={rs.lead}>
          Snapshots from <code className={rs.codeMonoXs}>metric_snapshots</code>. Platform APIs /
          cron ingestion continue on the backlog; totals below summarize the numeric columns you have stored today.
        </p>

        {snapshots.length > 0 ? (
          <p className={rs.totalsMono}>
            Rolled totals (shown window rows): impressions {totals.impressions || "0"} · views {totals.views || "0"} · reactions{" "}
            {totals.reactions || "0"} · comments {totals.comments || "0"}
          </p>
        ) : null}

        <h2 className={rs.h2Record}>Record manual snapshot</h2>
        <form action={recordManualLaunchMetricSnapshot} className={rs.formCol}>
          <input type="hidden" name="slug" value={launch.slug} />
          <label className={rs.labelStyle}>
            Captured at (local)
            <input className={rs.inputStyle} type="datetime-local" name="capturedAt" defaultValue={nowIso} required />
          </label>
          <label className={rs.labelStyle}>
            Provider label (optional)
            <input className={rs.inputStyle} type="text" name="provider" placeholder="linkedin, devto, site, …" />
          </label>
          <label className={rs.labelStyle}>
            Notes (optional)
            <textarea name="notes" rows={3} className={rs.inputStyle} />
          </label>
          <div className={rs.fieldRow}>
            {(
              ["impressions", "views", "reactions", "comments", "reposts", "clicks", "saves", "profileViews", "followersDelta", "siteVisits"] as const
            ).map((field) => (
              <label key={field} className={rs.labelStyle}>
                {field}
                <input className={rs.inputStyle} type="number" name={field} min={0} step={1} placeholder="optional" />
              </label>
            ))}
          </div>
          <button type="submit" className={rs.submitBtn}>
            Save manual snapshot (+ audit row)
          </button>
        </form>

        {snapshots.length === 0 ? (
          <p className={rs.emptyState}>No snapshots yet.</p>
        ) : (
          <div className={rs.scrollWrap}>
            <table className={rs.table}>
              <thead>
                <tr>
                  <th className={rs.th}>Captured</th>
                  <th className={rs.th}>Source</th>
                  <th className={rs.th}>Provider</th>
                  <th className={rs.thLast}>Signals</th>
                </tr>
              </thead>
              <tbody>
                {snapshots.map((s) => (
                  <tr key={s.id} className={rs.trBorder}>
                    <td className={rs.tdNowrap}>{s.capturedAt.toISOString()}</td>
                    <td className={rs.tdMono}>{s.source}</td>
                    <td className={rs.tdMono}>{s.provider ?? "—"}</td>
                    <td className={rs.tdSignals}>
                      imp {s.impressions ?? "—"} · v {s.views ?? "—"} · r {s.reactions ?? "—"} · c {s.comments ?? "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </AdminPanel>
    </AdminPageSections>
  );
}
