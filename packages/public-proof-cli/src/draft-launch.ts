#!/usr/bin/env tsx
import { parseCliArgs, requireLaunch } from "./args";
import { loadLaunchContext, renderAllDrafts } from "./launch-context";

const main = async () => {
  const args = parseCliArgs();
  const launchId = requireLaunch(args);
  const ctx = await loadLaunchContext(launchId);
  const drafts = await renderAllDrafts(ctx);
  console.log(`Drafts written for launch ${launchId}: ${Object.keys(drafts).join(", ")}`);
  if (ctx.mdxWarnings.length) {
    console.warn("MDX warnings:", ctx.mdxWarnings.map((w) => w.message).join("; "));
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
