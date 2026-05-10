import { readFile, writeFile } from "node:fs/promises";
import matter from "gray-matter";
import { insightFrontmatterSchema, insightIndexSchema } from "../model/schemas";
import { InsightIndex } from "../model/types";
import { listFiles } from "../storage/files";
import { insightIndexPath, insightsDir, relativeToRoot } from "../storage/paths";

export const buildInsightIndex = async (): Promise<InsightIndex> => {
  const existingIndex = await readExistingInsightIndex();
  const files = await listFiles(
    insightsDir,
    (filePath) => filePath.endsWith(".mdx") && !filePath.includes("/digests/"),
  );

  const insights = await Promise.all(
    files.map(async (filePath) => {
      const raw = await readFile(filePath, "utf8");
      const parsed = matter(raw);
      const frontmatter = insightFrontmatterSchema.parse(parsed.data);
      return {
        slug: filePath.split("/").at(-1)?.replace(/\.mdx$/, "") ?? frontmatter.runId,
        path: relativeToRoot(filePath),
        title: frontmatter.title,
        date: frontmatter.date,
        sourceRepos: frontmatter.sourceRepos,
        relatedCommits: frontmatter.relatedCommits,
        tags: frontmatter.tags,
        generated: true as const,
        published: false as const,
        promoted: false as const,
        runId: frontmatter.runId,
        confidence: frontmatter.confidence,
        issue: existingIndex?.insights.find(
          (insight) => insight.path === relativeToRoot(filePath) || insight.runId === frontmatter.runId,
        )?.issue,
      };
    }),
  );

  return insightIndexSchema.parse({
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    insights: insights.sort((a, b) => b.date.localeCompare(a.date)),
  });
};

export const writeInsightIndex = async () => {
  const index = await buildInsightIndex();
  await writeFile(insightIndexPath, `${JSON.stringify(index, null, 2)}\n`, "utf8");
  return index;
};

const readExistingInsightIndex = async (): Promise<InsightIndex | undefined> => {
  try {
    return insightIndexSchema.parse(JSON.parse(await readFile(insightIndexPath, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
};

export const writeInsightIssueMetadata = async ({
  artifactPath,
  runId,
  issue,
}: {
  artifactPath: string;
  runId: string;
  issue: { number: number; url: string };
}) => {
  const index = await buildInsightIndex();
  const updated = {
    ...index,
    insights: index.insights.map((insight) =>
      insight.path === artifactPath || insight.runId === runId ? { ...insight, issue } : insight,
    ),
  };
  await writeFile(insightIndexPath, `${JSON.stringify(insightIndexSchema.parse(updated), null, 2)}\n`, "utf8");
  return updated;
};
