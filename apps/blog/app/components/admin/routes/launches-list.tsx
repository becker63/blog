import {
  AdminDetailList,
  AdminInlineCode,
  AdminMuted,
  AdminMono,
  AdminPageSections,
  AdminPageTitle,
  AdminPanel,
  AdminPanelStack,
  AdminStack,
  AdminTextLink,
} from "@/app/components/admin/ui";

async function loadLaunches() {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { listLaunchesWithAdminCounts } = await import("public-proof-db/queries/launch-admin");
    return await listLaunchesWithAdminCounts(getPublicProofDb());
  } catch {
    return null;
  }
}

export default async function LaunchesPage() {
  const rows = await loadLaunches();

  return (
    <AdminPageSections>
      <AdminPanelStack>
        <AdminPanel>
          <AdminPageTitle>Launches</AdminPageTitle>
          {rows === null ? (
            <AdminMuted>
              Could not reach Postgres (<AdminInlineCode>POSTGRES_URL</AdminInlineCode>). Import will still validate fixtures +
              MDX.
            </AdminMuted>
          ) : rows.length === 0 ? (
            <AdminMuted>
              Before persisting, validate fixture + MDX:{" "}
              <AdminInlineCode>bunx nx run public-proof-cli:import-launch --launch=searchbench-100x</AdminInlineCode>. Then
              upsert Postgres:{" "}
              <AdminInlineCode>bunx nx run public-proof-cli:import-launch --configuration=persist --launch=searchbench-100x</AdminInlineCode>
              .
            </AdminMuted>
          ) : (
            <AdminDetailList>
              {rows.map(({ launch, destinationCount, queuedOrRunningJobs }) => (
                <li key={launch.id}>
                  <AdminStack>
                    <AdminTextLink href={`/admin/launches/${launch.slug}`}>
                      <strong>{launch.title}</strong>
                    </AdminTextLink>
                    <AdminMuted>
                      gate: {launch.audienceGate} · status: {launch.status}
                    </AdminMuted>
                    <AdminMono>
                      destinations: {destinationCount} · active jobs (queued/running): {queuedOrRunningJobs}
                    </AdminMono>
                  </AdminStack>
                </li>
              ))}
            </AdminDetailList>
          )}
        </AdminPanel>
      </AdminPanelStack>
    </AdminPageSections>
  );
}
