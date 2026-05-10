import { Agent, CursorAgentError } from "@cursor/sdk";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import { repoRoot } from "../storage/paths";
import { parseModelJson } from "./json-output";

const execFileAsync = promisify(execFile);

let cursorSdkRuntimeConfigured = false;

export const configureCursorSdkRuntime = async () => {
  if (cursorSdkRuntimeConfigured) return;

  const configuredPath = process.env.CURSOR_RIPGREP_PATH;
  if (configuredPath) {
    cursorSdkRuntimeConfigured = true;
    return;
  }

  try {
    const { stdout } = await execFileAsync("sh", ["-lc", "command -v rg"]);
    const rgPath = stdout.trim();
    if (!rgPath) throw new Error("empty path returned");
    process.env.CURSOR_RIPGREP_PATH = rgPath;
    cursorSdkRuntimeConfigured = true;
  } catch {
    throw new Error("Unable to find ripgrep. Ensure `rg` is available in PATH or set CURSOR_RIPGREP_PATH.");
  }
};

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
  await configureCursorSdkRuntime();

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
