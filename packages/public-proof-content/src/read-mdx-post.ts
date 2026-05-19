import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import { postsDir } from "public-proof-core";

export type MdxPost = {
  slug: string;
  title: string;
  description: string;
  tags: string[];
  date: string;
  body: string;
  filePath: string;
};

const normalizeTags = (tags: string | string[] | undefined): string[] => {
  if (Array.isArray(tags)) return tags.filter((t): t is string => typeof t === "string");
  return typeof tags === "string" ? [tags] : [];
};

export const readMdxPost = (slug: string, root = postsDir): MdxPost => {
  const realSlug = slug.replace(/\.mdx$/, "");
  const filePath = path.join(root, `${realSlug}.mdx`);
  if (!fs.existsSync(filePath)) {
    throw new Error(`MDX post not found: ${realSlug} (${filePath})`);
  }
  const fileContents = fs.readFileSync(filePath, "utf8");
  const { data, content } = matter(fileContents);
  return {
    slug: realSlug,
    title: String(data.title ?? realSlug),
    description: String(data.description ?? ""),
    tags: normalizeTags(data.tags),
    date: String(data.date ?? ""),
    body: content.trim(),
    filePath,
  };
};
