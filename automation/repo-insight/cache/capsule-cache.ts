import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { projectCapsuleSchema } from "../model/schemas";
import { ProjectCapsule } from "../model/types";
import { RepoPack } from "../packing/types";
import { capsuleCacheDir } from "./cache-paths";

const CACHE_SCHEMA_VERSION = 1;

const cacheEntrySchema = z.object({
  schemaVersion: z.literal(CACHE_SCHEMA_VERSION),
  cacheKey: z.string(),
  identity: z.unknown(),
  capsule: projectCapsuleSchema,
  createdAt: z.string(),
});

export type CapsuleCacheEvent = {
  repo: string;
  hit: boolean;
};

const cacheDisabled = () => process.env.REPO_INSIGHT_DISABLE_CACHE === "true";

const capsuleIdentity = (pack: RepoPack, model: string) => ({
  schemaVersion: CACHE_SCHEMA_VERSION,
  repo: pack.fullName,
  pushedAt: pack.pushedAt,
  defaultBranch: pack.defaultBranch,
  packer: pack.tool,
  compressed: pack.compressed,
  style: pack.style,
  maxPackBytes: pack.maxPackBytes,
  truncated: pack.stats.truncated,
  compactionModel: model,
  projectCapsuleSchemaVersion: 1,
});

export const capsuleCacheKey = (pack: RepoPack, model: string) =>
  createHash("sha256").update(JSON.stringify(capsuleIdentity(pack, model))).digest("hex");

const capsuleCachePath = (cacheKey: string) => path.join(capsuleCacheDir, `${cacheKey}.json`);

export const readCachedCapsule = async (
  pack: RepoPack,
  model: string,
): Promise<ProjectCapsule | undefined> => {
  if (cacheDisabled()) return undefined;

  const cacheKey = capsuleCacheKey(pack, model);
  try {
    const raw = await readFile(capsuleCachePath(cacheKey), "utf8");
    const entry = cacheEntrySchema.parse(JSON.parse(raw));
    if (entry.cacheKey !== cacheKey) return undefined;
    return entry.capsule;
  } catch {
    return undefined;
  }
};

export const writeCachedCapsule = async (
  pack: RepoPack,
  model: string,
  capsule: ProjectCapsule,
) => {
  if (cacheDisabled()) return;

  const cacheKey = capsuleCacheKey(pack, model);
  const entry = cacheEntrySchema.parse({
    schemaVersion: CACHE_SCHEMA_VERSION,
    cacheKey,
    identity: capsuleIdentity(pack, model),
    capsule,
    createdAt: new Date().toISOString(),
  });

  try {
    await mkdir(capsuleCacheDir, { recursive: true });
    await writeFile(capsuleCachePath(cacheKey), `${JSON.stringify(entry, null, 2)}\n`, "utf8");
  } catch {
    // Cache writes are best effort; insight generation should still complete.
  }
};
