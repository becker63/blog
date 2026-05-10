import { readFile } from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { listFiles } from "./files";
import { repoRoot } from "./paths";

export type PublishedPostSummary = {
  slug: string;
  title: string;
  date?: string;
  description?: string;
  tags: string[];
  content: string;
};

const postsDir = path.join(repoRoot, "content", "posts");

const normalizeTags = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((tag): tag is string => typeof tag === "string");
  if (typeof value === "string") return [value];
  return [];
};

export const readPublishedPosts = async (): Promise<PublishedPostSummary[]> => {
  const files = await listFiles(postsDir, (filePath) => filePath.endsWith(".mdx"));

  const posts = await Promise.all(
    files.map(async (filePath) => {
      const raw = await readFile(filePath, "utf8");
      const parsed = matter(raw);
      return {
        slug: path.basename(filePath, ".mdx"),
        title: String(parsed.data.title ?? path.basename(filePath, ".mdx")),
        date: parsed.data.date ? String(parsed.data.date) : undefined,
        description: parsed.data.description ? String(parsed.data.description) : undefined,
        tags: normalizeTags(parsed.data.tags),
        content: parsed.content.trim(),
      };
    }),
  );

  return posts.sort((a, b) => String(b.date ?? "").localeCompare(String(a.date ?? "")));
};
