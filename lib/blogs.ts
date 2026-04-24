import fs from "fs";
import path from "path";
// @ts-ignore
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

/* ------------------------- */
/* Types                     */
/* ------------------------- */

interface RawFrontmatter {
  title: string;
  date: string;
  description: string;
  tags: string[];
  image?: string;
}

export interface BlogPost {
  slug: string;
  meta: {
    title: string;
    date: Date;
    description: string;
    tags: string[];
    image?: string;
  };
  content: string;
  text?: string;
  children?: BlogPost[];
}

/* ------------------------- */
/* Slugs                     */
/* ------------------------- */

export function getPostSlugs(): string[] {
  if (!fs.existsSync(postsDirectory)) return [];
  return fs.readdirSync(postsDirectory);
}

/* ------------------------- */
/* Single Post               */
/* ------------------------- */

export function getPostBySlug(slug: string): BlogPost | null {
  const realSlug = slug.replace(/\.mdx$/, "");
  const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);

  if (!fs.existsSync(fullPath)) return null;

  const fileContents = fs.readFileSync(fullPath, "utf8");
  const { data, content } = matter(fileContents);

  const frontmatter = data as RawFrontmatter;

  const parsedDate = new Date(frontmatter.date);

  if (isNaN(parsedDate.getTime())) {
    throw new Error(`Invalid date format in ${realSlug}: ${frontmatter.date}`);
  }

  return {
    slug: realSlug,
    meta: {
      title: frontmatter.title,
      description: frontmatter.description,
      tags: frontmatter.tags,
      image: frontmatter.image,
      date: parsedDate,
    },
    content,
  };
}

/* ------------------------- */
/* All Posts                 */
/* ------------------------- */

export function getAllPosts(): BlogPost[] {
  const slugs = getPostSlugs();

  return slugs
    .map((slug) => getPostBySlug(slug))
    .filter((post): post is BlogPost => post !== null)
    .sort((a, b) => b.meta.date.getTime() - a.meta.date.getTime());
}
