import { defer, from, type Observable } from "rxjs";
import { concatMap, scan, shareReplay } from "rxjs/operators";

import type { AdminDomainEvent } from "./events";
import { ADMIN_UI_WORLD_EVENTS } from "./fixture/admin-ui-world";
import { initialAdminWorldState, reduceAdminWorld, type AdminWorldState } from "./admin-world";
import type { AdminDataSource, DbOverviewPayload } from "./scenario";
import { dbOverviewToEvent } from "./scenario";

export function fixtureEventStream$(): Observable<AdminDomainEvent> {
  return from(ADMIN_UI_WORLD_EVENTS);
}

/** Cold observable: single DB-shaped event (hot-swap: same reducer as fixture replay). */
export function dbOverviewWorldStream$(payload: DbOverviewPayload): Observable<AdminDomainEvent> {
  return from([dbOverviewToEvent(payload)]);
}

/**
 * Emits accumulated world after each event — primary pipe for `atomWithObservable`.
 */
export function adminWorldState$(events$: Observable<AdminDomainEvent>): Observable<AdminWorldState> {
  return events$.pipe(
    scan(reduceAdminWorld, initialAdminWorldState),
    shareReplay({ bufferSize: 1, refCount: false }),
  );
}

export function adminWorldStateFromSource$(source: AdminDataSource, dbPayload: DbOverviewPayload | null): Observable<AdminWorldState> {
  if (source === "fixture") {
    return adminWorldState$(fixtureEventStream$());
  }
  const p =
    dbPayload ??
    ({
      ok: false,
      runningJobs: 0,
      jobsNeedingAttention: 0,
      planProposals: 0,
      unreadNotifications: 0,
      launches: [],
    } satisfies DbOverviewPayload);
  return adminWorldState$(dbOverviewWorldStream$(p));
}

/** Lazy async DB load wrapped for Observable consumers (tests / SSR bridge). */
export function adminWorldFromAsyncDb$(loader: () => Promise<DbOverviewPayload>): Observable<AdminWorldState> {
  return defer(() => loader()).pipe(
    concatMap((payload) => adminWorldState$(dbOverviewWorldStream$(payload))),
  );
}
