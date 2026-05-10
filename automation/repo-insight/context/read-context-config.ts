import { constants } from "node:fs";
import { access, readFile, readdir } from "node:fs/promises";
import path from "node:path";
import { repoInsightContextConfigSchema } from "../model/schemas";
import { RepoInsightContextConfig } from "../model/types";
import { repoInsightContextPath, repoRoot, relativeToRoot } from "../storage/paths";

export type ContextSourceText = {
  name: string;
  path: string;
  text: string;
};

const allowedExtensions = new Set([".md", ".mdx", ".yml", ".yaml", ".json", ".txt"]);

const blockedPathParts = new Set(["output", "reports", "jds", "logs", "data"]);

const isAllowedTextPath = (filePath: string) => allowedExtensions.has(path.extname(filePath).toLowerCase());

const isBlockedContextPath = (filePath: string) => {
  const normalized = filePath.split(path.sep);
  if (normalized.some((part) => blockedPathParts.has(part))) return true;
  const lower = filePath.toLowerCase();
  return lower.endsWith(".pdf") || lower.endsWith(".html") || lower.endsWith(".htm");
};

const exists = async (filePath: string) => {
  try {
    await access(filePath, constants.R_OK);
    return true;
  } catch {
    return false;
  }
};

export const readContextConfig = async (): Promise<RepoInsightContextConfig> => {
  try {
    return repoInsightContextConfigSchema.parse(JSON.parse(await readFile(repoInsightContextPath, "utf8")));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") {
      console.warn(`repo-insight context config missing at ${relativeToRoot(repoInsightContextPath)}; using empty context.`);
      return repoInsightContextConfigSchema.parse({});
    }
    throw error;
  }
};

export const resolveContextPath = (configuredPath: string) => path.resolve(repoRoot, configuredPath);

export const sanitizeContextText = (text: string) =>
  text
    .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, "[redacted-email]")
    .replace(/(?:\+?1[-.\s]?)?(?:\(?\d{3}\)?[-.\s]?)\d{3}[-.\s]?\d{4}/g, "[redacted-phone]");

export const readConfiguredTextFile = async (name: string, configuredPath: string): Promise<ContextSourceText | undefined> => {
  const filePath = resolveContextPath(configuredPath);
  if (isBlockedContextPath(filePath) || !isAllowedTextPath(filePath)) {
    console.warn(`Skipping unsafe repo-insight context file ${configuredPath}`);
    return undefined;
  }
  if (!(await exists(filePath))) {
    console.warn(`Missing repo-insight context file ${configuredPath}; skipping.`);
    return undefined;
  }
  return {
    name,
    path: configuredPath,
    text: await readFile(filePath, "utf8"),
  };
};

const includeMatches = (filename: string, includes: string[]) =>
  includes.some((pattern) => {
    if (pattern === filename) return true;
    if (pattern.startsWith("*")) return filename.endsWith(pattern.slice(1));
    return false;
  });

export const readConfiguredTextRoot = async ({
  name,
  configuredPath,
  includes,
}: {
  name: string;
  configuredPath: string;
  includes: string[];
}): Promise<ContextSourceText[]> => {
  const rootPath = resolveContextPath(configuredPath);
  if (isBlockedContextPath(rootPath)) {
    console.warn(`Skipping unsafe repo-insight context root ${configuredPath}`);
    return [];
  }
  if (!(await exists(rootPath))) {
    console.warn(`Missing repo-insight context root ${configuredPath}; skipping.`);
    return [];
  }

  const entries = await readdir(rootPath, { withFileTypes: true });
  const sources: ContextSourceText[] = [];
  for (const entry of entries) {
    if (!entry.isFile() || !includeMatches(entry.name, includes)) continue;
    const filePath = path.join(rootPath, entry.name);
    if (isBlockedContextPath(filePath) || !isAllowedTextPath(filePath)) continue;
    sources.push({
      name: `${name}:${entry.name}`,
      path: path.posix.join(configuredPath, entry.name),
      text: await readFile(filePath, "utf8"),
    });
  }
  return sources;
};
