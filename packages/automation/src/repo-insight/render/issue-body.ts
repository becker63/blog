import { RepoEvidenceBundle, RepoInsightIssueDraft } from "../model/types";

const list = (items: string[]) => items.map((item) => `- ${item}`).join("\n");

export const repoInsightRunMarker = (runId: string) => `repo-insight:run-id=${runId}`;

export const repoInsightSourceReposMarker = (sourceRepos: string[]) =>
  `repo-insight:source-repos=${sourceRepos.join(",")}`;

export const repoInsightRelatedCommitsMarker = (relatedCommits: string[]) =>
  `repo-insight:related-commits=${relatedCommits.join(",")}`;

const evidenceList = (items: RepoInsightIssueDraft["evidence"]) =>
  items
    .map((item) => {
      const location = `${item.repo}${item.commit ? `@${item.commit}` : ""}${item.path ? ` ${item.path}` : ""}`;
      const quote = item.quote ? `\n  - Quote: ${item.quote}` : "";
      return `- ${location}\n  - ${item.summary}${quote}`;
    })
    .join("\n");

export const renderInsightIssueBody = ({
  issue,
  evidence,
}: {
  issue: RepoInsightIssueDraft;
  evidence?: RepoEvidenceBundle;
}) => {
  const contextNote = evidence?.contextFiles.length
    ? `\n\nContext files considered: ${evidence.contextFiles.length}`
    : "";

  return [
    `# ${issue.title}`,
    contextNote,
    "",
    "## Hidden thesis",
    "",
    issue.hiddenThesis,
    "",
    "## Why this was selected",
    "",
    issue.whySelected,
    "",
    "## What changed / what was inspected",
    "",
    issue.whatChanged,
    "",
    "## Evidence",
    "",
    evidenceList(issue.evidence),
    "",
    "## Relation to previous writing",
    "",
    issue.relationToPreviousWriting,
    "",
    "## Source repos",
    "",
    list(issue.sourceRepos),
    "",
    "## Related commits",
    "",
    list(issue.relatedCommits),
    "",
    "## Possible blog hooks",
    "",
    list(issue.possibleHooks),
    "",
    "## Follow-up questions",
    "",
    list(issue.followUpQuestions),
    "",
    "## Review actions",
    "",
    issue.reviewActions.map((action) => `- [ ] ${action}`).join("\n"),
    "",
    `<!-- ${repoInsightRunMarker(issue.runId)} -->`,
    `<!-- ${repoInsightSourceReposMarker(issue.sourceRepos)} -->`,
    `<!-- ${repoInsightRelatedCommitsMarker(issue.relatedCommits)} -->`,
    "",
  ].join("\n");
};
