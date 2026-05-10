import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import { insightFrontmatterSchema, insightIndexSchema, repoCatalogSchema } from "../model/schemas";
import { buildInsightIndex } from "../render/index-json";
import { listFiles } from "../storage/files";
import { insightIndexPath, insightsDir, repoCatalogPath } from "../storage/paths";

const requiredSections = [
  "## Why This Was Selected",
  "## What Changed / What Was Inspected",
  "## Hidden Thesis",
  "## Evidence",
  "## Possible Blog Hooks",
  "## Relation To Previous Writing",
  "## Follow-Up Questions / Next Writing Moves",
];

const readJsonIfExists = async (filePath: string) => {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
};

const validateRepoCatalog = async () => {
  const raw = await readJsonIfExists(repoCatalogPath);
  if (raw) repoCatalogSchema.parse(raw);
};

const validateInsights = async () => {
  const files = await listFiles(insightsDir, (filePath) => filePath.endsWith(".mdx"));
  for (const file of files) {
    if (file.includes("/content/posts/")) {
      throw new Error(`Generated insight must not live in content/posts: ${file}`);
    }

    const raw = await readFile(file, "utf8");
    const parsed = matter(raw);
    insightFrontmatterSchema.parse(parsed.data);

    for (const section of requiredSections) {
      if (!parsed.content.includes(section)) {
        throw new Error(`Insight ${file} is missing required section: ${section}`);
      }
    }
  }

  const committedIndex = await readJsonIfExists(insightIndexPath);
  const generatedIndex = await buildInsightIndex();
  const normalizedCommitted = committedIndex
    ? insightIndexSchema.parse(committedIndex)
    : { ...generatedIndex, generatedAt: generatedIndex.generatedAt };

  const committedComparable = JSON.stringify({
    ...normalizedCommitted,
    generatedAt: "<ignored>",
  });
  const generatedComparable = JSON.stringify({
    ...generatedIndex,
    generatedAt: "<ignored>",
  });

  if (committedComparable !== generatedComparable) {
    throw new Error("content/insights/index.json is stale. Run pnpm insight:index.");
  }
};

const main = async () => {
  await validateRepoCatalog();
  await validateInsights();
  console.log("Repo insight artifacts are valid.");
};

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
});
