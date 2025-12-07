import fs from "fs";
import path from "path";
// @ts-ignore
import matter from "gray-matter";

const postsDirectory = path.join(process.cwd(), "content/posts");

export interface BlogPost {
    slug: string;
    meta: {
        title: string;
        date: string;
        description: string;
        tags: string[];
        image?: string;
    };
    content: string;
    text?: string;
    children?: BlogPost[];
}

export function getPostSlugs() {
    if (!fs.existsSync(postsDirectory)) return [];
    return fs.readdirSync(postsDirectory);
}

export function getPostBySlug(slug: string): BlogPost | null {
    const realSlug = slug.replace(/\.mdx$/, "");
    const fullPath = path.join(postsDirectory, `${realSlug}.mdx`);

    if (!fs.existsSync(fullPath)) return null;

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    return {
        slug: realSlug,
        meta: data as BlogPost["meta"],
        content,
    };
}

export function getAllPosts(): BlogPost[] {
    const slugs = getPostSlugs();
    const posts = slugs
        .map((slug) => getPostBySlug(slug))
        .filter((post): post is BlogPost => post !== null)
        // Sort posts by date in descending order
        .sort((post1, post2) => (post1.meta.date > post2.meta.date ? -1 : 1));
    return posts;
}
