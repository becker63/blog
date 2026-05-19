import dynamic from "next/dynamic";

import {
  AdminAccentNavLink,
  AdminBody,
  AdminBulletList,
  AdminDetailList,
  AdminInlineCode,
  AdminMeta,
  AdminMuted,
  AdminPageSections,
  AdminPageTitle,
  AdminPanel,
  AdminPanelGrid,
  AdminSectionTitle,
  AdminTextLink,
} from "@/app/components/admin/ui";
import { overviewResultToDbPayload } from "@/lib/admin/overview-bridge";
import { resolveAdminDataSource, runAdminScenario } from "public-proof-admin-core";

const AdminOverviewMetricsIsland = dynamic(
  () =>
    import("@/app/components/admin/viz/AdminOverviewMetricsIsland").then((m) => ({
      default: m.AdminOverviewMetricsIsland,
    })),
  {
    ssr: false,
    loading: () => (
      <AdminPanel>
        <AdminSectionTitle>Metrics stress</AdminSectionTitle>
        <AdminMuted>Loading chart…</AdminMuted>
      </AdminPanel>
    ),
  },
);

async function loadOverview() {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const {
      countLaunchPostJobsMatchingStatuses,
      countPostingPlanItemsAwaitingDecision,
      LAUNCH_JOB_ISSUE_STATUSES,
      LAUNCH_JOB_RUN_STATUSES,
    } = await import("public-proof-db/queries/admin-overview");
    const { listLaunches } = await import("public-proof-db/queries/launches");
    const { countUnreadNotificationEvents } = await import("public-proof-db/queries/notifications");

    const db = getPublicProofDb();
    const [launches, runningJobs, jobsNeedingAttention, planProposals, unreadNotifications] = await Promise.all([
      listLaunches(db),
      countLaunchPostJobsMatchingStatuses(db, LAUNCH_JOB_RUN_STATUSES),
      countLaunchPostJobsMatchingStatuses(db, LAUNCH_JOB_ISSUE_STATUSES),
      countPostingPlanItemsAwaitingDecision(db),
      countUnreadNotificationEvents(db),
    ]);

    return {
      ok: true as const,
      launches,
      runningJobs,
      jobsNeedingAttention,
      planProposals,
      unreadNotifications,
    };
  } catch {
    return { ok: false as const };
  }
}

export default async function AdminOverviewPage() {
  const data = await loadOverview();
  const source = resolveAdminDataSource();
  const dbPayload = source === "fixture" ? null : overviewResultToDbPayload(data);
  const initialWorld = runAdminScenario(source, dbPayload);

  return (
    <AdminPageSections>
      <AdminPanelGrid>
        <AdminPanel>
          <AdminPageTitle>PublicProof</AdminPageTitle>
          <AdminBody>
            Distribution control plane: launches live in Postgres, canonical posts stay in Git. Wire{" "}
            <AdminInlineCode>Vercel Postgres</AdminInlineCode> (<AdminInlineCode>POSTGRES_URL</AdminInlineCode>) to import
            fixtures and hydrate this UI.
          </AdminBody>
        </AdminPanel>

        {data.ok ? (
          <AdminPanel>
            <AdminSectionTitle>Signals</AdminSectionTitle>
            <AdminBulletList>
              <li>
                Posting jobs in <AdminInlineCode>queued</AdminInlineCode> or <AdminInlineCode>running</AdminInlineCode>:{" "}
                <strong>{data.runningJobs}</strong>
              </li>
              <li>
                Jobs in <AdminInlineCode>failed</AdminInlineCode> / <AdminInlineCode>partially_completed</AdminInlineCode>:{" "}
                <strong>{data.jobsNeedingAttention}</strong>
              </li>
              <li>
                Posting plan items still <AdminInlineCode>proposed</AdminInlineCode>: <strong>{data.planProposals}</strong>
              </li>
              <li>
                Unread notifications:{" "}
                <AdminAccentNavLink href="/admin/notifications">{data.unreadNotifications}</AdminAccentNavLink>
              </li>
            </AdminBulletList>
          </AdminPanel>
        ) : (
          <AdminPanel>
            <AdminSectionTitle>Signals</AdminSectionTitle>
            <AdminMuted>
              Database unavailable — overview counts need <AdminInlineCode>POSTGRES_URL</AdminInlineCode>.
            </AdminMuted>
          </AdminPanel>
        )}

        <AdminPanel>
          <AdminSectionTitle>Quick links</AdminSectionTitle>
          <AdminBulletList>
            <li>
              <AdminTextLink href="/admin/dev/replay">Dev replay + SSE tap</AdminTextLink>
            </li>
            <li>
              <AdminTextLink href="/admin/launches">Launches</AdminTextLink>
            </li>
            <li>
              <AdminTextLink href="/admin/audit">Audit log</AdminTextLink>
            </li>
            <li>
              <AdminTextLink href="/admin/notifications">Notifications</AdminTextLink>
            </li>
            <li>
              <AdminTextLink href="/admin/accounts">Connected accounts</AdminTextLink>
            </li>
            <li>
              <AdminTextLink href="/admin/settings">Settings</AdminTextLink>
            </li>
          </AdminBulletList>
        </AdminPanel>

        <AdminPanel>
          <AdminSectionTitle>Launches in database</AdminSectionTitle>
          {!data.ok ? (
            <AdminMuted>
              Database unavailable (set <AdminInlineCode>POSTGRES_URL</AdminInlineCode>). Run{" "}
              <AdminInlineCode>bunx nx run public-proof-cli:import-launch --configuration=persist --launch=searchbench-100x</AdminInlineCode>{" "}
              locally after Postgres is reachable.
            </AdminMuted>
          ) : data.launches.length === 0 ? (
            <AdminMuted>No launches yet.</AdminMuted>
          ) : (
            <AdminDetailList>
              {data.launches.slice(0, 6).map((l) => (
                <li key={l.slug}>
                  <AdminTextLink href={`/admin/launches/${l.slug}`}>{l.title}</AdminTextLink>
                  <AdminMeta>({l.audienceGate})</AdminMeta>
                </li>
              ))}
            </AdminDetailList>
          )}
        </AdminPanel>

        <AdminOverviewMetricsIsland source={source} dbPayload={dbPayload} initialWorld={initialWorld} />
      </AdminPanelGrid>
    </AdminPageSections>
  );
}
