import { curatorDecisionSchema } from "../model/schemas";
import { CuratorDecision, CuratorInput } from "../model/types";
import { buildInsightPrompt } from "../prompting/build-insight-prompt";
import { AgentBackend } from "./agent";
import { parseModelJson } from "./json-output";
import { cursorCliCommand, runSubprocess } from "./subprocess";

export class CursorCliAgentBackend implements AgentBackend {
  name = "cursor-cli";

  constructor(
    private readonly command = cursorCliCommand().command,
    private readonly args = cursorCliCommand().args,
  ) {}

  async generateInsight(input: CuratorInput): Promise<CuratorDecision> {
    const prompt = buildInsightPrompt(input);
    const output = await runSubprocess(this.command, this.args, prompt);
    return curatorDecisionSchema.parse(parseModelJson(output));
  }
}
