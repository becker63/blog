import {
  AdminAccentLink,
  AdminDividedItem,
  AdminDividedList,
  AdminInlineCode,
  AdminMonoBreak,
  AdminMuted,
  AdminPageSections,
  AdminPageTitle,
  AdminPanel,
} from "@/app/components/admin/ui";

async function load() {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { listConnectedAccounts } = await import("public-proof-db/queries/accounts");
    return await listConnectedAccounts(getPublicProofDb());
  } catch {
    return null;
  }
}

export default async function AccountsPage() {
  const accounts = await load();

  return (
    <AdminPageSections>
      <AdminPanel>
        <AdminPageTitle>Connected accounts</AdminPageTitle>
        <AdminMuted>
          Encrypted tokens stay in Postgres; manual providers show as <AdminInlineCode>manual</AdminInlineCode>. OAuth connect
          flows and rotation UI are not built yet.
        </AdminMuted>

        {accounts === null ? (
          <AdminMuted>Database unavailable.</AdminMuted>
        ) : accounts.length === 0 ? (
          <AdminMuted>No connected accounts.</AdminMuted>
        ) : (
          <AdminDividedList>
            {accounts.map((a) => (
              <AdminDividedItem key={a.id}>
                <strong>
                  {a.provider} · {a.status}
                </strong>
                <AdminMonoBreak>{a.handle ?? a.displayName ?? a.id}</AdminMonoBreak>
                {a.accountUrl ? (
                  <AdminAccentLink href={a.accountUrl}>Profile</AdminAccentLink>
                ) : null}
              </AdminDividedItem>
            ))}
          </AdminDividedList>
        )}
      </AdminPanel>
    </AdminPageSections>
  );
}
