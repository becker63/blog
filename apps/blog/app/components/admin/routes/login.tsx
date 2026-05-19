import {
  AdminAlert,
  AdminAuthPanel,
  AdminBody,
  AdminInlineCode,
  AdminInput,
  AdminLabel,
  AdminLoginBackLink,
  AdminLoginHeading,
  AdminPrimaryButton,
  AdminPublicCenter,
  AdminPublicFrame,
  AdminStack,
  AdminStackLoose,
} from "@/app/components/admin/ui";
import { adminLogin } from "@/lib/admin/session-actions";

type Props = { searchParams?: { error?: string } };

export default function AdminLoginPage({ searchParams }: Props) {
  const err = searchParams?.error;

  return (
    <AdminPublicFrame>
      <AdminPublicCenter>
        <AdminAuthPanel>
          <AdminStackLoose>
            <AdminLoginHeading>PublicProof admin</AdminLoginHeading>
            <AdminBody>
              Server session derives from <AdminInlineCode>PUBLIC_PROOF_ADMIN_SECRET</AdminInlineCode>; keep secrets in
              Vercel env, not committed config.
            </AdminBody>
            {err ? <AdminAlert>Incorrect secret or missing server configuration.</AdminAlert> : null}
            <form action={adminLogin}>
              <AdminStack>
                <AdminLabel>
                  Admin secret
                  <AdminInput name="password" type="password" autoComplete="current-password" required />
                </AdminLabel>
                <AdminPrimaryButton type="submit">Sign in</AdminPrimaryButton>
              </AdminStack>
            </form>
            <AdminLoginBackLink href="/">← Back to blog</AdminLoginBackLink>
          </AdminStackLoose>
        </AdminAuthPanel>
      </AdminPublicCenter>
    </AdminPublicFrame>
  );
}
