#!/usr/bin/env tsx
import { parseCliArgs, requireLaunch } from "./args";
import { upsertPublication } from "public-proof-core";

const main = () => {
  const args = parseCliArgs();
  const launchId = requireLaunch(args);
  const now = new Date().toISOString();
  const provider = args.only ?? "linkedin";
  upsertPublication(launchId, {
    id: `${launchId}-${provider}-manual`,
    launchId,
    provider,
    status: "manual",
    url: process.env.PUBLIC_PROOF_RECORD_URL,
    createdAt: now,
    updatedAt: now,
    publishedAt: now,
  });
  console.log(`Recorded manual publication for ${provider}`);
};

main();
