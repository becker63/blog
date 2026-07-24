import { readFile } from "node:fs/promises";
import path from "node:path";
import { repoCatalogSchema, repoInsightBudgetStateSchema, repoInsightContextConfigSchema, repoInsightPollStateSchema } from "../model/schemas";
import { listFiles } from "../storage/files";
import { dataDir, relativeToRoot, repoCatalogPath, repoInsightBudgetStatePath, repoInsightContextPath, repoInsightPollStatePath, repoRoot } from "../storage/paths";

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

  const budgetState = await readJsonIfExists(repoInsightBudgetStatePath);
  if (budgetState) repoInsightBudgetStateSchema.parse(budgetState);
};

const validateNoGeneratedInsightStore = async () => {
  const textFiles = await listFiles(repoRoot, (filePath) => {
    const rel = relativeToRoot(filePath);
    if (rel.startsWith(".git/") || rel.startsWith("node_modules/") || rel.startsWith(".next/")) return false;
    if (rel === "packages/automation/src/repo-insight/cli/check.ts") return false;
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
  await validateNoGeneratedInsightStore();
  console.log("Repo insight issue-only checks passed.");
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
