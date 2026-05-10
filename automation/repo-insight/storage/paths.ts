import path from "node:path";

export const repoRoot = process.cwd();

export const automationDir = path.join(repoRoot, "automation");
export const repoInsightDir = path.join(automationDir, "repo-insight");
export const dataDir = path.join(repoRoot, "data");
export const repoCatalogPath = path.join(dataDir, "repo-catalog.json");
export const repoInsightContextPath = path.join(dataDir, "repo-insight-context.json");
export const repoInsightPollStatePath = path.join(dataDir, "repo-insight-poll-state.json");
export const tasteProfilePath = path.join(dataDir, "taste-profile.md");
export const workflowsDir = path.join(repoRoot, ".github", "workflows");

export const toPosixPath = (value: string) => value.split(path.sep).join("/");

export const relativeToRoot = (value: string) =>
  toPosixPath(path.relative(repoRoot, value));

