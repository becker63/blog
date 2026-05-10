import { projectCapsuleSchema } from "../model/schemas";
import { ProjectCapsule } from "../model/types";
import { runCursorJson } from "../adapters/cursor-sdk-json";
import { buildCompactionPrompt } from "../prompting/build-compaction-prompt";
import { RepoPack } from "./types";

export const compactPacks = async (packs: RepoPack[]): Promise<ProjectCapsule[]> => {
  const capsules: ProjectCapsule[] = [];
  const model = process.env.CURSOR_COMPACTION_MODEL ?? process.env.CURSOR_MODEL ?? "composer-2";

  for (const pack of packs) {
    capsules.push(
      await runCursorJson({
        prompt: buildCompactionPrompt(pack),
        schema: projectCapsuleSchema,
        model,
        name: `repo-insight-compact-${pack.fullName.replace("/", "-")}`,
      }),
    );
  }

  return capsules;
};
