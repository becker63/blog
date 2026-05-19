import {
  AdminAccentNavLink,
  AdminPageSections,
  AdminPanel,
  AdminSubNav,
} from "@/app/components/admin/ui";
import { launchDrafts as rs } from "@/app/components/admin/ui/admin-route-styles";
import { notFound } from "next/navigation";

type Props = { params: { slug: string } };

const truncate = (s: string, max = 360) =>
  s.length <= max ? s : `${s.slice(0, max)}…`;

async function load(slug: string) {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { getLaunchBySlug } = await import("public-proof-db/queries/launches");
    const { listDraftsForLaunch } = await import("public-proof-db/queries/drafts");
    const db = getPublicProofDb();
    const launch = await getLaunchBySlug(db, slug);
    if (!launch) return null;
    const drafts = await listDraftsForLaunch(db, launch.id);
    return { launch, drafts };
  } catch {
    return null;
  }
}

export default async function LaunchDraftsPage({ params }: Props) {
  const data = await load(params.slug);
  if (!data) notFound();

  const { launch, drafts } = data;

  return (
    <AdminPageSections>
      <AdminSubNav>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}`}>← Launch detail</AdminAccentNavLink>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}/posting-plan`}>Posting plan</AdminAccentNavLink>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}/jobs`}>Jobs</AdminAccentNavLink>
      </AdminSubNav>

      <AdminPanel>
        <h1 className={rs.h1}>Platform drafts · {launch.title}</h1>
        <p className={rs.lead}>
          Destination-native copy in <code className={rs.codeMonoXs}>drafts</code>. Generation
          pipeline (MDX → variants) plugs in via Hermes agents + CLI — this view is read-only until those actions ship.
        </p>

        {drafts.length === 0 ? (
          <p className={rs.emptyState}>No platform drafts stored for this launch yet.</p>
        ) : (
          <ul className={rs.draftList}>
            {drafts.map((d) => (
              <li key={d.id} className={rs.draftItem}>
                <p className={rs.metaLine}>
                  {d.provider} · {d.status} · {d.generatedBy}
                </p>
                {d.title ? <p className={rs.titleLine}>{d.title}</p> : null}
                <pre className={rs.preBody}>{truncate(d.body, 4200)}</pre>
                {d.utmUrl ? <p className={rs.utmLine}>UTM: {d.utmUrl}</p> : null}
              </li>
            ))}
          </ul>
        )}
      </AdminPanel>
    </AdminPageSections>
  );
}
