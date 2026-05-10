import { aggregateInsights, deterministicDigestPreview } from "../aggregate/aggregate-insights";
import { collectInsightSeeds } from "../aggregate/collect-insights";
import { GitHubDigestIssuePublisher } from "../aggregate/github-digest-issue";
import { renderDigestIssue } from "../aggregate/render-digest-issue";
import { getArgValue, hasFlag } from "./args";

const main = async () => {
  const dryRun = hasFlag("--dry-run");
  const ci = hasFlag("--ci") || process.env.CI === "true";
  const repo = getArgValue("--repo");
  const maxSeeds = Number(getArgValue("--max-seeds") ?? "50");
  const includeClosed = !hasFlag("--no-closed");
  const noGithub = hasFlag("--no-github");

  const seeds = await collectInsightSeeds({ repo, includeClosed, noGithub, maxSeeds });
  if (seeds.length === 0) {
    console.log(ci ? "aggregate seeds=0 clusters=0 issue=none" : "No repo-insight seeds found.");
    return;
  }

  const digest = dryRun ? deterministicDigestPreview(seeds) : await aggregateInsights(seeds);
  const body = renderDigestIssue({ digest, seeds });
  const issue = await new GitHubDigestIssuePublisher({ repo, dryRun }).publish(body);

  console.log(
    ci
      ? `aggregate seeds=${seeds.length} clusters=${digest.clusters.length} issue=${issue.url}`
      : [
          "Repo Insight Digest",
          `  seeds: ${seeds.length}`,
          `  clusters: ${digest.clusters.length}`,
          `  issue: ${issue.url}`,
          `  action: ${issue.action}`,
        ].join("\n"),
  );
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
