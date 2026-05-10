import { readFile, writeFile } from "node:fs/promises";
import { repoInsightPollStateSchema } from "../model/schemas";
import { RepoInsightPollState } from "../model/types";
import { AccessibleRepo } from "../packing/types";
import { repoInsightPollStatePath } from "./paths";

const emptyPollState = (): RepoInsightPollState => ({
  schemaVersion: 1,
  updatedAt: new Date(0).toISOString(),
  repos: {},
});

export const readPollState = async (): Promise<RepoInsightPollState> => {
  try {
    return repoInsightPollStateSchema.parse(JSON.parse(await readFile(repoInsightPollStatePath, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return emptyPollState();
    throw error;
  }
};

export const writePollState = async (state: RepoInsightPollState) => {
  await writeFile(repoInsightPollStatePath, `${JSON.stringify(repoInsightPollStateSchema.parse(state), null, 2)}\n`, "utf8");
};

export type PollStateChange = {
  repo: AccessibleRepo;
  previous?: RepoInsightPollState["repos"][string];
};

export const diffPollState = (currentRepos: AccessibleRepo[], previousState: RepoInsightPollState): PollStateChange[] =>
  currentRepos
    .filter((repo) => {
      const previous = previousState.repos[repo.fullName];
      return !previous || previous.pushedAt !== repo.pushedAt;
    })
    .map((repo) => ({
      repo,
      previous: previousState.repos[repo.fullName],
    }))
    .sort((left, right) => Date.parse(right.repo.pushedAt) - Date.parse(left.repo.pushedAt));

export const buildUpdatedPollState = (
  currentRepos: AccessibleRepo[],
  previousState: RepoInsightPollState,
  now = new Date(),
): RepoInsightPollState => {
  const lastSeenAt = now.toISOString();
  return repoInsightPollStateSchema.parse({
    schemaVersion: 1,
    updatedAt: lastSeenAt,
    repos: {
      ...previousState.repos,
      ...Object.fromEntries(
        currentRepos.map((repo) => [
          repo.fullName,
          {
            pushedAt: repo.pushedAt,
            defaultBranch: repo.defaultBranch,
            lastSeenAt,
          },
        ]),
      ),
    },
  });
};
