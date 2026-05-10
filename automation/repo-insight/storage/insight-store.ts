import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { insightArtifactSchema, insightFrontmatterSchema } from "../model/schemas";
import { InsightArtifact } from "../model/types";
import { renderInsightMdx, slugifyInsightTitle } from "../render/insight-mdx";
import { writeInsightIndex } from "../render/index-json";
import { datePathParts, insightRunsDir, relativeToRoot } from "./paths";

export const insightArtifactPath = (artifact: InsightArtifact) => {
  const date = new Date(artifact.frontmatter.date);
  const { year, month } = datePathParts(date);
  const slug = slugifyInsightTitle(artifact.frontmatter.title);
  return path.join(insightRunsDir, year, month, artifact.frontmatter.runId, `${slug}.mdx`);
};

export const writeInsightArtifact = async (artifact: InsightArtifact) => {
  const parsed = insightArtifactSchema.parse(artifact);
  const targetPath = insightArtifactPath(parsed);
  await mkdir(path.dirname(targetPath), { recursive: true });
  await writeFile(targetPath, renderInsightMdx(parsed), { encoding: "utf8", flag: "wx" });
  await writeInsightIndex();
  return relativeToRoot(targetPath);
};

export const readInsightFrontmatter = async (filePath: string) => {
  const raw = await readFile(filePath, "utf8");
  return insightFrontmatterSchema.parse(matter(raw).data);
};
