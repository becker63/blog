import { insightSeedSchema } from "../model/schemas";
import { InsightSeed } from "../model/types";
import { digestIssueMarker, GitHubRepoInsightIssue, listRepoInsightIssues } from "./github-digest-issue";

/** Matches persisted issue markers and schemas (see repoFullName). */
const REPO_FULL_NAME = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;

/**
 * Normalize curator / human typo variants (spaces, quotes, full GitHub URLs) into owner/repo slugs.
 * Returns undefined when nothing valid remains.
 */
export const normalizeRepoFullName = (raw: string): string | undefined => {
  let t = raw.trim().replace(/^["'`]+|["'`]+$/g, "");
  const fromUrl = t.match(/^https?:\/\/github\.com\/([A-Za-z0-9_.-]+)\/([A-Za-z0-9_.-]+)(?:\.git)?(?:\/|$|\?|#)/i);
  if (fromUrl) t = `${fromUrl[1]}/${fromUrl[2]}`;
  else {
    t = t.replace(/\s*\/\s*/, "/").replace(/\s/g, "");
  }
  return REPO_FULL_NAME.test(t) ? t : undefined;
};

const uniqueStrings = (values: string[]) => [...new Set(values)];

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

const sourceReposFromBody = (body: string | undefined) => {
  const fromMarker = body
    ?.match(/repo-insight:source-repos=([^>]+)/)?.[1]
    ?.split(",")
    .map((repo) => normalizeRepoFullName(repo))
    .filter((repo): repo is string => Boolean(repo));
  if (fromMarker?.length) return uniqueStrings(fromMarker);

  const fromSection =
    section(body ?? "", "Source repos")
      ?.split(/\r?\n/)
      .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
      .map((line) => normalizeRepoFullName(line))
      .filter((line): line is string => Boolean(line)) ?? [];
  return uniqueStrings(fromSection);
};

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
