import { readFile } from "node:fs/promises";
import path from "node:path";
import { repoCatalogSchema, repoInsightContextConfigSchema, repoInsightPollStateSchema } from "../model/schemas";
import { listFiles } from "../storage/files";
import { dataDir, relativeToRoot, repoCatalogPath, repoInsightContextPath, repoInsightPollStatePath, repoRoot, workflowsDir } from "../storage/paths";

const readJsonIfExists = async (filePath: string) => {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
};

const validateJson = async () => {
  const catalog = await readJsonIfExists(repoCatalogPath);
  if (catalog) repoCatalogSchema.parse(catalog);

  const context = await readJsonIfExists(repoInsightContextPath);
  if (context) repoInsightContextConfigSchema.parse(context);

  const pollState = await readJsonIfExists(repoInsightPollStatePath);
  if (pollState) repoInsightPollStateSchema.parse(pollState);
};

const validateWorkflowDefinitions = async () => {
  const files = await listFiles(workflowsDir, (filePath) => filePath.endsWith(".yml") || filePath.endsWith(".yaml"));
  if (files.length === 0) throw new Error("No generated workflow files found.");

  for (const file of files) {
    const text = await readFile(file, "utf8");
    const retiredOutputDir = ["content", "insights"].join("/");
    if (text.includes(retiredOutputDir)) {
      throw new Error(`Workflow still references retired generated-output dir: ${relativeToRoot(file)}`);
    }
  }
};

const validateNoGeneratedInsightStore = async () => {
  const textFiles = await listFiles(repoRoot, (filePath) => {
    const rel = relativeToRoot(filePath);
    if (rel.startsWith(".git/") || rel.startsWith("node_modules/") || rel.startsWith(".next/")) return false;
    if (rel === "automation/repo-insight/cli/check.ts") return false;
    return /\.(ts|tsx|js|json|md|yml|yaml)$/.test(path.extname(filePath)) || rel === "package.json";
  });

  const forbidden = [
    ["content", "insights"].join("/"),
    ["artifact", "Path"].join(""),
    ["Insight", "Artifact"].join(""),
    ["insight", "index"].join(":"),
    ["insight", "validate"].join(":"),
  ];
  for (const file of textFiles) {
    if (file.startsWith(dataDir)) continue;
    const text = await readFile(file, "utf8");
    const matches = forbidden.filter((term) => text.includes(term));
    if (matches.length) {
      throw new Error(`Repo insight check found retired terms (${matches.join(", ")}) in ${relativeToRoot(file)}`);
    }
  }
};

const main = async () => {
  await validateJson();
  await validateWorkflowDefinitions();
  await validateNoGeneratedInsightStore();
  console.log("Repo insight issue-only checks passed.");
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
