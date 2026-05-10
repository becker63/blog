import { Agent, CursorAgentError } from "@cursor/sdk";
import { z } from "zod";
import { repoRoot } from "../storage/paths";
import { parseModelJson } from "./json-output";

export const runCursorJson = async <Schema extends z.ZodTypeAny>({
  prompt,
  schema,
  model = process.env.CURSOR_MODEL ?? "composer-2",
  name,
}: {
  prompt: string;
  schema: Schema;
  model?: string;
  name: string;
}): Promise<z.infer<Schema>> => {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) throw new Error("CURSOR_API_KEY is required for Cursor SDK insight generation.");

  try {
    const result = await Agent.prompt(prompt, {
      apiKey,
      model: { id: model },
      local: {
        cwd: process.env.CURSOR_WORKSPACE ?? repoRoot,
        settingSources: [],
      },
      name,
    });

    if (result.status !== "finished") {
      throw new Error(`Cursor SDK run ${result.id} ended with status ${result.status}.`);
    }
    if (!result.result?.trim()) {
      throw new Error(`Cursor SDK run ${result.id} finished without assistant output.`);
    }

    return schema.parse(parseModelJson(result.result));
  } catch (error) {
    if (error instanceof CursorAgentError) {
      throw new Error(`Cursor SDK startup failed: ${error.message}`);
    }
    throw error;
  }
};
