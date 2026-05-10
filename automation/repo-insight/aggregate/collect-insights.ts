import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import { insightFrontmatterSchema, insightIndexSchema, insightSeedSchema } from "../model/schemas";
import { InsightSeed } from "../model/types";
import { listFiles } from "../storage/files";
import { insightIndexPath, insightRunsDir, relativeToRoot } from "../storage/paths";
import { repoInsightArtifactMarker } from "../render/issue-body";
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

const artifactPathFromIssueBody = (body: string | undefined) =>
  body?.match(/repo-insight:artifact-path=([^>\s]+)/)?.[1]?.trim();

const sourceReposFromBody = (body: string | undefined) =>
  section(body ?? "", "Source repos")
    ?.split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
    .filter((line) => /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(line)) ?? [];

const relatedCommitsFromBody = (body: string | undefined) =>
  section(body ?? "", "Related commits")
    ?.split(/\r?\n/)
    .map((line) => line.replace(/^\s*[-*]\s+/, "").trim())
    .filter(Boolean) ?? [];

const issueSeed = (issue: GitHubRepoInsightIssue): InsightSeed => {
  const body = issue.body ?? "";
  const artifactPath = artifactPathFromIssueBody(body);
  return insightSeedSchema.parse({
    id: `issue:${issue.number}`,
    title: issue.title,
    source: "issue",
    artifactPath,
    issueNumber: issue.number,
    issueUrl: issue.url,
    createdAt: issue.createdAt,
    sourceRepos: sourceReposFromBody(body),
    relatedCommits: relatedCommitsFromBody(body),
    hiddenThesis: stripMarkdown(section(body, "Hidden thesis") ?? ""),
    whySelected: stripMarkdown(section(body, "Why this was selected") ?? ""),
    possibleHooks: listItems(section(body, "Possible blog hooks")),
    followUpQuestions: listItems(section(body, "Follow-up questions")),
    evidenceSummaries: [],
    labels: issue.labels,
    state: issue.state,
  });
};

const readArtifactSeeds = async () => {
  const seeds = new Map<string, InsightSeed>();
  try {
    insightIndexSchema.parse(JSON.parse(await readFile(insightIndexPath, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") {
      console.warn(`Could not parse insight index; continuing with artifact files: ${error instanceof Error ? error.message : error}`);
    }
  }

  let files: string[] = [];
  try {
    files = await listFiles(insightRunsDir, (filePath) => filePath.endsWith(".mdx"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  for (const filePath of files) {
    try {
      const raw = await readFile(filePath, "utf8");
      const parsed = matter(raw);
      const frontmatter = insightFrontmatterSchema.parse(parsed.data);
      const artifactPath = relativeToRoot(filePath);
      seeds.set(
        artifactPath,
        insightSeedSchema.parse({
          id: `artifact:${frontmatter.runId}`,
          title: frontmatter.title,
          source: "artifact",
          artifactPath,
          createdAt: frontmatter.date,
          sourceRepos: frontmatter.sourceRepos,
          relatedCommits: frontmatter.relatedCommits,
          hiddenThesis: stripMarkdown(section(parsed.content, "Hidden Thesis") ?? ""),
          whySelected: stripMarkdown(section(parsed.content, "Why This Was Selected") ?? ""),
          possibleHooks: listItems(section(parsed.content, "Possible Blog Hooks")),
          relationToPreviousWriting: stripMarkdown(section(parsed.content, "Relation To Previous Writing") ?? ""),
          followUpQuestions: listItems(section(parsed.content, "Follow-Up Questions / Next Writing Moves")),
          evidenceSummaries: listItems(section(parsed.content, "Evidence")),
        }),
      );
    } catch (error) {
      console.warn(`Could not collect insight artifact ${relativeToRoot(filePath)}; skipping: ${error instanceof Error ? error.message : error}`);
    }
  }

  return seeds;
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
  const artifactSeeds = await readArtifactSeeds();
  const seeds = [...artifactSeeds.values()];

  if (!noGithub) {
    const issues = await listRepoInsightIssues({ repo, includeClosed });
    for (const issue of issues) {
      if ((issue.body ?? "").includes(digestIssueMarker)) continue;
      const artifactPath = artifactPathFromIssueBody(issue.body);
      if (artifactPath && artifactSeeds.has(artifactPath)) {
        const existing = artifactSeeds.get(artifactPath);
        if (existing) {
          artifactSeeds.set(
            artifactPath,
            insightSeedSchema.parse({
              ...existing,
              issueNumber: issue.number,
              issueUrl: issue.url,
              labels: issue.labels,
              state: issue.state,
            }),
          );
        }
        continue;
      }
      seeds.push(issueSeed(issue));
    }
  }

  return [...artifactSeeds.values(), ...seeds.filter((seed) => seed.source !== "artifact")]
    .slice(0, maxSeeds);
};

export { repoInsightArtifactMarker };
