import fs from "node:fs";
import path from "node:path";
import { launchSchema, type Launch } from "./schemas";
import { launchDir, launchFilePath } from "./paths";

export const readLaunch = (launchId: string): Launch => {
  const filePath = launchFilePath(launchId);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Launch not found: ${launchId} (${filePath})`);
  }
  const raw = JSON.parse(fs.readFileSync(filePath, "utf8"));
  return launchSchema.parse(raw);
};

export const writeLaunch = (launch: Launch): void => {
  const dir = launchDir(launch.id);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(launchFilePath(launch.id), `${JSON.stringify(launch, null, 2)}\n`);
};

export const ensureLaunchDirs = (launchId: string): void => {
  const base = launchDir(launchId);
  fs.mkdirSync(path.join(base, "drafts"), { recursive: true });
  fs.mkdirSync(path.join(base, "snapshots"), { recursive: true });
};
