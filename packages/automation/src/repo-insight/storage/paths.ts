import path from "node:path";

export const repoRoot = process.cwd();

/** Source root for this package (`packages/automation/src`). */
export const automationDir = path.join(repoRoot, "packages", "automation", "src");
export const repoInsightDir = path.join(automationDir, "repo-insight");

/** Machine-readable outputs and repo-insight JSON config (not hand-authored MD trees). */
export const contentAutomationDir = path.join(repoRoot, "content", "automation");

export const repoCatalogPath = path.join(contentAutomationDir, "repo-catalog.json");
export const repoInsightContextPath = path.join(contentAutomationDir, "repo-insight-context.json");
export const repoInsightPollStatePath = path.join(contentAutomationDir, "repo-insight-poll-state.json");
export const repoInsightBudgetStatePath = path.join(contentAutomationDir, "repo-insight-budget-state.json");
export const tasteProfilePath = path.join(contentAutomationDir, "taste-profile.md");

/** @deprecated Renamed to `contentAutomationDir`; kept for check.ts skips. */
export const dataDir = contentAutomationDir;

export const toPosixPath = (value: string) => value.split(path.sep).join("/");

export const relativeToRoot = (value: string) =>
  toPosixPath(path.relative(repoRoot, value));
