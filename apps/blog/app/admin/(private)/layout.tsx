import { redirect } from "next/navigation";

import {
  AdminBody,
  AdminBrandBar,
  AdminGhostButton,
  AdminInlineCode,
  AdminMain,
  AdminPanel,
  AdminShell,
} from "@/app/components/admin/ui";
import { AdminJotaiRoot } from "@/app/components/admin/state/AdminJotaiRoot";
import { validateAdminCookies } from "@/lib/admin/session-verify";
import { adminLogout } from "@/lib/admin/session-actions";

export default async function AdminPrivateLayout({ children }: { children: React.ReactNode }) {
  if (!process.env.PUBLIC_PROOF_ADMIN_SECRET?.trim()) {
    return (
      <AdminShell>
        <AdminBrandBar />
        <AdminMain>
          <AdminPanel>
            <AdminBody>
              Set <AdminInlineCode>PUBLIC_PROOF_ADMIN_SECRET</AdminInlineCode> on the server before using the admin
              dashboard.
            </AdminBody>
          </AdminPanel>
        </AdminMain>
      </AdminShell>
    );
  }

  if (!validateAdminCookies()) {
    redirect("/admin/login");
  }

  return (
    <AdminShell>
      <AdminBrandBar
        rightSlot={
          <form action={adminLogout}>
            <AdminGhostButton type="submit">Log out</AdminGhostButton>
          </form>
        }
      />
      <AdminMain>
        <AdminJotaiRoot>{children}</AdminJotaiRoot>
      </AdminMain>
    </AdminShell>
  );
}
