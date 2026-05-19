import { RepoCatalog } from "../model/types";
import { findRepoOverlay } from "../storage/repo-catalog";
import { AccessibleRepo } from "../packing/types";

type GitHubRepoResponse = {
  full_name: string;
  name: string;
  owner: { login: string };
  default_branch: string;
  pushed_at: string | null;
  archived: boolean;
  fork: boolean;
  private: boolean;
  html_url?: string;
};

const headers = (token: string) => ({
  Accept: "application/vnd.github+json",
  Authorization: `Bearer ${token}`,
  "X-GitHub-Api-Version": "2022-11-28",
});

const toAccessibleRepo = (repo: GitHubRepoResponse, catalog: RepoCatalog): AccessibleRepo => ({
  fullName: repo.full_name,
  owner: repo.owner.login,
  name: repo.name,
  defaultBranch: repo.default_branch,
  pushedAt: repo.pushed_at ?? new Date(0).toISOString(),
  archived: repo.archived,
  fork: repo.fork,
  private: repo.private,
  htmlUrl: repo.html_url,
  overlay: findRepoOverlay(catalog, repo.full_name),
});

const repoAllowed = (repo: AccessibleRepo) => {
  if (repo.archived) return false;
  if (repo.overlay?.enabled === false) return false;
  if (repo.fork && repo.overlay?.includeForks !== true) return false;
  return true;
};

export const discoverAccessibleRepos = async ({
  catalog,
  token = process.env.GH_REPO_INSIGHT_TOKEN ?? process.env.GH_TOKEN ?? process.env.GITHUB_TOKEN,
  limit = Number(process.env.REPO_INSIGHT_DISCOVERY_LIMIT ?? "100"),
}: {
  catalog: RepoCatalog;
  token?: string;
  limit?: number;
}): Promise<AccessibleRepo[]> => {
  if (!token) {
    throw new Error("GH_REPO_INSIGHT_TOKEN, GH_TOKEN, or GITHUB_TOKEN is required to discover recently pushed repositories.");
  }

  const response = await fetch(
    "https://api.github.com/user/repos?sort=pushed&direction=desc&affiliation=owner,collaborator,organization_member&per_page=100",
    { headers: headers(token) },
  );
  if (!response.ok) {
    throw new Error(`Failed to list accessible repositories: ${response.status} ${await response.text()}`);
  }

  const repos = ((await response.json()) as GitHubRepoResponse[])
    .map((repo) => toAccessibleRepo(repo, catalog))
    .filter(repoAllowed);

  return repos.slice(0, limit);
};

export const discoverTopRepos = discoverAccessibleRepos;
