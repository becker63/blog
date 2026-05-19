import { asc, desc, eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import * as schema from "../schema";

export type FinishTracePayload = {
  status: "completed" | "failed";
  outputSummary?: string | null;
  estimatedInputTokens?: number | null;
  estimatedOutputTokens?: number | null;
  error?: string | null;
};

export async function insertAgentTraceRun(
  db: NeonHttpDatabase<typeof schema>,
  input: Omit<typeof schema.agentTraceRuns.$inferInsert, "id" | "createdAt">,
) {
  const [row] = await db.insert(schema.agentTraceRuns).values(input).returning({
    id: schema.agentTraceRuns.id,
  });
  return row!.id as string;
}

export async function insertAgentTraceEvent(
  db: NeonHttpDatabase<typeof schema>,
  traceRunId: string,
  sequence: number,
  eventType: string,
  payloadJson?: Record<string, unknown> | unknown[] | null,
) {
  await db.insert(schema.agentTraceEvents).values({
    traceRunId,
    sequence,
    eventType,
    payloadJson: payloadJson ?? null,
    createdAt: new Date(),
  });
}

/** Large prompts are truncated defensively — full audit belongs in external secret-safe storage later. */
const MAX_ARTIFACT_CHARS = 200_000;

export async function insertAgentTraceArtifact(
  db: NeonHttpDatabase<typeof schema>,
  traceRunId: string,
  artifactKind: string,
  content: string | null,
  contentType: string,
) {
  const safe =
    typeof content === "string" && content.length > MAX_ARTIFACT_CHARS
      ? `${content.slice(0, MAX_ARTIFACT_CHARS)}\n...[truncated]`
      : content;
  await db.insert(schema.agentTraceArtifacts).values({
    traceRunId,
    artifactKind,
    content: safe ?? null,
    contentType,
    createdAt: new Date(),
  });
}

export async function finalizeAgentTraceRun(
  db: NeonHttpDatabase<typeof schema>,
  traceRunId: string,
  finish: FinishTracePayload,
) {
  await db
    .update(schema.agentTraceRuns)
    .set({
      status: finish.status,
      outputSummary: finish.outputSummary ?? null,
      estimatedInputTokens: finish.estimatedInputTokens ?? null,
      estimatedOutputTokens: finish.estimatedOutputTokens ?? null,
      error: finish.error ?? null,
      completedAt: new Date(),
    })
    .where(eq(schema.agentTraceRuns.id, traceRunId));
}

export async function listAgentTracesForLaunch(
  db: NeonHttpDatabase<typeof schema>,
  launchUuid: string,
  limit = 50,
): Promise<Array<typeof schema.agentTraceRuns.$inferSelect>> {
  return db
    .select()
    .from(schema.agentTraceRuns)
    .where(eq(schema.agentTraceRuns.launchId, launchUuid))
    .orderBy(desc(schema.agentTraceRuns.startedAt))
    .limit(limit);
}

export async function getAgentTraceRun(
  db: NeonHttpDatabase<typeof schema>,
  traceRunId: string,
): Promise<typeof schema.agentTraceRuns.$inferSelect | undefined> {
  const [row] = await db.select().from(schema.agentTraceRuns).where(eq(schema.agentTraceRuns.id, traceRunId)).limit(1);
  return row;
}

export async function listAgentTraceEvents(
  db: NeonHttpDatabase<typeof schema>,
  traceRunId: string,
): Promise<Array<typeof schema.agentTraceEvents.$inferSelect>> {
  return db
    .select()
    .from(schema.agentTraceEvents)
    .where(eq(schema.agentTraceEvents.traceRunId, traceRunId))
    .orderBy(asc(schema.agentTraceEvents.sequence), asc(schema.agentTraceEvents.createdAt));
}

export async function listAgentTraceArtifacts(
  db: NeonHttpDatabase<typeof schema>,
  traceRunId: string,
): Promise<Array<typeof schema.agentTraceArtifacts.$inferSelect>> {
  return db
    .select()
    .from(schema.agentTraceArtifacts)
    .where(eq(schema.agentTraceArtifacts.traceRunId, traceRunId))
    .orderBy(asc(schema.agentTraceArtifacts.createdAt));
}
