import { Agent, CursorAgentError } from "@cursor/sdk";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import { workspaceRoot } from "public-proof-core";
import { parseModelJson } from "./json-output";

const execFileAsync = promisify(execFile);
const REPAIR_CONTEXT_MAX_CHARS = 6000;

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
    throw new Error(
      "Unable to find ripgrep. Ensure `rg` is in PATH or set CURSOR_RIPGREP_PATH.",
    );
  }
};

const stringifyCompact = (value: unknown) => JSON.stringify(value, null, 2);
const truncate = (value: string, maxLength = REPAIR_CONTEXT_MAX_CHARS) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}\n...[truncated]` : value;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const summarizeCursorJsonShape = (value: unknown) => {
  if (!isRecord(value)) {
    return { topLevelType: Array.isArray(value) ? "array" : typeof value };
  }
  return { topLevelType: "object", topLevelKeys: Object.keys(value) };
};

const zodIssueSummary = (error: z.ZodError) =>
  error.issues.map((issue) => ({
    code: issue.code,
    path: issue.path,
    message: issue.message,
  }));

const buildRepairPrompt = ({
  parsed,
  issues,
  expectedShape,
}: {
  parsed: unknown;
  issues: unknown;
  expectedShape: string;
}) =>
  [
    "The previous response was invalid for the required schema.",
    "Fix only the JSON shape. Preserve the same semantic content.",
    "Return JSON only. Do not add markdown fences. Do not add prose.",
    "",
    "## Expected Shape",
    expectedShape,
    "",
    "## Zod Issues",
    stringifyCompact(issues),
    "",
    "## Previous Parsed JSON",
    truncate(stringifyCompact(parsed)),
  ].join("\n");

const promptCursor = async ({
  prompt,
  apiKey,
  model,
  name,
}: {
  prompt: string;
  apiKey: string;
  model: string;
  name: string;
}) => {
  const result = await Agent.prompt(prompt, {
    apiKey,
    model: { id: model },
    local: {
      cwd: process.env.CURSOR_WORKSPACE ?? workspaceRoot,
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
  return result.result;
};

export type UsageEstimate = {
  inputChars: number;
  outputChars: number;
  model: string;
  name: string;
};

/** Telemetry bridge for Drizzle-backed `agent_trace_*` persistence (dashboard). */
export type CursorJsonPhase =
  | { type: "initial_raw"; raw: string }
  | { type: "initial_parse_failed"; message: string; rawSnippet: string }
  | {
      type: "initial_validate_failed";
      parsed: unknown;
      issues: ReturnType<typeof zodIssueSummary>;
    }
  | { type: "repair_prompt"; prompt: string }
  | { type: "repair_raw"; raw: string }
  | { type: "repair_parse_failed"; message: string; rawSnippet: string }
  | {
      type: "repair_validate_failed";
      parsed: unknown;
      issues: ReturnType<typeof zodIssueSummary>;
    }
  | { type: "success"; validated: unknown }
  | { type: "error"; message: string };

export const runPublicProofAgentJson = async <Schema extends z.ZodTypeAny>({
  name,
  prompt,
  schema,
  expectedShape = "Return one JSON object matching the provided Zod schema.",
  model = process.env.CURSOR_MODEL ?? "composer-2",
  onUsageEstimate,
  promptFn = promptCursor,
  onPhase,
}: {
  name: string;
  prompt: string;
  schema: Schema;
  expectedShape?: string;
  model?: string;
  onUsageEstimate?: (usage: UsageEstimate) => void;
  promptFn?: typeof promptCursor;
  /** Optional async observer for trace persistence — must not mutate model output order. */
  onPhase?: (phase: CursorJsonPhase) => void | Promise<void>;
}): Promise<z.infer<Schema>> => {
  const emit = async (phase: CursorJsonPhase) => {
    if (onPhase) await onPhase(phase);
  };

  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) {
    await emit({ type: "error", message: "CURSOR_API_KEY is missing" });
    throw new Error("CURSOR_API_KEY is required for PublicProof Cursor Agent tasks.");
  }
  await configureCursorSdkRuntime();

  try {
    const raw = await promptFn({ prompt, apiKey, model, name });
    onUsageEstimate?.({ inputChars: prompt.length, outputChars: raw.length, model, name });
    await emit({ type: "initial_raw", raw });

    let parsed: unknown;
    try {
      parsed = parseModelJson(raw);
    } catch (error) {
      const message = (error as Error).message ?? String(error);
      await emit({ type: "initial_parse_failed", message, rawSnippet: raw.slice(0, 4000) });
      throw error;
    }

    let validated = schema.safeParse(parsed);
    if (validated.success) {
      await emit({ type: "success", validated: validated.data });
      return validated.data;
    }

    await emit({
      type: "initial_validate_failed",
      parsed,
      issues: zodIssueSummary(validated.error),
    });

    const originalIssues = zodIssueSummary(validated.error);
    const repairPrompt = buildRepairPrompt({ parsed, issues: originalIssues, expectedShape });
    await emit({ type: "repair_prompt", prompt: repairPrompt });

    const repairRaw = await promptFn({
      prompt: repairPrompt,
      apiKey,
      model,
      name: `${name}-repair`,
    });
    onUsageEstimate?.({
      inputChars: repairPrompt.length,
      outputChars: repairRaw.length,
      model,
      name: `${name}-repair`,
    });
    await emit({ type: "repair_raw", raw: repairRaw });

    let repairedParsed: unknown;
    try {
      repairedParsed = parseModelJson(repairRaw);
    } catch (error) {
      const message = (error as Error).message ?? String(error);
      await emit({ type: "repair_parse_failed", message, rawSnippet: repairRaw.slice(0, 4000) });
      throw error;
    }

    const repaired = schema.safeParse(repairedParsed);
    if (repaired.success) {
      await emit({ type: "success", validated: repaired.data });
      return repaired.data;
    }

    await emit({
      type: "repair_validate_failed",
      parsed: repairedParsed,
      issues: zodIssueSummary(repaired.error),
    });

    throw new Error(
      [
        "PublicProof Cursor JSON validation failed after one schema repair attempt.",
        `originalIssues=${stringifyCompact(originalIssues)}`,
        `repairIssues=${stringifyCompact(zodIssueSummary(repaired.error))}`,
      ].join("\n"),
    );
  } catch (error) {
    if (error instanceof CursorAgentError) {
      const wrapped = `Cursor SDK startup failed: ${error.message}`;
      await emit({ type: "error", message: wrapped });
      throw new Error(wrapped);
    }
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as Error).message)
        : String(error);
    await emit({ type: "error", message });
    throw error;
  }
};

/** Test helper: validate + repair without calling Cursor API */
export const validateWithRepair = async <Schema extends z.ZodTypeAny>({
  schema,
  expectedShape,
  initialRaw,
  repairRaw,
}: {
  schema: Schema;
  expectedShape: string;
  initialRaw: string;
  repairRaw?: string;
}): Promise<z.infer<Schema>> => {
  const parsed = parseModelJson(initialRaw);
  const validated = schema.safeParse(parsed);
  if (validated.success) return validated.data;
  if (!repairRaw) {
    throw new Error(`Validation failed: ${stringifyCompact(zodIssueSummary(validated.error))}`);
  }
  const repairedParsed = parseModelJson(repairRaw);
  const repaired = schema.safeParse(repairedParsed);
  if (repaired.success) return repaired.data;
  throw new Error("Repair validation failed");
};
