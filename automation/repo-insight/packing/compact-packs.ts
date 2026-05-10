import { projectCapsuleSchema } from "../model/schemas";
import { ProjectCapsule } from "../model/types";
import { runCursorJson } from "../adapters/cursor-sdk-json";
import { buildCompactionPrompt } from "../prompting/build-compaction-prompt";
import { RepoPack } from "./types";
import { CapsuleCacheEvent, readCachedCapsule, writeCachedCapsule } from "../cache/capsule-cache";

export type CompactPacksResult = {
  capsules: ProjectCapsule[];
  cacheEvents: CapsuleCacheEvent[];
};

export const compactPacks = async (packs: RepoPack[]): Promise<CompactPacksResult> => {
  const capsules: ProjectCapsule[] = [];
  const cacheEvents: CapsuleCacheEvent[] = [];
  const model = process.env.CURSOR_COMPACTION_MODEL ?? process.env.CURSOR_MODEL ?? "composer-2";

  for (const pack of packs) {
    const cached = await readCachedCapsule(pack, model);
    if (cached) {
      capsules.push(cached);
      cacheEvents.push({ repo: pack.fullName, hit: true });
      continue;
    }

    const capsule = await runCursorJson({
      prompt: buildCompactionPrompt(pack),
      schema: projectCapsuleSchema,
      model,
      name: `repo-insight-compact-${pack.fullName.replace("/", "-")}`,
    });
    capsules.push(capsule);
    cacheEvents.push({ repo: pack.fullName, hit: false });
    await writeCachedCapsule(pack, model, capsule);
  }

  return { capsules, cacheEvents };
};
