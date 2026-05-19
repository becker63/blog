#!/usr/bin/env tsx
import { parseCliArgs, requireLaunch } from "./args";
import { writeMetricSnapshot } from "public-proof-core";

const main = () => {
  const args = parseCliArgs();
  const launchId = requireLaunch(args);
  const publicationId = `${launchId}-${args.only ?? "linkedin"}-manual`;
  writeMetricSnapshot(launchId, {
    publicationId,
    capturedAt: new Date().toISOString(),
    source: "manual",
    impressions: Number(process.env.PUBLIC_PROOF_IMPRESSIONS ?? 0) || undefined,
    views: Number(process.env.PUBLIC_PROOF_VIEWS ?? 0) || undefined,
    notes: process.env.PUBLIC_PROOF_METRICS_NOTES,
  });
  console.log(`Recorded metrics for ${publicationId}`);
};

main();
