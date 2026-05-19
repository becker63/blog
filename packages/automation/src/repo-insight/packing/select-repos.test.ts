import assert from "node:assert/strict";
import test from "node:test";
import { RepoInsightPollState } from "../model/types";
import { diffPollState } from "../storage/poll-state";
import { AccessibleRepo } from "./types";
import { sampleReposUniformly, selectCandidateRepos, selectReposForPacking } from "./select-repos";

const repo = (index: number, pushedAt = `2026-05-${String(10 - index).padStart(2, "0")}T00:00:00Z`): AccessibleRepo => ({
  fullName: `owner/repo-${index}`,
  owner: "owner",
  name: `repo-${index}`,
  defaultBranch: "main",
  pushedAt,
  archived: false,
  fork: false,
  private: false,
});

const repos = Array.from({ length: 10 }, (_, index) => repo(index));

test("uniform sampler returns requested count", () => {
  assert.equal(sampleReposUniformly({ repos, count: 5, seed: "count-test" }).length, 5);
});

test("uniform sampler does not always choose the first sorted repos", () => {
  const selected = sampleReposUniformly({ repos, count: 5, seed: "not-latest" }).map((item) => item.fullName);
  assert.notDeepEqual(selected, repos.slice(0, 5).map((item) => item.fullName));
});

test("seeded sampler is reproducible", () => {
  const first = sampleReposUniformly({ repos, count: 5, seed: "stable" }).map((item) => item.fullName);
  const second = sampleReposUniformly({ repos, count: 5, seed: "stable" }).map((item) => item.fullName);
  assert.deepEqual(first, second);
});

test("no-change poll still has no changes for normal mode to skip", () => {
  const previous: RepoInsightPollState = {
    schemaVersion: 1,
    updatedAt: "2026-05-10T00:00:00Z",
    repos: Object.fromEntries(
      repos.map((item) => [
        item.fullName,
        {
          pushedAt: item.pushedAt,
          defaultBranch: item.defaultBranch,
          lastSeenAt: "2026-05-10T00:00:00Z",
        },
      ]),
    ),
  };

  assert.equal(diffPollState(repos, previous).length, 0);
});

test("force-style selection can sample even when no repos changed", () => {
  const selection = selectReposForPacking({
    repos,
    changes: [],
    selectedLimit: 5,
    randomSeed: "force-sample",
  });
  assert.equal(selection.changedRepos.length, 0);
  assert.equal(selection.selectedRepos.length, 5);
});

test("candidate selection includes changed repos without always selecting only changed repos", () => {
  const changedRepo = repo(99, "2026-05-10T00:00:00Z");
  const candidates = selectCandidateRepos({
    repos: [changedRepo, ...repos],
    changes: [{ repo: changedRepo }],
    limit: 10,
  });
  assert.ok(candidates.some((item) => item.fullName === changedRepo.fullName));

  const selected = selectReposForPacking({
    repos: candidates,
    changes: [{ repo: changedRepo }],
    selectedLimit: 5,
    randomSeed: "changed-is-not-forced",
  });
  assert.equal(selected.selectedRepos.length, 5);
});
