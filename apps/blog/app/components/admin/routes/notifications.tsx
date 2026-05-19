import {
  AdminDividedItem,
  AdminDividedList,
  AdminInlineCode,
  AdminMonoBreak,
  AdminMuted,
  AdminPageSections,
  AdminPageTitle,
  AdminPanel,
  AdminPreWrap,
} from "@/app/components/admin/ui";

async function load() {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { listRecentNotificationEvents } = await import("public-proof-db/queries/notifications");
    return await listRecentNotificationEvents(getPublicProofDb(), 60);
  } catch {
    return null;
  }
}

export default async function NotificationsPage() {
  const events = await load();

  return (
    <AdminPageSections>
      <AdminPanel>
        <AdminPageTitle>Notifications</AdminPageTitle>
        <AdminMuted>
          Rows from <AdminInlineCode>notification_events</AdminInlineCode>. Emitter wiring from jobs/cron/agents remains on
          the backlog; read path is ready.
        </AdminMuted>

        {events === null ? (
          <AdminMuted>Database unavailable.</AdminMuted>
        ) : events.length === 0 ? (
          <AdminMuted>No notification events recorded yet.</AdminMuted>
        ) : (
          <AdminDividedList>
            {events.map((e) => (
              <AdminDividedItem key={e.id}>
                <AdminMonoBreak>
                  {e.eventType} · {e.status}
                </AdminMonoBreak>
                <AdminMuted>{e.createdAt.toISOString()}</AdminMuted>
                {e.title ? <strong>{e.title}</strong> : null}
                {e.body ? <AdminPreWrap>{e.body}</AdminPreWrap> : null}
              </AdminDividedItem>
            ))}
          </AdminDividedList>
        )}
      </AdminPanel>
    </AdminPageSections>
  );
}
