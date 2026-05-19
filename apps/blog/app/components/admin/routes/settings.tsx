import {
  AdminBulletList,
  AdminInlineCode,
  AdminMuted,
  AdminPageSections,
  AdminPageTitle,
  AdminPanel,
  AdminStackLoose,
} from "@/app/components/admin/ui";

export default function SettingsPage() {
  return (
    <AdminPageSections>
      <AdminPanel>
        <AdminStackLoose>
          <AdminPageTitle>Settings</AdminPageTitle>
          <AdminMuted>
            Server configuration is environment-driven. Common PublicProof variables (see Hermes prompt and{" "}
            <AdminInlineCode>docs/public-proof-local-dev.md</AdminInlineCode>):
          </AdminMuted>
          <AdminBulletList>
          <li>
            <AdminInlineCode>POSTGRES_URL</AdminInlineCode>, non-pooling variants
          </li>
          <li>
            <AdminInlineCode>PUBLIC_PROOF_ADMIN_SECRET</AdminInlineCode> · session cookie gate
          </li>
          <li>
            <AdminInlineCode>CRON_SECRET</AdminInlineCode> · cron route auth
          </li>
          <li>
            <AdminInlineCode>PUBLIC_PROOF_ENCRYPTION_KEY</AdminInlineCode> · token encryption (fail-closed)
          </li>
          <li>Provider keys (DEV.to, Reddit, Bluesky, …)</li>
          </AdminBulletList>
        </AdminStackLoose>
      </AdminPanel>
    </AdminPageSections>
  );
}
