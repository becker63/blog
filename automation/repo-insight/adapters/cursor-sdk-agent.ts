import { curatorDecisionSchema, forcedInsightDecisionSchema } from "../model/schemas";
import { CuratorDecision, CuratorInput } from "../model/types";
import { buildInsightPrompt } from "../prompting/build-insight-prompt";
import { AgentBackend } from "./agent";
import { runCursorJson } from "./cursor-sdk-json";

export type CursorSdkAgentOptions = {
  apiKey?: string;
  model?: string;
  cwd?: string;
};

export class CursorSdkAgentBackend implements AgentBackend {
  name = "cursor-sdk";

  constructor(private readonly options: CursorSdkAgentOptions = {}) {}

  async generateInsight(input: CuratorInput): Promise<CuratorDecision> {
    return runCursorJson({
      prompt: buildInsightPrompt(input),
      schema: input.mode === "force" ? forcedInsightDecisionSchema : curatorDecisionSchema,
      model: this.options.model ?? process.env.CURSOR_MODEL ?? "composer-2",
      name: `repo-insight-${input.runId}`,
    });
  }
}
