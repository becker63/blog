import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AdminAccentNavLink,
  AdminPageSections,
  AdminPanel,
  AdminPanelStack,
  AdminSubNav,
} from "@/app/components/admin/ui";
import { launchPostingPlan as rs } from "@/app/components/admin/ui/admin-route-styles";
import { approvePostingPlanItem, rejectPostingPlanItem } from "@/lib/admin/plan-actions";

type Props = { params: { slug: string } };

async function load(slug: string) {
  try {
    const { getPublicProofDb } = await import("public-proof-db/client");
    const { getLaunchBySlug } = await import("public-proof-db/queries/launches");
    const {
      getLatestPostingPlanForLaunch,
      listCommunityDraftsForLaunch,
      listCommunityTargetsForLaunch,
      listPostingPlanItems,
      listPostingPlansForLaunch,
    } = await import("public-proof-db/queries/posting-plan");

    const db = getPublicProofDb();
    const launch = await getLaunchBySlug(db, slug);
    if (!launch) return null;

    const plans = await listPostingPlansForLaunch(db, launch.id);
    const latest = await getLatestPostingPlanForLaunch(db, launch.id);
    const items = latest ? await listPostingPlanItems(db, latest.id) : [];
    const targets = await listCommunityTargetsForLaunch(db, launch.id);
    const drafts = await listCommunityDraftsForLaunch(db, launch.id);
    const targetById = new Map(targets.map((t) => [t.id, t]));
    const draftById = new Map(drafts.map((d) => [d.id, d]));
    return { launch, plans, latest, items, targetById, draftById };
  } catch {
    return null;
  }
}

export default async function LaunchPostingPlanPage({ params }: Props) {
  const data = await load(params.slug);
  if (!data) notFound();

  const { launch, plans, latest, items, targetById, draftById } = data;

  return (
    <AdminPageSections>
      <AdminSubNav>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}`}>← Launch detail</AdminAccentNavLink>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}/drafts`}>Drafts</AdminAccentNavLink>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}/agents`}>Agents</AdminAccentNavLink>
        <AdminAccentNavLink href={`/admin/launches/${launch.slug}/jobs`}>Jobs</AdminAccentNavLink>
      </AdminSubNav>

      <AdminPanelStack>
        <AdminPanel>
          <h1 className={rs.h1}>Posting plan · {launch.title}</h1>
          <p className={rs.lead}>
            Approve or reject proposed destinations before a launch post job freezes the executable set. Dashboard confirmation
            for <code className={rs.codeMonoXs}>job:create</code> arrives in the next slice.
          </p>
          <p className={rs.noteSmall}>
            Agent outputs that produced these artifacts should also appear under{" "}
            <Link href={`/admin/launches/${launch.slug}/agents`} className={rs.agentLink}>
              Agent traces
            </Link>{" "}
            whenever runs are persisted with launch UUID linkage.
          </p>

          {latest ? (
            <>
              <section className={rs.section}>
                <h2 className={rs.h2}>Latest plan ({latest.status})</h2>
                <p className={rs.planId}>{latest.id}</p>
                {latest.summary ? <p className={rs.summaryOn}>{latest.summary}</p> : <p className={rs.summaryOff}>No summary stored.</p>}
                {latest.warningsJson && Array.isArray(latest.warningsJson) ? (
                  <ul className={rs.warningsList}>
                    {(latest.warningsJson as string[]).map((w, i) => (
                      <li key={i}>{w}</li>
                    ))}
                  </ul>
                ) : null}
              </section>

              {items.length === 0 ? (
                <p className={rs.emptyItems}>This plan has no items yet.</p>
              ) : (
                <ul className={rs.itemsList}>
                  {items.map((item) => {
                    const target = item.communityTargetId ? targetById.get(item.communityTargetId) : undefined;
                    const draft = item.communityDraftId ? draftById.get(item.communityDraftId) : undefined;
                    const label =
                      target?.communityName ??
                      draft?.title ??
                      (draft ? `${draft.provider} draft` : "destination TBD");

                    return (
                      <li key={item.id} className={rs.planItem}>
                        <p className={rs.itemTitle}>{label}</p>
                        <p className={rs.itemMeta}>
                          {item.status}
                          {item.approvedAt ? ` · approved ${item.approvedAt.toISOString()}` : ""}
                        </p>
                        {draft ? (
                          <pre className={rs.draftPre}>
                            {draft.body.length > 3000 ? `${draft.body.slice(0, 3000)}…` : draft.body}
                          </pre>
                        ) : null}
                        {item.status === "proposed" ? (
                          <div className={rs.actionRow}>
                            <form action={approvePostingPlanItem} className={rs.inlineForm}>
                              <input type="hidden" name="slug" value={launch.slug} />
                              <input type="hidden" name="itemId" value={item.id} />
                              <button type="submit" className={rs.actionBtn}>
                                Approve
                              </button>
                            </form>
                            <form action={rejectPostingPlanItem} className={rs.inlineForm}>
                              <input type="hidden" name="slug" value={launch.slug} />
                              <input type="hidden" name="itemId" value={item.id} />
                              <button type="submit" className={rs.actionBtn}>
                                Reject
                              </button>
                            </form>
                          </div>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </>
          ) : (
            <p className={rs.noPlan}>
              No posting plans in Postgres for this launch. Generate intelligence (community targets → plan items) via the agent
              tasks / CLI backlog.
            </p>
          )}
        </AdminPanel>

        {plans.length > 1 ? (
          <AdminPanel>
            <h2 className={rs.h2Older}>Older plans ({plans.length - 1})</h2>
            <ul className={rs.olderList}>
              {plans.slice(1).map((p) => (
                <li key={p.id} className={rs.olderLi}>
                  {p.id} · {p.status} · {p.updatedAt.toISOString()}
                </li>
              ))}
            </ul>
          </AdminPanel>
        ) : null}
      </AdminPanelStack>
    </AdminPageSections>
  );
}
