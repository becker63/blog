import path from "node:path";
import { repoRoot } from "../storage/paths";

export const repoInsightCacheDir =
  process.env.REPO_INSIGHT_CACHE_DIR ?? path.join(repoRoot, ".cache", "repo-insight");

export const capsuleCacheDir = path.join(repoInsightCacheDir, "capsules");
