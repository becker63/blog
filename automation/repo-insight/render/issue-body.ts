import { InsightArtifact, RepoEvidenceBundle } from "../model/types";

const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

export const repoInsightRunMarker = (runId: string) => `repo-insight:run-id=${runId}`;

export const repoInsightArtifactMarker = (artifactPath: string) =>
  `repo-insight:artifact-path=${artifactPath}`;

export const renderInsightIssueBody = ({
  artifact,
  artifactPath,
  evidence,
}: {
  artifact: InsightArtifact;
  artifactPath: string;
  evidence?: RepoEvidenceBundle;
}) => {
  const { frontmatter, sections } = artifact;
  const contextNote = evidence?.contextFiles.length
    ? `\n\nContext files considered: ${evidence.contextFiles.length}`
    : "";

  return [
    `Generated insight artifact: \`${artifactPath}\``,
    contextNote,
    "",
    "## Hidden thesis",
    "",
    sections.hiddenThesis,
    "",
    "## Why this was selected",
    "",
    sections.whySelected,
    "",
    "## Source repos",
    "",
    list(frontmatter.sourceRepos),
    "",
    "## Related commits",
    "",
    list(frontmatter.relatedCommits),
    "",
    "## Possible blog hooks",
    "",
    list(sections.possibleHooks),
    "",
    "## Follow-up questions",
    "",
    list(sections.followUpQuestions),
    "",
    "## Review actions",
    "",
    "- [ ] Read the generated insight artifact",
    "- [ ] Promote into `content/posts`",
    "- [ ] Merge with an existing draft",
    "- [ ] Close as not useful",
    "",
    `<!-- ${repoInsightRunMarker(frontmatter.runId)} -->`,
    `<!-- ${repoInsightArtifactMarker(artifactPath)} -->`,
    "",
  ].join("\n");
};
