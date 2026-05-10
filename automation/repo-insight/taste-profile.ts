import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { PublishedPostSummary, readPublishedPosts } from "./storage/published-posts";
import { tasteProfilePath } from "./storage/paths";

const manualStart = "<!-- repo-insight:manual-start -->";
const manualEnd = "<!-- repo-insight:manual-end -->";

const extractManualSection = async () => {
  try {
    const current = await readFile(tasteProfilePath, "utf8");
    const start = current.indexOf(manualStart);
    const end = current.indexOf(manualEnd);
    if (start >= 0 && end > start) {
      return current.slice(start + manualStart.length, end).trim();
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }
  return "Add hand-written taste notes here. This section is preserved by regeneration.";
};

const topTags = (posts: PublishedPostSummary[]) => {
  const counts = new Map<string, number>();
  for (const post of posts) {
    for (const tag of post.tags) counts.set(tag, (counts.get(tag) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 8)
    .map(([tag, count]) => `- ${tag} (${count})`);
};

const renderTasteProfile = (posts: PublishedPostSummary[], manual: string) => {
  const recentPosts = posts.slice(0, 8);
  const tagLines = topTags(posts);

  return [
    "# Taste Profile",
    "",
    "## Manual Notes",
    "",
    manualStart,
    manual,
    manualEnd,
    "",
    "## Recurring Themes",
    "",
    tagLines.length > 0 ? tagLines.join("\n") : "- No published post tags found yet.",
    "",
    "## Strong Claims",
    "",
    "- Prefer claims grounded in concrete system behavior, reproducible artifacts, and implementation tradeoffs.",
    "- Favor one clear thesis over broad activity summaries.",
    "",
    "## Preferred Evidence",
    "",
    "- Commit SHAs, file paths, code excerpts, docs, tests, release artifacts, and before/after behavior.",
    "",
    "## Voice Notes",
    "",
    "- Direct, technical, reflective, and skeptical of vague platform language.",
    "- Draftable seeds are useful; polished posts are not expected from automation.",
    "",
    "## Avoid",
    "",
    "- Generic push summaries.",
    "- Publishing claims without file-level evidence.",
    "- Treating diffs as the full context boundary.",
    "",
    "## Recently Covered",
    "",
    recentPosts
      .map((post) => `- ${post.title}${post.date ? ` (${post.date})` : ""}: ${post.description ?? post.slug}`)
      .join("\n") || "- No published posts found.",
    "",
  ].join("\n");
};

export const buildTasteProfile = async (options: { write?: boolean } = {}) => {
  const posts = await readPublishedPosts();
  const manual = await extractManualSection();
  const profile = renderTasteProfile(posts, manual);

  if (options.write ?? true) {
    await mkdir(path.dirname(tasteProfilePath), { recursive: true });
    await writeFile(tasteProfilePath, profile, "utf8");
  }
  return profile;
};

export const readOrBuildTasteProfile = async () => {
  try {
    return await readFile(tasteProfilePath, "utf8");
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
    return buildTasteProfile();
  }
};
