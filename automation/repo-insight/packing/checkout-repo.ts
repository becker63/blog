import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { rmSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { runSubprocess } from "../adapters/subprocess";
import { AccessibleRepo } from "./types";

export type RepoCheckout = {
  path: string;
  source: "github" | "local";
  cleanup(): Promise<void>;
};

const tempRoots = new Set<string>();

process.once("exit", () => {
  for (const tempRoot of tempRoots) {
    // Best-effort cleanup for normal process exits; async cleanup happens in callers.
    try {
      rmSync(tempRoot, { recursive: true, force: true });
    } catch {
      // Ignore cleanup errors on process exit.
    }
  }
});

export const checkoutRepo = async (
  repo: AccessibleRepo,
  token = process.env.GH_REPO_INSIGHT_TOKEN,
): Promise<RepoCheckout> => {
  if (repo.overlay?.localPath) {
    return {
      path: repo.overlay.localPath,
      source: "local",
      cleanup: async () => {},
    };
  }

  if (!token) throw new Error("GH_REPO_INSIGHT_TOKEN is required to clone repositories for Repomix.");

  const tempRoot = await mkdtemp(path.join(os.tmpdir(), "repo-insight-"));
  tempRoots.add(tempRoot);
  const askpassPath = path.join(tempRoot, "git-askpass.sh");
  await writeFile(askpassPath, "#!/bin/sh\nprintf '%s\\n' \"$GH_REPO_INSIGHT_TOKEN\"\n", {
    mode: 0o700,
  });

  const targetPath = path.join(tempRoot, repo.name);
  const remoteUrl = `https://x-access-token@github.com/${repo.fullName}.git`;

  try {
    await runSubprocess(
      "git",
      ["clone", "--depth", "1", "--branch", repo.defaultBranch, remoteUrl, targetPath],
      "",
      {
        env: {
          GH_REPO_INSIGHT_TOKEN: token,
          GIT_ASKPASS: askpassPath,
          GIT_TERMINAL_PROMPT: "0",
        },
      },
    );
  } catch (error) {
    await rm(tempRoot, { recursive: true, force: true });
    tempRoots.delete(tempRoot);
    const message = error instanceof Error ? error.message.replaceAll(token, "[redacted]") : String(error);
    throw new Error(`Failed to clone ${repo.fullName} for Repomix packing: ${message}`);
  }

  return {
    path: targetPath,
    source: "github",
    cleanup: async () => {
      await rm(tempRoot, { recursive: true, force: true });
      tempRoots.delete(tempRoot);
    },
  };
};
