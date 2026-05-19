import { z } from "zod";
import {
  finalizeAgentTraceRun,
  insertAgentTraceArtifact,
  insertAgentTraceEvent,
  insertAgentTraceRun,
} from "public-proof-db";
import { getPublicProofDb } from "public-proof-db";
import type { CursorJsonPhase, UsageEstimate } from "./cursor-json";
import { runPublicProofAgentJson, summarizeCursorJsonShape } from "./cursor-json";

const charsToTokensApprox = (n: number) => Math.max(0, Math.ceil(n / 4));

/** Cursor JSON runner with Drizzle-backed `agent_trace_*` persistence (graceful degrade without Postgres). */
export const runPublicProofAgentJsonTraced = async <
  Schema extends z.ZodTypeAny,
>(opts: {
  /** Persisted FK to `launches.id` (UUID). */
  launchId?: string | null;
  taskName: string;
  prompt: string;
  schema: Schema;
  expectedShape?: string;
  model?: string;
  /** Mirrors {@link runPublicProofAgentJson} — invoked for the initial completion and repair (if any). */
  onUsageEstimate?: (usage: UsageEstimate) => void;
}): Promise<z.infer<Schema>> => {
  let db;
  try {
    db = getPublicProofDb();
  } catch {
    return runPublicProofAgentJson({
      name: opts.taskName,
      prompt: opts.prompt,
      schema: opts.schema,
      expectedShape: opts.expectedShape,
      model: opts.model,
      onUsageEstimate: opts.onUsageEstimate,
    });
  }

  const model = opts.model ?? process.env.CURSOR_MODEL ?? "composer-2";
  let inputChars = opts.prompt.length;
  let outputChars = 0;
  let seq = 0;
  const bumpSeq = () => {
    seq += 1;
    return seq;
  };

  const traceRunId = await insertAgentTraceRun(db, {
    launchId: opts.launchId ?? null,
    taskName: opts.taskName,
    provider: "cursor-agent-sdk",
    model,
    status: "started",
    inputSummary: `task=${opts.taskName} (${opts.prompt.slice(0, 240)})`,
    outputSummary: null,
    estimatedInputTokens: charsToTokensApprox(inputChars),
    estimatedOutputTokens: null,
    startedAt: new Date(),
    completedAt: null,
    error: null,
  });

  await insertAgentTraceEvent(db, traceRunId, bumpSeq(), "input", {
    taskName: opts.taskName,
    launchId: opts.launchId ?? null,
  });

  await insertAgentTraceArtifact(db, traceRunId, "prompt", opts.prompt, "text/plain");

  const persistPhase = async (phase: CursorJsonPhase) => {
    switch (phase.type) {
      case "initial_raw":
        outputChars += phase.raw.length;
        await insertAgentTraceArtifact(db, traceRunId, "raw_output", phase.raw, "text/plain");
        await insertAgentTraceEvent(db, traceRunId, bumpSeq(), "model_output", {
          phase: "initial",
        });
        break;
      case "repair_prompt":
        inputChars += phase.prompt.length;
        await insertAgentTraceArtifact(db, traceRunId, "repair_prompt", phase.prompt, "text/plain");
        await insertAgentTraceEvent(db, traceRunId, bumpSeq(), "repair_attempt", {
          kind: "repair_prompt",
        });
        break;
      case "repair_raw":
        outputChars += phase.raw.length;
        await insertAgentTraceArtifact(db, traceRunId, "repair_raw_output", phase.raw, "text/plain");
        await insertAgentTraceEvent(db, traceRunId, bumpSeq(), "model_output", { phase: "repair" });
        break;
      case "initial_validate_failed":
        await insertAgentTraceEvent(db, traceRunId, bumpSeq(), "schema_validation", {
          phase: "initial",
          issues: phase.issues,
        });
        break;
      case "repair_validate_failed":
        await insertAgentTraceEvent(db, traceRunId, bumpSeq(), "schema_validation", {
          phase: "repair",
          issues: phase.issues,
        });
        break;
      case "success":
        await insertAgentTraceArtifact(
          db,
          traceRunId,
          "validated_output",
          JSON.stringify(phase.validated),
          "application/json",
        );
        await insertAgentTraceEvent(db, traceRunId, bumpSeq(), "final_output", {
          summary: JSON.stringify(summarizeCursorJsonShape(phase.validated)),
        });
        break;
      case "initial_parse_failed":
      case "repair_parse_failed":
        await insertAgentTraceEvent(db, traceRunId, bumpSeq(), "error", { message: phase.message });
        break;
      case "error":
        await insertAgentTraceEvent(db, traceRunId, bumpSeq(), "error", { message: phase.message });
        break;
      default:
        break;
    }
  };

  try {
    const result = await runPublicProofAgentJson({
      name: opts.taskName,
      prompt: opts.prompt,
      schema: opts.schema,
      expectedShape: opts.expectedShape,
      model,
      onUsageEstimate: opts.onUsageEstimate,
      onPhase: persistPhase,
    });
    await finalizeAgentTraceRun(db, traceRunId, {
      status: "completed",
      outputSummary: JSON.stringify(summarizeCursorJsonShape(result)),
      estimatedInputTokens: charsToTokensApprox(inputChars),
      estimatedOutputTokens: charsToTokensApprox(outputChars),
    });
    return result;
  } catch (error) {
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? String((error as Error).message)
        : String(error);
    await finalizeAgentTraceRun(db, traceRunId, {
      status: "failed",
      error: message,
      estimatedInputTokens: charsToTokensApprox(inputChars),
      estimatedOutputTokens: charsToTokensApprox(outputChars),
    });
    throw error;
  }
};
