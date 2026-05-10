import { DispatchPayload, RepoCatalog } from "../model/types";
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

export const discoverTopRepos = async ({
  catalog,
  triggerHint,
  token = process.env.GH_REPO_INSIGHT_TOKEN,
  limit = Number(process.env.REPO_INSIGHT_REPO_LIMIT ?? "5"),
}: {
  catalog: RepoCatalog;
  triggerHint?: DispatchPayload;
  token?: string;
  limit?: number;
}): Promise<AccessibleRepo[]> => {
  if (!token) {
    throw new Error("GH_REPO_INSIGHT_TOKEN is required to discover recently pushed repositories.");
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

  let selected = repos.slice(0, limit);
  if (triggerHint && !selected.some((repo) => repo.fullName === triggerHint.repo)) {
    const triggerRepo =
      repos.find((repo) => repo.fullName === triggerHint.repo) ??
      (await fetchTriggerRepo(triggerHint.repo, catalog, token).catch(() => undefined));
    if (triggerRepo && repoAllowed(triggerRepo)) {
      selected = [...selected.slice(0, Math.max(0, limit - 1)), triggerRepo];
    }
  }

  return selected;
};

const fetchTriggerRepo = async (fullName: string, catalog: RepoCatalog, token: string) => {
  const response = await fetch(`https://api.github.com/repos/${fullName}`, {
    headers: headers(token),
  });
  if (!response.ok) return undefined;
  return toAccessibleRepo((await response.json()) as GitHubRepoResponse, catalog);
};
