import { CuratorDecision, CuratorInput } from "../model/types";

export type AgentBackend = {
  name: string;
  generateInsight(input: CuratorInput): Promise<CuratorDecision>;
};
