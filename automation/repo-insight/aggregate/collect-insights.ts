import { insightSeedSchema } from "../model/schemas";
import { InsightSeed } from "../model/types";
import { digestIssueMarker, GitHubRepoInsightIssue, listRepoInsightIssues } from "./github-digest-issue";

const stripMarkdown = (value: string) =>
  value
    .replace(/<!--[\s\S]*?-->/g, "")
    .replace(/```[\s\S]*?```/g, "")
    .replace(/[`*_>#-]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const section = (body: string, heading: string) => {
  const escaped = heading.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = body.match(new RegExp(`^##\\s+${escaped}\\s*$([\\s\\S]*?)(?=^##\\s+|(?![\\s\\S]))`, "im"));
  return match?.[1]?.trim();
};

const listItems = (value: string | undefined) =>
  (value ?? "")
    .split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
    .filter(Boolean);

const optionalSection = (body: string, heading: string) => {
  const value = stripMarkdown(section(body, heading) ?? "");
  return value || undefined;
};

const sourceReposFromBody = (body: string | undefined) =>
  body?.match(/repo-insight:source-repos=([^>]+)/)?.[1]
    ?.split(",")
    .map((repo) => repo.trim())
    .filter(Boolean) ??
  section(body ?? "", "Source repos")
    ?.split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
    .filter((line) => /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(line)) ?? [];

const relatedCommitsFromBody = (body: string | undefined) =>
  body?.match(/repo-insight:related-commits=([^>]+)/)?.[1]
    ?.split(",")
    .map((commit) => commit.trim())
    .filter(Boolean) ??
  section(body ?? "", "Related commits")
    ?.split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
    .filter(Boolean) ?? [];

const issueSeed = (issue: GitHubRepoInsightIssue): InsightSeed => {
  const body = issue.body ?? "";
  return insightSeedSchema.parse({
    id: `issue:${issue.number}`,
    title: issue.title,
    source: "issue",
    issueNumber: issue.number,
    issueUrl: issue.url,
    createdAt: issue.createdAt,
    sourceRepos: sourceReposFromBody(body),
    relatedCommits: relatedCommitsFromBody(body),
    hiddenThesis: optionalSection(body, "Hidden thesis"),
    whySelected: optionalSection(body, "Why this was selected"),
    possibleHooks: listItems(section(body, "Possible blog hooks")),
    relationToPreviousWriting: optionalSection(body, "Relation to previous writing"),
    followUpQuestions: listItems(section(body, "Follow-up questions")),
    evidenceSummaries: listItems(section(body, "Evidence")),
    labels: issue.labels,
    state: issue.state,
  });
};

export const collectInsightSeeds = async ({
  repo,
  includeClosed = true,
  noGithub = false,
  maxSeeds = 50,
}: {
  repo?: string;
  includeClosed?: boolean;
  noGithub?: boolean;
  maxSeeds?: number;
}) => {
  const seeds: InsightSeed[] = [];

  if (!noGithub) {
    const issues = await listRepoInsightIssues({ repo, includeClosed });
    for (const issue of issues) {
      if ((issue.body ?? "").includes(digestIssueMarker)) continue;
      seeds.push(issueSeed(issue));
    }
  }

  return seeds.slice(0, maxSeeds);
};
