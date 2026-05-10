import { InsightArtifact, RepoEvidenceBundle } from "../model/types";
import {
  renderInsightIssueBody,
  repoInsightArtifactMarker,
  repoInsightRunMarker,
} from "../render/issue-body";

export type InsightIssuePublisherOptions = {
  token?: string;
  owner?: string;
  repo?: string;
  dryRun?: boolean;
};

export type CreatedIssue = {
  number: number;
  url: string;
};

type GitHubIssueResponse = {
  number: number;
  html_url: string;
  body?: string | null;
  title?: string;
};

const defaultRepo = () => {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) return {};
  const [owner, repo] = repository.split("/");
  return { owner, repo };
};

const truncateTitle = (title: string, maxLength = 120) =>
  title.length > maxLength ? `${title.slice(0, maxLength - 1)}…` : title;

const sourceLabel = (repoFullName: string) => {
  const repoName = repoFullName.split("/")[1] ?? repoFullName;
  const safeName = repoName
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return safeName ? `source:${safeName}` : undefined;
};

export class GitHubIssuePublisher {
  private readonly token?: string;
  private readonly owner?: string;
  private readonly repo?: string;
  private readonly dryRun: boolean;

  constructor(options: InsightIssuePublisherOptions = {}) {
    const inferredRepo = defaultRepo();
    this.token = options.token ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
    this.owner = options.owner ?? inferredRepo.owner;
    this.repo = options.repo ?? inferredRepo.repo;
    this.dryRun = options.dryRun ?? false;
  }

  async publishInsightIssue(input: {
    artifact: InsightArtifact;
    artifactPath: string;
    evidence?: RepoEvidenceBundle;
  }): Promise<CreatedIssue | undefined> {
    if (this.dryRun) return undefined;
    this.assertConfigured();

    const existing = await this.findExistingIssue(input.artifact, input.artifactPath);
    if (existing) return existing;

    const labels = [
      "repo-insight",
      "blog-candidate",
      "generated",
      ...input.artifact.frontmatter.sourceRepos.map(sourceLabel).filter((label): label is string => Boolean(label)),
    ];
    const usableLabels = await this.ensureLabels(labels);
    const title = truncateTitle(`Repo insight: ${input.artifact.frontmatter.title}`);
    const body = renderInsightIssueBody(input);

    const issue = await this.createIssue({ title, body, labels: usableLabels });
    if (issue) return issue;

    return this.createIssue({ title, body, labels: [] });
  }

  private assertConfigured() {
    if (!this.token) {
      throw new Error("GITHUB_TOKEN or GH_TOKEN is required to create repo insight issues.");
    }
    if (!this.owner || !this.repo) {
      throw new Error("GITHUB_REPOSITORY or explicit owner/repo is required to create repo insight issues.");
    }
  }

  private headers() {
    return {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${this.token}`,
      "X-GitHub-Api-Version": "2022-11-28",
    };
  }

  private apiUrl(path: string) {
    return `https://api.github.com/repos/${this.owner}/${this.repo}${path}`;
  }

  private async findExistingIssue(artifact: InsightArtifact, artifactPath: string): Promise<CreatedIssue | undefined> {
    const runMarker = repoInsightRunMarker(artifact.frontmatter.runId);
    const artifactMarker = repoInsightArtifactMarker(artifactPath);
    const response = await fetch(this.apiUrl("/issues?state=open&per_page=100"), {
      headers: this.headers(),
    });

    if (!response.ok) {
      throw new Error(`Failed to search existing repo insight issues: ${response.status} ${await response.text()}`);
    }

    const issues = (await response.json()) as GitHubIssueResponse[];
    const existing = issues.find((issue) => {
      const body = issue.body ?? "";
      return body.includes(runMarker) || body.includes(artifactMarker);
    });

    return existing ? { number: existing.number, url: existing.html_url } : undefined;
  }

  private async ensureLabels(labels: string[]) {
    const usableLabels: string[] = [];
    for (const label of labels) {
      const response = await fetch(this.apiUrl("/labels"), {
        method: "POST",
        headers: {
          ...this.headers(),
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: label,
          color: "ededed",
        }),
      });

      if (response.ok || response.status === 422) {
        usableLabels.push(label);
      } else {
        console.warn(`Could not ensure GitHub label ${label}; creating issue without it if needed.`);
      }
    }
    return usableLabels;
  }

  private async createIssue(input: {
    title: string;
    body: string;
    labels: string[];
  }): Promise<CreatedIssue | undefined> {
    const response = await fetch(this.apiUrl("/issues"), {
      method: "POST",
      headers: {
        ...this.headers(),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(input),
    });

    if (!response.ok && input.labels.length > 0) {
      console.warn("Could not create repo insight issue with labels; retrying without labels.");
      return undefined;
    }
    if (!response.ok) {
      throw new Error(`Failed to create repo insight issue: ${response.status} ${await response.text()}`);
    }

    const issue = (await response.json()) as GitHubIssueResponse;
    return {
      number: issue.number,
      url: issue.html_url,
    };
  }
}
