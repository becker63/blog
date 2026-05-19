#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { parseCliArgs, requireLaunch } from "./args";
import { loadLaunchContext } from "./launch-context";
import { draftsDir, readPublications, upsertPublication } from "public-proof-core";
import { getProvider } from "public-proof-platforms";
import { assertSingleSubredditPublish } from "public-proof-platforms";
import { renderLaunchPlan } from "public-proof-reporting";
import type { PlatformDraft } from "public-proof-platforms";

const loadDraft = (launchId: string, provider: string): PlatformDraft => {
  const filePath = path.join(draftsDir(launchId), `${provider}.json`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing draft for ${provider}. Run draft target first.`);
  }
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as PlatformDraft;
};

const main = async () => {
  const args = parseCliArgs();
  const launchId = requireLaunch(args);
  const dryRun = args.dryRun || !args.confirm;
  if (!args.confirm && !args.dryRun) {
    console.error("Publishing requires --confirm (or pass --dry-run explicitly).");
    process.exit(1);
  }

  const ctx = await loadLaunchContext(launchId);
  const publications = readPublications(launchId);
  const targets = ctx.launch.platforms.filter((p) => {
    if (!p.enabled) return false;
    if (args.only && p.provider !== args.only) return false;
    return true;
  });

  if (args.only === "reddit" || targets.some((t) => t.provider === "reddit")) {
    const subreddits = args.subreddit ? [args.subreddit] : [];
    assertSingleSubredditPublish(subreddits);
  }

  const draftMap: Record<string, PlatformDraft> = {};
  for (const plan of targets) {
    draftMap[plan.provider] = loadDraft(launchId, plan.provider);
  }

  console.log(
    renderLaunchPlan({
      launch: ctx.launch,
      canonicalUrl: ctx.url,
      drafts: draftMap,
      publications,
      dryRun,
      only: args.only,
    }),
  );

  for (const plan of targets) {
    const provider = getProvider(plan.provider);
    if (!provider.publish) {
      console.log(`[skip] ${plan.provider} is manual/recommendation-only`);
      continue;
    }
    if (plan.mode === "recommendation") {
      console.log(`[skip] ${plan.provider} requires reddit target with --subreddit and --confirm`);
      continue;
    }
    if (dryRun) {
      console.log(`[dry-run] Would publish to ${plan.provider}`);
      continue;
    }
    if (!args.confirm) continue;

    const draft = draftMap[plan.provider];
    const publication = await provider.publish({
      ...ctx,
      canonicalUrl: ctx.url,
      draft,
      confirm: args.confirm,
      dryRun: false,
      subreddit: args.subreddit,
      utmUrl: ctx.utmLinks[plan.provider] ?? ctx.url,
    });

    if (publication.status !== "published") {
      console.log(`[planned] ${plan.provider} status=${publication.status}`);
    } else {
      upsertPublication(launchId, publication);
      console.log(`[published] ${plan.provider} ${publication.url ?? ""}`);
    }
  }
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
