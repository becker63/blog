#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import {
  launchSchema,
  launchesDir,
  publicationSchema,
  readLaunch,
} from "public-proof-core";
import { getProvider, allProviders } from "public-proof-platforms";

const main = () => {
  const errors: string[] = [];

  if (!fs.existsSync(launchesDir)) {
    errors.push(`Missing launches dir: ${launchesDir}`);
  } else {
    for (const launchId of fs.readdirSync(launchesDir)) {
      const launchPath = path.join(launchesDir, launchId, "launch.json");
      if (!fs.existsSync(launchPath)) continue;
      try {
        const launch = readLaunch(launchId);
        launchSchema.parse(launch);
        for (const plan of launch.platforms) {
          if (!plan.enabled) continue;
          try {
            getProvider(plan.provider);
          } catch {
            errors.push(`Launch ${launchId}: unknown provider ${plan.provider}`);
          }
        }
      } catch (e) {
        errors.push(`Launch ${launchId}: ${(e as Error).message}`);
      }
    }
  }

  const providerNames = new Set(allProviders.map((p) => p.provider));
  if (providerNames.size !== allProviders.length) {
    errors.push("Duplicate provider registrations detected");
  }

  publicationSchema.parse({
    id: "check",
    launchId: "check",
    provider: "devto",
    status: "draft",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  if (errors.length) {
    console.error("PublicProof check failed:\n", errors.join("\n"));
    process.exit(1);
  }
  console.log("PublicProof check passed.");
};

main();
