"use client";

import { useMemo } from "react";

import type { AdminDataSource, AdminWorldState, DbOverviewPayload } from "public-proof-admin-core";

import { AdminPanel, AdminSectionTitle } from "@/app/components/admin/ui";
import { buildAdminWorldKey } from "@/app/components/admin/state/admin-world-atoms";
import { MetricsStressChart } from "@/app/components/admin/viz/MetricsStressChart";

export type AdminOverviewMetricsIslandProps = {
  source: AdminDataSource;
  dbPayload: DbOverviewPayload | null;
  initialWorld: AdminWorldState;
};

export function AdminOverviewMetricsIsland({ source, dbPayload, initialWorld }: AdminOverviewMetricsIslandProps) {
  const worldKey = useMemo(
    () => buildAdminWorldKey({ source, db: dbPayload, seed: initialWorld }),
    [source, dbPayload, initialWorld],
  );

  return (
    <AdminPanel>
      <AdminSectionTitle>Metrics stress</AdminSectionTitle>
      <MetricsStressChart worldKey={worldKey} />
    </AdminPanel>
  );
}
