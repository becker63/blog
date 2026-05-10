import { AuthorProfileCapsule, InsightSeed, WritingCorpusCapsule } from "../model/types";

export type AggregatePromptInput = {
  generatedAt: string;
  seeds: InsightSeed[];
  tasteProfile: string;
  writingCorpus: WritingCorpusCapsule;
  authorProfile: AuthorProfileCapsule;
};
