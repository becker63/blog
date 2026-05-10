import { execFileSync } from "node:child_process";

export const digestIssueMarker = "<!-- repo-insight:digest=current-themes -->";
export const digestIssueTitle = "Repo Insight Digest — Current Themes";
export const digestIssueLabels = ["repo-insight", "repo-insight-digest", "generated", "editorial"];

export type GitHubRepoInsightIssue = {
  number: number;
  title: string;
  body?: string;
  url: string;
  labels: string[];
  state: "open" | "closed";
  createdAt: string;
  updatedAt: string;
};

export type DigestIssueResult = {
  number: number;
  url: string;
  action: "created" | "updated" | "dry-run";
};

const defaultRepo = () => {
  const repository = process.env.GITHUB_REPOSITORY;
  if (!repository) return undefined;
  return repository;
};

const repoFromGitRemote = () => {
  try {
    const remote = execFileSync("git", ["remote", "get-url", "origin"], { encoding: "utf8" }).trim();
    const match = remote.match(/github\.com[:/]([^/]+)\/([^/.]+)(?:\.git)?$/);
    return match ? `${match[1]}/${match[2]}` : undefined;
  } catch {
    return undefined;
  }
};

const splitRepo = (repo?: string) => {
  const fullName = repo ?? defaultRepo() ?? repoFromGitRemote();
  if (!fullName) throw new Error("--repo owner/repo or GITHUB_REPOSITORY is required for GitHub issue access.");
  const [owner, name] = fullName.split("/");
  if (!owner || !name) throw new Error(`Expected owner/repo format, received ${fullName}`);
  return { owner, repo: name };
};

export class GitHubDigestIssuePublisher {
  private readonly token?: string;
  private readonly owner: string;
  private readonly repo: string;
  private readonly dryRun: boolean;

  constructor(options: { repo?: string; token?: string; dryRun?: boolean } = {}) {
    const parsed = splitRepo(options.repo);
    this.owner = parsed.owner;
    this.repo = parsed.repo;
    this.token = options.token ?? process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN;
    this.dryRun = options.dryRun ?? false;
  }

  async publish(body: string): Promise<DigestIssueResult> {
    if (this.dryRun) return { number: 0, url: "dry-run", action: "dry-run" };
    this.assertConfigured();

    const existing = await this.findExistingDigestIssue();
    if (existing) {
      const updated = await this.updateIssue(existing.number, { title: digestIssueTitle, body });
      return { number: updated.number, url: updated.url, action: "updated" };
    }

    const labels = await this.ensureLabels(digestIssueLabels);
    const created = await this.createIssue({ title: digestIssueTitle, body, labels });
    if (created) return { number: created.number, url: created.url, action: "created" };
    const createdWithoutLabels = await this.createIssue({ title: digestIssueTitle, body, labels: [] });
    if (!createdWithoutLabels) throw new Error("Failed to create digest issue.");
    return { number: createdWithoutLabels.number, url: createdWithoutLabels.url, action: "created" };
  }

  async existingDigestIssue() {
    if (this.dryRun) return undefined;
    this.assertConfigured();
    return this.findExistingDigestIssue();
  }

  private assertConfigured() {
    if (!this.token) throw new Error("GITHUB_TOKEN or GH_TOKEN is required to create or update the digest issue.");
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

  private async findExistingDigestIssue() {
    const digestLabelIssues = await fetchRepoInsightIssues({
      owner: this.owner,
      repo: this.repo,
      token: this.token,
      state: "open",
      label: "repo-insight-digest",
    });
    const markerIssue = digestLabelIssues.find((issue) => (issue.body ?? "").includes(digestIssueMarker));
    if (markerIssue) return markerIssue;
    if (digestLabelIssues[0]) return digestLabelIssues[0];

    const repoInsightIssues = await fetchRepoInsightIssues({
      owner: this.owner,
      repo: this.repo,
      token: this.token,
      state: "open",
      label: "repo-insight",
    });
    return repoInsightIssues.find((issue) => (issue.body ?? "").includes(digestIssueMarker));
  }

  private async ensureLabels(labels: string[]) {
    const usableLabels: string[] = [];
    for (const label of labels) {
      const response = await fetch(this.apiUrl("/labels"), {
        method: "POST",
        headers: { ...this.headers(), "Content-Type": "application/json" },
        body: JSON.stringify({ name: label, color: "ededed" }),
      });
      if (response.ok || response.status === 422) {
        usableLabels.push(label);
      } else {
        console.warn(`Could not ensure GitHub label ${label}; creating digest issue without it if needed.`);
      }
    }
    return usableLabels;
  }

  private async createIssue(input: { title: string; body: string; labels: string[] }) {
    const response = await fetch(this.apiUrl("/issues"), {
      method: "POST",
      headers: { ...this.headers(), "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok && input.labels.length > 0) {
      console.warn("Could not create digest issue with labels; retrying without labels.");
      return undefined;
    }
    if (!response.ok) throw new Error(`Failed to create digest issue: ${response.status} ${await response.text()}`);
    return toIssueSummary((await response.json()) as GitHubIssueResponse);
  }

  private async updateIssue(number: number, input: { title: string; body: string }) {
    const response = await fetch(this.apiUrl(`/issues/${number}`), {
      method: "PATCH",
      headers: { ...this.headers(), "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    if (!response.ok) throw new Error(`Failed to update digest issue: ${response.status} ${await response.text()}`);
    return toIssueSummary((await response.json()) as GitHubIssueResponse);
  }
}

type GitHubIssueResponse = {
  number: number;
  title: string;
  body?: string | null;
  html_url: string;
  labels?: Array<{ name?: string } | string>;
  state: "open" | "closed";
  created_at: string;
  updated_at: string;
};

const toRepoInsightIssue = (issue: GitHubIssueResponse): GitHubRepoInsightIssue => ({
  number: issue.number,
  title: issue.title,
  body: issue.body ?? undefined,
  url: issue.html_url,
  labels:
    issue.labels?.map((label) => (typeof label === "string" ? label : label.name ?? "")).filter(Boolean) ?? [],
  state: issue.state,
  createdAt: issue.created_at,
  updatedAt: issue.updated_at,
});

const toIssueSummary = (issue: GitHubIssueResponse) => ({
  number: issue.number,
  url: issue.html_url,
});

const fetchRepoInsightIssues = async ({
  owner,
  repo,
  token,
  state,
  label = "repo-insight",
}: {
  owner: string;
  repo: string;
  token?: string;
  state: "open" | "closed" | "all";
  label?: string;
}) => {
  if (!token) throw new Error("GITHUB_TOKEN or GH_TOKEN is required to read repo insight issues.");

  const issues: GitHubIssueResponse[] = [];
  for (let page = 1; page <= 10; page += 1) {
    const url = `https://api.github.com/repos/${owner}/${repo}/issues?state=${state}&labels=${encodeURIComponent(label)}&per_page=100&page=${page}`;
    const response = await fetch(url, {
      headers: {
        Accept: "application/vnd.github+json",
        Authorization: `Bearer ${token}`,
        "X-GitHub-Api-Version": "2022-11-28",
      },
    });
    if (!response.ok) throw new Error(`Failed to list repo insight issues: ${response.status} ${await response.text()}`);
    const pageIssues = (await response.json()) as GitHubIssueResponse[];
    issues.push(...pageIssues);
    if (pageIssues.length < 100) break;
  }
  return issues.map(toRepoInsightIssue);
};

export const listRepoInsightIssues = async ({
  repo,
  includeClosed = true,
}: {
  repo?: string;
  includeClosed?: boolean;
}) => {
  const parsed = splitRepo(repo);
  return fetchRepoInsightIssues({
    owner: parsed.owner,
    repo: parsed.repo,
    token: process.env.GITHUB_TOKEN ?? process.env.GH_TOKEN,
    state: includeClosed ? "all" : "open",
  });
};
