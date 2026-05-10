import matter from "gray-matter";
import { InsightArtifact } from "../model/types";

const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

export const slugifyInsightTitle = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);

export const renderInsightMdx = (artifact: InsightArtifact) => {
  const { frontmatter, sections } = artifact;
  const evidence = sections.evidence
    .map((item) => {
      const location = item.path ? `${item.repo}@${item.commit} ${item.path}` : `${item.repo}@${item.commit}`;
      const quote = item.quote ? `\n  - Quote: ${item.quote}` : "";
      return `- ${location}\n  - ${item.note}${quote}`;
    })
    .join("\n");

  return matter.stringify(
    [
      "## Why This Was Selected",
      "",
      sections.whySelected,
      "",
      "## What Changed / What Was Inspected",
      "",
      sections.inspected,
      "",
      "## Hidden Thesis",
      "",
      sections.hiddenThesis,
      "",
      "## Evidence",
      "",
      evidence,
      "",
      "## Possible Blog Hooks",
      "",
      list(sections.possibleHooks),
      "",
      "## Relation To Previous Writing",
      "",
      sections.relationToPreviousWriting,
      "",
      "## Follow-Up Questions / Next Writing Moves",
      "",
      list(sections.followUpQuestions),
      "",
    ].join("\n"),
    {
      title: frontmatter.title,
      date: frontmatter.date,
      sourceRepos: frontmatter.sourceRepos,
      relatedCommits: frontmatter.relatedCommits,
      tags: frontmatter.tags,
      generated: true,
      published: false,
      promoted: false,
      runId: frontmatter.runId,
      confidence: frontmatter.confidence,
    },
  );
};
