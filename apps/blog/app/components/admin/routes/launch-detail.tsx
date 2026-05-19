import { notFound } from "next/navigation";

import {
  audienceGateSchema,
  dispositionForGate,
  gateChannelSchema,
  type AudienceGate,
} from "public-proof-core/audience";
import { canonicalUrl, siteBaseUrl } from "public-proof-core/paths";

import {
  AdminAccentLink,
  AdminAccentNavLink,
  AdminBackLink,
  AdminBody,
  AdminBulletList,
  AdminFormRow,
  AdminInlineCode,
  AdminLabel,
  AdminMono,
  AdminMuted,
  AdminPageSections,
  AdminPageTitle,
  AdminPanel,
  AdminSecondaryButton,
  AdminSelect,
  AdminSubsectionTitle,
  AdminSubsectionTitleSpaced,
  AdminTable,
  AdminTd,
  AdminTh,
  AdminTr,
} from "@/app/components/admin/ui";
import { updateLaunchAudienceGate } from "@/lib/admin/launch-actions";

async function loadLaunch(slug: string) {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { getLaunchBySlug } = await import("public-proof-db/queries/launches");
    return await getLaunchBySlug(getPublicProofDb(), slug);
  } catch {
    return undefined;
  }
}

type Props = { params: { slug: string } };

export default async function LaunchDetailPage({ params }: Props) {
  const launch = await loadLaunch(params.slug);
  if (!launch) notFound();

  const gate = launch.audienceGate as AudienceGate;
  const base = siteBaseUrl();
  const canon = canonicalUrl(launch.canonicalPath);

  return (
    <AdminPageSections>
      <AdminBackLink href="/admin/launches">← Launches</AdminBackLink>

      <AdminPanel>
        <AdminPageTitle>{launch.title}</AdminPageTitle>
        <AdminMuted>Slug: {launch.slug}</AdminMuted>

        <AdminSubsectionTitle>What claim am I launching?</AdminSubsectionTitle>
        <AdminBody>{launch.primaryClaim}</AdminBody>

        <AdminSubsectionTitle>Canonical post</AdminSubsectionTitle>
        <AdminBody>
          MDX slug <AdminInlineCode>{launch.postSlug}</AdminInlineCode> · site base <AdminAccentLink href={base}>{base}</AdminAccentLink>
          <br />
          Canonical URL <AdminAccentLink href={canon}>{canon}</AdminAccentLink>
        </AdminBody>

        <AdminSubsectionTitle>Audience gate ({gate})</AdminSubsectionTitle>
        <AdminMuted>
          The gate controls outbound blast radius. When you widen it you also widen who can inadvertently see an early draft.
          Prefer moving one notch at a time; the disposition table mirrors the deterministic matrix enforced by the Hermes prompts.
          There is still no accidental “publish everything” shortcut — postings require explicit queued jobs plus confirmation paths.
        </AdminMuted>

        <form action={updateLaunchAudienceGate}>
          <AdminFormRow>
            <input type="hidden" name="slug" value={launch.slug} />
            <AdminLabel>
              Change gate{" "}
              <AdminSelect name="audienceGate" defaultValue={gate}>
                {audienceGateSchema.options.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </AdminSelect>
            </AdminLabel>
            <AdminSecondaryButton type="submit">Save gate</AdminSecondaryButton>
          </AdminFormRow>
        </form>

        <AdminTable>
          <thead>
            <tr>
              <AdminTh>Channel</AdminTh>
              <AdminTh>Disposition</AdminTh>
            </tr>
          </thead>
          <tbody>
            {gateChannelSchema.options.map((channel) => (
              <AdminTr key={channel}>
                <AdminTd>
                  <AdminMono>{channel}</AdminMono>
                </AdminTd>
                <AdminTd>{dispositionForGate(gate, channel)}</AdminTd>
              </AdminTr>
            ))}
          </tbody>
        </AdminTable>

        <AdminSubsectionTitleSpaced>Routes</AdminSubsectionTitleSpaced>
        <AdminBulletList>
          <li>
            <AdminAccentNavLink href={`/admin/launches/${launch.slug}/jobs`}>Posting jobs</AdminAccentNavLink> (timeline +
            executor events)
          </li>
          <li>
            <AdminAccentNavLink href={`/admin/launches/${launch.slug}/agents`}>Agent traces</AdminAccentNavLink> (
            <AdminInlineCode>agent_trace_*</AdminInlineCode> rows)
          </li>
          <li>
            <AdminAccentNavLink href={`/admin/launches/${launch.slug}/drafts`}>Platform drafts</AdminAccentNavLink>
          </li>
          <li>
            <AdminAccentNavLink href={`/admin/launches/${launch.slug}/posting-plan`}>Posting plan</AdminAccentNavLink>
          </li>
          <li>
            <AdminAccentNavLink href={`/admin/launches/${launch.slug}/metrics`}>Metrics snapshots</AdminAccentNavLink>
          </li>
          <li>
            <AdminAccentNavLink href={`/admin/launches/${launch.slug}/report`}>Launch report</AdminAccentNavLink> (stub
            until render persists)
          </li>
        </AdminBulletList>

        <AdminSubsectionTitle>Resume-ready claim</AdminSubsectionTitle>
        <AdminBody>{launch.resumeClaim}</AdminBody>
      </AdminPanel>
    </AdminPageSections>
  );
}
