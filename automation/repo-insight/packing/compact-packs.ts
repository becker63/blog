import { projectCapsuleSchema } from "../model/schemas";
import { ProjectCapsule } from "../model/types";
import { runCursorJson } from "../adapters/cursor-sdk-json";
import { buildCompactionPrompt } from "../prompting/build-compaction-prompt";
import { RepoPack } from "./types";
import { CapsuleCacheEvent, readCachedCapsule, writeCachedCapsule } from "../cache/capsule-cache";

export type CompactPacksResult = {
  capsules: ProjectCapsule[];
  cacheEvents: CapsuleCacheEvent[];
  skippedRepos: string[];
};

export type CursorUsageEstimateEvent = {
  inputChars: number;
  outputChars: number;
  model: string;
  name: string;
};

export const compactPacks = async (
  packs: RepoPack[],
  options: {
    maxNewCompactions?: number;
    onUsageEstimate?: (event: CursorUsageEstimateEvent) => void;
  } = {},
): Promise<CompactPacksResult> => {
  const capsules: ProjectCapsule[] = [];
  const cacheEvents: CapsuleCacheEvent[] = [];
  const skippedRepos: string[] = [];
  let newCompactions = 0;
  const model = process.env.CURSOR_COMPACTION_MODEL ?? process.env.CURSOR_MODEL ?? "composer-2";

  for (const pack of packs) {
    const cached = await readCachedCapsule(pack, model);
    if (cached) {
      capsules.push(cached);
      cacheEvents.push({ repo: pack.fullName, hit: true });
      continue;
    }

    if (options.maxNewCompactions !== undefined && newCompactions >= options.maxNewCompactions) {
      skippedRepos.push(pack.fullName);
      cacheEvents.push({ repo: pack.fullName, hit: false, skipped: true });
      continue;
    }

    newCompactions += 1;
    const capsule = await runCursorJson({
      prompt: buildCompactionPrompt(pack),
      schema: projectCapsuleSchema,
      model,
      name: `repo-insight-compact-${pack.fullName.replace("/", "-")}`,
      onUsageEstimate: options.onUsageEstimate,
    });
    capsules.push(capsule);
    cacheEvents.push({ repo: pack.fullName, hit: false });
    await writeCachedCapsule(pack, model, capsule);
  }

  return { capsules, cacheEvents, skippedRepos };
};
