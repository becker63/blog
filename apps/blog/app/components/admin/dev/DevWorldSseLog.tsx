"use client";

import { useEffect, useState } from "react";

import { adminDomainEventSchema } from "public-proof-admin-core";

import { AdminMuted } from "@/app/components/admin/ui";
import { adminChrome } from "@/app/components/admin/ui/tokens";
import { cx } from "@/styled-system/css";

/** Subscribes to `/api/admin/world-events` and renders the last few validated events (dev tooling). */
export function DevWorldSseLog() {
  const [lines, setLines] = useState<readonly string[]>([]);
  const [status, setStatus] = useState<"idle" | "open" | "closed" | "error">("idle");

  useEffect(() => {
    const es = new EventSource("/api/admin/world-events");
    setStatus("open");

    es.onmessage = (evt) => {
      const raw = evt.data;
      let pretty = raw;
      try {
        const parsed = adminDomainEventSchema.parse(JSON.parse(raw));
        pretty = JSON.stringify(parsed);
      } catch {
        pretty = raw;
      }
      setLines((prev) => [...prev.slice(-12), pretty]);
    };

    es.onerror = () => {
      setStatus("error");
      es.close();
    };

    return () => {
      setStatus("closed");
      es.close();
    };
  }, []);

  return (
    <div className={adminChrome.stackColGap2}>
      <AdminMuted>
        Stream status: <strong>{status}</strong>
      </AdminMuted>
      <pre className={cx(adminChrome.preWrap, adminChrome.sseEventLogPre)}>
        {lines.length === 0 ? "Waiting for events…" : lines.join("\n")}
      </pre>
    </div>
  );
}
