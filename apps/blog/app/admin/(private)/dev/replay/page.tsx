import dynamic from "next/dynamic";

import {
  AdminBody,
  AdminBulletList,
  AdminInlineCode,
  AdminMuted,
  AdminPageSections,
  AdminPanel,
  AdminPanelGrid,
  AdminSectionTitle,
} from "@/app/components/admin/ui";

import { DevWorldSseLog } from "@/app/components/admin/dev/DevWorldSseLog";
import { runAdminScenario, type AdminDataSource } from "public-proof-admin-core";

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

export default async function AdminDevReplayPage() {
  const source: AdminDataSource = "fixture";
  const initialWorld = runAdminScenario(source, null);

  return (
    <AdminPageSections>
      <AdminPanelGrid>
        <AdminPanel>
          <AdminSectionTitle>Dev: fixture replay</AdminSectionTitle>
          <AdminBody>
            Same Jotai + RxJS bridge as the overview. Optional SSE tap below streams{" "}
            <AdminInlineCode>ADMIN_UI_WORLD_EVENTS</AdminInlineCode> for integration checks.
          </AdminBody>
        </AdminPanel>

        <AdminOverviewMetricsIsland source={source} dbPayload={null} initialWorld={initialWorld} />

        <AdminPanel>
          <AdminSectionTitle>SSE event tap</AdminSectionTitle>
          <DevWorldSseLog />
        </AdminPanel>

        <AdminPanel>
          <AdminSectionTitle>Notes</AdminSectionTitle>
          <AdminBulletList>
            <li>
              Set <AdminInlineCode>PUBLIC_PROOF_ADMIN_WORLD_SOURCE=fixture</AdminInlineCode> on the server to drive the overview from the
              canonical fixture (no DB).
            </li>
            <li>
              Endpoint: <AdminInlineCode>GET /api/admin/world-events</AdminInlineCode> (session cookie required).
            </li>
          </AdminBulletList>
        </AdminPanel>
      </AdminPanelGrid>
    </AdminPageSections>
  );
}
