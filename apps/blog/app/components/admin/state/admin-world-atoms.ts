import { atomFamily, atomWithObservable } from "jotai/utils";

import type { AdminDataSource, AdminWorldState, DbOverviewPayload } from "public-proof-admin-core";
import { adminWorldStateFromSource$ } from "public-proof-admin-core/streams";

export type AdminWorldBridge = {
  source: AdminDataSource;
  db: DbOverviewPayload | null;
  seed: AdminWorldState;
};

/** Stable key for Jotai atomFamily (includes SSR seed for `atomWithObservable` initial value). */
export function buildAdminWorldKey(bridge: AdminWorldBridge): string {
  return JSON.stringify(bridge);
}

/**
 * One atom per bridge key: Observable fold from fixture or DB snapshot, seeded from RSC for first paint.
 */
export const adminWorldAtomFamily = atomFamily((rawKey: string) => {
  const bridge = JSON.parse(rawKey) as AdminWorldBridge;
  return atomWithObservable(
    () => adminWorldStateFromSource$(bridge.source, bridge.db),
    { initialValue: bridge.seed },
  );
});
