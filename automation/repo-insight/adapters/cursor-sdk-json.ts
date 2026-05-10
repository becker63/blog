import { Agent, CursorAgentError } from "@cursor/sdk";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { z } from "zod";
import { repoRoot } from "../storage/paths";
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
    throw new Error("Unable to find ripgrep. Ensure `rg` is available in PATH or set CURSOR_RIPGREP_PATH.");
  }
};

const stringifyCompact = (value: unknown) => JSON.stringify(value, null, 2);

const truncate = (value: string, maxLength = REPAIR_CONTEXT_MAX_CHARS) =>
  value.length > maxLength ? `${value.slice(0, maxLength)}\n...[truncated]` : value;

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

export const summarizeCursorJsonShape = (value: unknown) => {
  if (!isRecord(value)) {
    return {
      topLevelType: Array.isArray(value) ? "array" : typeof value,
    };
  }

  const issue = value.issue;
  return {
    topLevelType: "object",
    topLevelKeys: Object.keys(value),
    issueKeys: isRecord(issue) ? Object.keys(issue) : undefined,
  };
};

const zodIssueSummary = (error: z.ZodError) =>
  error.issues.map((issue) => ({
    code: issue.code,
    path: issue.path,
    message: issue.message,
  }));

const logInvalidCursorJsonShape = (parsed: unknown, error: z.ZodError) => {
  console.error(
    `Invalid Cursor JSON shape:\nshape=${stringifyCompact(summarizeCursorJsonShape(parsed))}\nissues=${stringifyCompact(zodIssueSummary(error))}`,
  );
};

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
    "The required top-level shape is `kind` plus `issue` when `kind` is `insight`.",
    "For insight outputs, the `issue` object must match the expected GitHub issue draft shape.",
    "Do not include frontmatter.",
    "Do not include MDX sections.",
    "Do not flatten `issue`.",
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

const promptCursor = async ({ prompt, apiKey, model, name }: { prompt: string; apiKey: string; model: string; name: string }) => {
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

  return result.result;
};

export const runCursorJson = async <Schema extends z.ZodTypeAny>({
  prompt,
  schema,
  model = process.env.CURSOR_MODEL ?? "composer-2",
  name,
  expectedShape = "Return one JSON object matching the provided Zod schema.",
}: {
  prompt: string;
  schema: Schema;
  model?: string;
  name: string;
  expectedShape?: string;
}): Promise<z.infer<Schema>> => {
  const apiKey = process.env.CURSOR_API_KEY;
  if (!apiKey) throw new Error("CURSOR_API_KEY is required for Cursor SDK insight generation.");
  await configureCursorSdkRuntime();

  try {
    const parsed = parseModelJson(await promptCursor({ prompt, apiKey, model, name }));
    const validated = schema.safeParse(parsed);
    if (validated.success) return validated.data;

    logInvalidCursorJsonShape(parsed, validated.error);
    const originalIssues = zodIssueSummary(validated.error);
    const repairPrompt = buildRepairPrompt({
      parsed,
      issues: originalIssues,
      expectedShape,
    });
    const repairedParsed = parseModelJson(
      await promptCursor({
        prompt: repairPrompt,
        apiKey,
        model,
        name: `${name}-repair`,
      }),
    );
    const repaired = schema.safeParse(repairedParsed);
    if (repaired.success) return repaired.data;

    logInvalidCursorJsonShape(repairedParsed, repaired.error);
    throw new Error(
      [
        "Cursor JSON validation failed after one schema repair attempt.",
        `originalShape=${stringifyCompact(summarizeCursorJsonShape(parsed))}`,
        `originalIssues=${stringifyCompact(originalIssues)}`,
        `repairShape=${stringifyCompact(summarizeCursorJsonShape(repairedParsed))}`,
        `repairIssues=${stringifyCompact(zodIssueSummary(repaired.error))}`,
      ].join("\n"),
    );
  } catch (error) {
    if (error instanceof CursorAgentError) {
      throw new Error(`Cursor SDK startup failed: ${error.message}`);
    }
    throw error;
  }
};
