"use client";

import type { TooltipProps } from "recharts";

import { adminChrome } from "@/app/components/admin/ui/tokens";

export function AdminRechartsTooltip({ active, payload, label }: TooltipProps<number, string>) {
  if (!active || !payload?.length) {
    return null;
  }

  return (
    <div className={adminChrome.rechartsTooltipBox}>
      {label != null && label !== "" ? <p className={adminChrome.rechartsTooltipLabel}>{label}</p> : null}
      <ul className={adminChrome.rechartsTooltipList}>
        {payload.map((entry) => (
          <li key={String(entry.dataKey)} className={adminChrome.rechartsTooltipRow}>
            <span>{entry.name}:</span> <strong>{entry.value}</strong>
          </li>
        ))}
      </ul>
    </div>
  );
}
