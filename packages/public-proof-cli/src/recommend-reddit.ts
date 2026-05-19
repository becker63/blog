#!/usr/bin/env tsx
import fs from "node:fs";
import path from "node:path";
import { parseCliArgs, requireLaunch } from "./args";
import { loadLaunchContext } from "./launch-context";
import {
  draftsDir,
  redditRecommendationsPath,
} from "public-proof-core";
import {
  heuristicRankSubreddits,
  searchRedditCandidates,
} from "public-proof-platforms";
import { rankSubreddits } from "public-proof-agent";

const renderRedditReport = (
  recommendations: Awaited<ReturnType<typeof rankSubreddits>>["recommendations"],
) => {
  const lines = [
    "# Reddit recommendations",
    "",
    "> **Warning:** Do not spam multiple subreddits. Pick one fit, get manual approval, then submit.",
    "",
  ];
  for (const rec of recommendations) {
    lines.push(
      `## r/${rec.subreddit}`,
      `- URL: ${rec.url}`,
      `- Score: ${rec.score}`,
      `- Audience fit: ${rec.audienceFit}`,
      `- Rule risk: ${rec.ruleRisk}`,
      `- Self-promotion risk: ${rec.selfPromotionRisk}`,
      `- Action: **${rec.recommendedAction}**`,
      `- Reason: ${rec.reason}`,
      "",
      "### Suggested title",
      rec.suggestedTitle,
      "",
      "### Suggested body",
      rec.suggestedBody,
      "",
      "### Notes",
      ...rec.notes.map((n) => `- ${n}`),
      "",
    );
  }
  return lines.join("\n");
};

const main = async () => {
  const args = parseCliArgs();
  const launchId = requireLaunch(args);
  const ctx = await loadLaunchContext(launchId);
  const queries = [
    ...ctx.summary.technicalTopics.slice(0, 3),
    ...ctx.post.tags,
    ctx.launch.title,
  ].filter(Boolean);
  const candidates = await searchRedditCandidates(queries);

  let recommendations;
  if (process.env.CURSOR_API_KEY) {
    try {
      const ranked = await rankSubreddits(
        {
          summary: ctx.summary,
          candidates,
        },
        undefined,
        ctx.traceLaunchPk ?? undefined,
      );
      recommendations = ranked.recommendations;
    } catch (error) {
      console.warn(`Agent rank failed: ${(error as Error).message}`);
      recommendations = heuristicRankSubreddits(ctx.summary, candidates, ctx.url).recommendations;
    }
  } else {
    recommendations = heuristicRankSubreddits(ctx.summary, candidates, ctx.url).recommendations;
  }

  const payload = { recommendations };
  const dir = draftsDir(launchId);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, "reddit.json"), `${JSON.stringify(payload, null, 2)}\n`);
  fs.writeFileSync(redditRecommendationsPath(launchId), renderRedditReport(recommendations));
  console.log(`Wrote ${redditRecommendationsPath(launchId)}`);
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
