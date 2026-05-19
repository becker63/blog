#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { parseCliArgs, requireLaunch } from "./args";
import { loadLaunchContext } from "./launch-context";
import {
  draftsDir,
  launchReportPath,
  readMetricSnapshots,
  readPublications,
} from "public-proof-core";
import {
  defaultResumeBullets,
  renderLaunchReport,
} from "public-proof-reporting";
import { generateResumeBullets } from "public-proof-agent";

const main = async () => {
  const args = parseCliArgs();
  const launchId = requireLaunch(args);
  const ctx = await loadLaunchContext(launchId);
  const publications = readPublications(launchId);
  const metrics = readMetricSnapshots(launchId);
  const draftDir = draftsDir(launchId);
  const draftProviders = fs.existsSync(draftDir)
    ? fs.readdirSync(draftDir).filter((f) => f.endsWith(".json") && f !== "summary.json").map((f) => f.replace(".json", ""))
    : [];

  let resumeBullets = defaultResumeBullets(ctx.launch);
  if (process.env.CURSOR_API_KEY) {
    try {
      resumeBullets = await generateResumeBullets(
        {
          launch: ctx.launch,
          publications,
          metrics,
        },
        undefined,
        ctx.traceLaunchPk ?? undefined,
      );
    } catch {
      /* keep defaults */
    }
  }

  const report = renderLaunchReport({
    launch: ctx.launch,
    canonicalUrl: ctx.url,
    draftProviders,
    publications,
    metrics,
    resumeBullets,
    utmLinks: ctx.utmLinks,
  });
  fs.writeFileSync(launchReportPath(launchId), report);
  console.log(`Wrote ${launchReportPath(launchId)}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
