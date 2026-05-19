import fs from "fs";
import path from "path";

let cached: string | null = null;

/**
 * Resolve the repo root when the Next app lives under `apps/blog` (Nx / monorepo).
 * Walks up from `process.cwd()` until a workspace marker (`nx.json`, root `package.json` workspaces, or `content/posts`) exists.
 */
export function getWorkspaceRoot(): string {
  if (cached) return cached;
  let dir = process.cwd();
  for (let i = 0; i < 10; i++) {
    const hasNx = fs.existsSync(path.join(dir, "nx.json"));
    const hasNpmWorkspaces = fs.existsSync(path.join(dir, "package.json"));
    const hasContent = fs.existsSync(path.join(dir, "content", "posts"));
    const isRootPackageJson =
      hasNpmWorkspaces &&
      (() => {
        try {
          const raw = fs.readFileSync(path.join(dir, "package.json"), "utf8");
          return raw.includes('"workspaces"');
        } catch {
          return false;
        }
      })();
    if (hasNx || isRootPackageJson || hasContent) {
      cached = dir;
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  cached = process.cwd();
  return cached;
}
