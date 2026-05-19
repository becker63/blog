import type { DbOverviewPayload } from "public-proof-admin-core";

type OverviewOk = {
  ok: true;
  launches: Array<{ slug: string; title: string; audienceGate: string }>;
  runningJobs: number;
  jobsNeedingAttention: number;
  planProposals: number;
  unreadNotifications: number;
};

type OverviewResult = OverviewOk | { ok: false };

/** Map `loadOverview()` output to the admin-core DB snapshot shape (null when DB failed). */
export function overviewResultToDbPayload(data: OverviewResult): DbOverviewPayload | null {
  if (!data.ok) {
    return null;
  }
  return {
    ok: true,
    runningJobs: data.runningJobs,
    jobsNeedingAttention: data.jobsNeedingAttention,
    planProposals: data.planProposals,
    unreadNotifications: data.unreadNotifications,
    launches: data.launches.map((l) => ({
      slug: l.slug,
      title: l.title,
      audienceGate: l.audienceGate,
    })),
  };
}
