"use client";

import { useAtomValue } from "jotai";

import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AdminInlineCode, AdminMuted } from "@/app/components/admin/ui";
import { AdminRechartsTooltip } from "@/app/components/admin/ui/AdminRechartsTooltip";
import { adminChrome, adminRechartsStroke } from "@/app/components/admin/ui/tokens";
import { adminWorldAtomFamily } from "@/app/components/admin/state/admin-world-atoms";

export function MetricsStressChart({ worldKey }: { worldKey: string }) {
  const world = useAtomValue(adminWorldAtomFamily(worldKey));

  const rows = world.chartPoints.map((p) => ({
    name: p.label,
    runningJobs: p.runningJobs,
    planProposals: p.planProposals,
  }));

  if (rows.length === 0) {
    return (
      <AdminMuted>
        No chart samples — use <AdminInlineCode>PUBLIC_PROOF_ADMIN_WORLD_SOURCE=fixture</AdminInlineCode> or connect Postgres for a live
        point.
      </AdminMuted>
    );
  }

  return (
    <div className={adminChrome.metricsChartSurface}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 4, left: 0 }}>
          <CartesianGrid stroke={adminRechartsStroke.grid} strokeDasharray="3 6" />
          <XAxis
            dataKey="name"
            stroke={adminRechartsStroke.axis}
            tick={{ fill: adminRechartsStroke.tick, fontSize: 11 }}
          />
          <YAxis
            stroke={adminRechartsStroke.axis}
            tick={{ fill: adminRechartsStroke.tick, fontSize: 11 }}
            allowDecimals={false}
          />
          <Tooltip content={AdminRechartsTooltip} />
          <Legend
            verticalAlign="top"
            height={28}
            content={({ payload }) => (
              <div className={adminChrome.rechartsLegendWrap}>
                {payload?.map((entry) => (
                  <span key={String(entry.value)} className={adminChrome.rechartsLegendItem}>
                    {entry.value}
                  </span>
                ))}
              </div>
            )}
          />
          <Line
            type="monotone"
            dataKey="runningJobs"
            name="Running jobs"
            stroke={adminRechartsStroke.runningJobs}
            strokeWidth={2}
            dot={{ r: 3, fill: adminRechartsStroke.runningJobs }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
          <Line
            type="monotone"
            dataKey="planProposals"
            name="Plan proposals"
            stroke={adminRechartsStroke.planProposals}
            strokeWidth={2}
            dot={{ r: 3, fill: adminRechartsStroke.planProposals }}
            activeDot={{ r: 5 }}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
