import { DispatchPayload, PackStats, RepoCatalogEntry } from "../model/types";

export type AccessibleRepo = {
  fullName: string;
  owner: string;
  name: string;
  defaultBranch: string;
  pushedAt: string;
  archived: boolean;
  fork: boolean;
  private: boolean;
  htmlUrl?: string;
  overlay?: RepoCatalogEntry;
};

export type RepoPack = {
  fullName: string;
  pushedAt: string;
  defaultBranch: string;
  source: "github" | "local";
  safeToQuote: boolean;
  tool: "repomix";
  style: string;
  compressed: boolean;
  stats: PackStats;
  packedText: string;
};

export type GenerateInsightInput = {
  trigger: DispatchPayload;
  force: boolean;
};
