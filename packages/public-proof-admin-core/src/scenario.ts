import type { AdminDomainEvent } from "./events";
import { foldEvents, type AdminWorldState } from "./admin-world";
import { ADMIN_UI_WORLD_EVENTS } from "./fixture/admin-ui-world";

export type AdminDataSource = "db" | "fixture";

/**
 * Server / build-time resolution. Set `PUBLIC_PROOF_ADMIN_WORLD_SOURCE=fixture` for hot-swap demo (no DB).
 */
export function resolveAdminDataSource(): AdminDataSource {
  const raw = process.env.PUBLIC_PROOF_ADMIN_WORLD_SOURCE?.trim().toLowerCase();
  if (raw === "fixture") return "fixture";
  return "db";
}

export type DbOverviewPayload = {
  ok: boolean;
  runningJobs: number;
  jobsNeedingAttention: number;
  planProposals: number;
  unreadNotifications: number;
  launches: Array<{ slug: string; title: string; audienceGate: string }>;
};

export function dbOverviewToEvent(payload: DbOverviewPayload): AdminDomainEvent {
  return {
    type: "db.overviewLoaded",
    payload: {
      ok: payload.ok,
      runningJobs: payload.runningJobs,
      jobsNeedingAttention: payload.jobsNeedingAttention,
      planProposals: payload.planProposals,
      unreadNotifications: payload.unreadNotifications,
      launches: payload.launches,
    },
  };
}

/** Single entry: same fold for DB snapshot event or full replay fixture. */
export function eventsToWorldState(events: readonly AdminDomainEvent[]): AdminWorldState {
  return foldEvents(events);
}

export function runFixtureScenario(): AdminWorldState {
  return foldEvents(ADMIN_UI_WORLD_EVENTS);
}

export function runDbScenarioFromOverview(db: DbOverviewPayload): AdminWorldState {
  return foldEvents([dbOverviewToEvent(db)]);
}

/** Hot-swap entry: fixture fold vs single DB overview snapshot event. */
export function runAdminScenario(
  source: AdminDataSource,
  db: DbOverviewPayload | null,
): AdminWorldState {
  if (source === "fixture") {
    return runFixtureScenario();
  }
  return runDbScenarioFromOverview(
    db ?? {
      ok: false,
      runningJobs: 0,
      jobsNeedingAttention: 0,
      planProposals: 0,
      unreadNotifications: 0,
      launches: [],
    },
  );
}
