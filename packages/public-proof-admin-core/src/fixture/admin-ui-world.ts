import type { AdminDomainEvent } from "../events";

/**
 * Canonical whole-admin-UI fixture: ordered event log whose fold matches the reducer path
 * used by Postgres-driven `db.overviewLoaded` (hot-swappable at the scenario boundary).
 */
export const ADMIN_UI_WORLD_EVENTS: readonly AdminDomainEvent[] = [
  { type: "world.reset", payload: {} },
  {
    type: "chart.point",
    payload: { label: "T0", runningJobs: 1, planProposals: 0 },
  },
  {
    type: "chart.point",
    payload: { label: "T1", runningJobs: 2, planProposals: 1 },
  },
  {
    type: "chart.point",
    payload: { label: "T2", runningJobs: 2, planProposals: 2 },
  },
  {
    type: "signals.sync",
    payload: {
      runningJobs: 2,
      jobsNeedingAttention: 1,
      planProposals: 2,
      unreadNotifications: 4,
    },
  },
  {
    type: "launches.preview",
    payload: {
      launches: [
        { slug: "fixture-alpha", title: "Fixture Alpha", audienceGate: "public" },
        { slug: "fixture-beta", title: "Fixture Beta", audienceGate: "subscribers" },
      ],
    },
  },
];
