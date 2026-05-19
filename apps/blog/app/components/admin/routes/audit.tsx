import {
  AdminAccentNavLink,
  AdminInlineCode,
  AdminMonoBreak,
  AdminMuted,
  AdminNoWrap,
  AdminPageSections,
  AdminPageTitle,
  AdminPanel,
  AdminPanelStack,
  AdminTable,
  AdminTableWrap,
  AdminTd,
  AdminTh,
  AdminTr,
} from "@/app/components/admin/ui";

async function loadAudit() {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { listRecentAuditLogs } = await import("public-proof-db/queries/audit-log");
    return await listRecentAuditLogs(getPublicProofDb(), 75);
  } catch {
    return null;
  }
}

export default async function AdminAuditPage() {
  const rows = await loadAudit();

  return (
    <AdminPageSections>
      <AdminPanelStack>
        <AdminPanel>
          <AdminPageTitle>Audit log</AdminPageTitle>
          <AdminMuted>Recent mutations and security-sensitive actions ({rows?.length ?? 0} newest).</AdminMuted>
          {rows === null ? (
            <AdminMuted>
              Could not reach Postgres (<AdminInlineCode>POSTGRES_URL</AdminInlineCode>).
            </AdminMuted>
          ) : rows.length === 0 ? (
            <AdminMuted>No audit rows yet. Change an audience gate to generate one.</AdminMuted>
          ) : (
            <AdminTableWrap>
              <AdminTable>
                <thead>
                  <tr>
                    <AdminTh>Created</AdminTh>
                    <AdminTh>Actor</AdminTh>
                    <AdminTh>Event</AdminTh>
                    <AdminTh>Entity</AdminTh>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <AdminTr key={r.id}>
                      <AdminTd>
                        <AdminNoWrap>{r.createdAt.toISOString()}</AdminNoWrap>
                      </AdminTd>
                      <AdminTd>
                        <AdminMonoBreak>{r.actor}</AdminMonoBreak>
                      </AdminTd>
                      <AdminTd>
                        <AdminMonoBreak>{r.event}</AdminMonoBreak>
                      </AdminTd>
                      <AdminTd>
                        <AdminMonoBreak>{r.entityType}</AdminMonoBreak>
                        {r.entityId ? (
                          <>
                            {" "}
                            · <AdminMonoBreak>{r.entityId}</AdminMonoBreak>
                          </>
                        ) : null}
                      </AdminTd>
                    </AdminTr>
                  ))}
                </tbody>
              </AdminTable>
            </AdminTableWrap>
          )}
          <AdminMuted>
            <AdminAccentNavLink href="/admin/launches">← Back to launches</AdminAccentNavLink>
          </AdminMuted>
        </AdminPanel>
      </AdminPanelStack>
    </AdminPageSections>
  );
}
