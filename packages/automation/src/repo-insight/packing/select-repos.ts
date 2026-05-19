import { createHash, randomBytes } from "node:crypto";
import { PollStateChange } from "../storage/poll-state";
import { AccessibleRepo } from "./types";

export type RepoSelectionMode = "uniform" | "latest" | "pinned";

export type RepoSelection = {
  mode: RepoSelectionMode;
  randomSeed?: string;
  candidateRepos: AccessibleRepo[];
  selectedRepos: AccessibleRepo[];
  changedRepos: AccessibleRepo[];
};

const DEFAULT_ACTIVE_WINDOW_DAYS = 90;

const selectionMode = (value: string | undefined): RepoSelectionMode =>
  value === "latest" || value === "pinned" || value === "uniform" ? value : "uniform";

const uniqueRepos = (repos: AccessibleRepo[]) => {
  const seen = new Set<string>();
  return repos.filter((repo) => {
    if (seen.has(repo.fullName)) return false;
    seen.add(repo.fullName);
    return true;
  });
};

const seededRandom = (seed: string) => {
  let state = createHash("sha256").update(seed).digest().readUInt32LE(0);
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
};

const cryptoRandom = () => randomBytes(4).readUInt32LE(0) / 4294967296;

export const createRunSeed = (explicitSeed = process.env.REPO_INSIGHT_RANDOM_SEED) =>
  explicitSeed?.trim() || randomBytes(16).toString("hex");

export const selectCandidateRepos = ({
  repos,
  changes,
  limit = Number(process.env.REPO_INSIGHT_CANDIDATE_LIMIT ?? "25"),
  now = new Date(),
  activeWindowDays = DEFAULT_ACTIVE_WINDOW_DAYS,
}: {
  repos: AccessibleRepo[];
  changes: PollStateChange[];
  limit?: number;
  now?: Date;
  activeWindowDays?: number;
}) => {
  const changed = changes.map((change) => change.repo);
  const pinned = repos.filter((repo) => repo.overlay?.pinned);
  const activeSince = now.getTime() - activeWindowDays * 24 * 60 * 60 * 1000;
  const recentlyActive = repos.filter((repo) => Date.parse(repo.pushedAt) >= activeSince);
  const pool = uniqueRepos([...changed, ...pinned, ...recentlyActive, ...repos]);
  return pool.slice(0, Math.max(1, limit));
};

export const sampleReposUniformly = ({
  repos,
  count,
  seed,
}: {
  repos: AccessibleRepo[];
  count: number;
  seed?: string;
}) => {
  const shuffled = [...repos];
  const random = seed ? seededRandom(seed) : cryptoRandom;
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
};

export const selectReposForPacking = ({
  repos,
  changes,
  mode = selectionMode(process.env.REPO_INSIGHT_SELECTION_MODE),
  candidateLimit = Number(process.env.REPO_INSIGHT_CANDIDATE_LIMIT ?? "25"),
  selectedLimit = Number(process.env.REPO_INSIGHT_SELECTED_REPO_LIMIT ?? process.env.REPO_INSIGHT_REPO_LIMIT ?? "3"),
  randomSeed = createRunSeed(),
}: {
  repos: AccessibleRepo[];
  changes: PollStateChange[];
  mode?: RepoSelectionMode;
  candidateLimit?: number;
  selectedLimit?: number;
  randomSeed?: string;
}): RepoSelection => {
  const candidateRepos = selectCandidateRepos({ repos, changes, limit: candidateLimit });
  const selectedRepos =
    mode === "latest"
      ? candidateRepos.slice(0, selectedLimit)
      : mode === "pinned"
        ? candidateRepos.filter((repo) => repo.overlay?.pinned).slice(0, selectedLimit)
        : sampleReposUniformly({ repos: candidateRepos, count: selectedLimit, seed: randomSeed });

  return {
    mode,
    randomSeed,
    candidateRepos,
    selectedRepos: selectedRepos.length ? selectedRepos : sampleReposUniformly({ repos: candidateRepos, count: selectedLimit, seed: randomSeed }),
    changedRepos: changes.map((change) => change.repo),
  };
};
