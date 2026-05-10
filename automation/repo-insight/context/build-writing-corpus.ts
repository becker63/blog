import { createHash } from "node:crypto";
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { contextCacheDir } from "../cache/cache-paths";
import { writingCorpusCapsuleSchema } from "../model/schemas";
import { WritingCorpusCapsule } from "../model/types";
import { repoRoot, relativeToRoot, tasteProfilePath } from "../storage/paths";
import {
  ContextSourceText,
  readConfiguredTextRoot,
  readContextConfig,
  sanitizeContextText,
} from "./read-context-config";

const CONTEXT_SCHEMA_VERSION = 1;
const MODEL_NAME = process.env.REPO_INSIGHT_CONTEXT_MODEL ?? "deterministic-context-v1";

const cacheEntrySchema = z.object({
  schemaVersion: z.literal(CONTEXT_SCHEMA_VERSION),
  cacheKey: z.string(),
  identity: z.unknown(),
  capsule: writingCorpusCapsuleSchema,
  createdAt: z.string(),
});

export type ContextBuildResult<Capsule> = {
  capsule: Capsule;
  sourceCount: number;
  cacheHit: boolean;
};

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const uniq = (items: string[]) => [...new Set(items.map((item) => item.trim()).filter(Boolean))];

const readIfPresent = async (name: string, filePath: string): Promise<ContextSourceText | undefined> => {
  try {
    return {
      name,
      path: relativeToRoot(filePath),
      text: await readFile(filePath, "utf8"),
    };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return undefined;
    throw error;
  }
};

const readLocalBlogSources = async () => {
  const sources: ContextSourceText[] = [];
  const postsDir = path.join(repoRoot, "content", "posts");
  try {
    const entries = await readdir(postsDir, { withFileTypes: true });
    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".mdx")) continue;
      const filePath = path.join(postsDir, entry.name);
      sources.push({
        name: `blog-post:${entry.name}`,
        path: relativeToRoot(filePath),
        text: await readFile(filePath, "utf8"),
      });
    }
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== "ENOENT") throw error;
  }

  const tasteProfile = await readIfPresent("taste-profile", tasteProfilePath);
  if (tasteProfile) sources.push(tasteProfile);
  return sources;
};

const extractTitle = (text: string, fallback: string) => {
  const frontmatterTitle = text.match(/^title:\s*["']?(.+?)["']?\s*$/m)?.[1];
  if (frontmatterTitle) return frontmatterTitle.trim();
  const heading = text.match(/^#\s+(.+)$/m)?.[1];
  return heading?.trim() ?? fallback;
};

const excerpt = (text: string) =>
  text
    .replace(/^---[\s\S]*?---/m, "")
    .split(/\n{2,}/)
    .map((part) => part.replace(/\s+/g, " ").trim())
    .find((part) => part.length > 80)
    ?.slice(0, 220) ?? "Representative writing sample.";

const includesAny = (haystack: string, needles: string[]) => needles.some((needle) => haystack.includes(needle));

const buildCapsule = (sources: ContextSourceText[]): WritingCorpusCapsule => {
  const text = sources.map((source) => sanitizeContextText(source.text)).join("\n\n").toLowerCase();
  const existingPostMap = sources
    .filter((source) => source.path.endsWith(".mdx"))
    .map((source) => ({
      title: extractTitle(source.text, source.name),
      path: source.path,
      summary: excerpt(sanitizeContextText(source.text)),
    }))
    .slice(0, 12);

  const recurringThemes = uniq([
    "legibility and inspectable systems",
    "reproducibility as a property of technical work",
    "semantic authority across system boundaries",
    "typed interfaces and static intent",
    "infrastructure as a coordination problem",
    "systems where human intent becomes config, runtime behavior, evidence, and release decisions",
    ...(includesAny(text, ["release report", "release reports"]) ? ["release reports, not just traces"] : []),
    ...(includesAny(text, ["eval bundle", "eval bundles", "baseline", "candidate"]) ? ["AI eval bundles with baseline/candidate comparisons"] : []),
    ...(includesAny(text, ["control plane", "control-plane"]) ? ["control-plane thinking"] : []),
    ...(includesAny(text, ["less power", "more understanding"]) ? ["less power, more understanding"] : []),
  ]);

  return writingCorpusCapsuleSchema.parse({
    sourceNames: sources.map((source) => source.name),
    recurringThemes,
    strongClaims: [
      "Prefer claims grounded in concrete system behavior, reproducible evidence, and implementation tradeoffs.",
      "A strong generated seed should reveal a hidden structure in technical work rather than summarize activity.",
      "AI evals and release evidence matter when they turn traces into decisions.",
      "Infrastructure writing is strongest when it shows where authority and evidence move between phases.",
    ],
    favoriteConcepts: uniq([
      "release evidence",
      "eval bundles",
      "baseline/candidate comparisons",
      "promotion decisions",
      "inspectable systems",
      "static intent vs dynamic runtime",
      "semantic authority",
      "control planes",
      "phase boundaries",
      "typed/testable interfaces",
    ]),
    voiceNotes: [
      "Direct, technical, reflective, and skeptical of vague platform language.",
      "Essay seeds should be cerebral and grounded, not polished marketing copy.",
      "Prefer one conceptual thesis over a broad changelog summary.",
    ],
    existingPostMap,
    overusedIdeasToAvoid: [
      "generic changelog summaries",
      "local plumbing observations without a larger thesis",
      "resume-flavored self-promotion",
      "overclaiming from truncated packs",
    ],
    openThreads: [
      "how human intent becomes configuration, runtime behavior, evidence, and release decisions",
      "how eval evidence becomes trustworthy enough for promotion decisions",
      "how semantic authority moves between declarative interfaces and executable systems",
    ],
    representativeHooks: [
      "What looks like plumbing is often a boundary where intent becomes evidence.",
      "The issue is the interface between a system and the people deciding whether to trust it.",
      "The interesting part is not that a tool changed, but that it made a hidden decision boundary inspectable.",
    ],
  });
};

export const buildWritingCorpus = async (): Promise<ContextBuildResult<WritingCorpusCapsule>> => {
  const config = await readContextConfig();
  const externalSources = (
    await Promise.all(
      config.externalWritingRoots
        .filter((root) => root.enabled)
        .map((root) =>
          readConfiguredTextRoot({
            name: root.name,
            configuredPath: root.path,
            includes: root.include,
          }),
        ),
    )
  ).flat();
  const sources = [...(await readLocalBlogSources()), ...externalSources];
  const normalizedSources = sources.map((source) => ({
    ...source,
    text: sanitizeContextText(source.text),
  }));
  const identity = {
    schemaVersion: CONTEXT_SCHEMA_VERSION,
    modelName: MODEL_NAME,
    sources: normalizedSources.map((source) => ({
      name: source.name,
      path: source.path,
      sha256: sha256(source.text),
    })),
  };
  const cacheKey = sha256(JSON.stringify(identity));
  const cachePath = path.join(contextCacheDir, `writing-corpus-${cacheKey}.json`);

  try {
    const entry = cacheEntrySchema.parse(JSON.parse(await readFile(cachePath, "utf8")));
    if (entry.cacheKey === cacheKey) {
      return { capsule: entry.capsule, sourceCount: normalizedSources.length, cacheHit: true };
    }
  } catch {
    // Bad or missing cache entries are regenerated below.
  }

  const capsule = buildCapsule(normalizedSources);
  await mkdir(contextCacheDir, { recursive: true });
  await writeFile(
    cachePath,
    `${JSON.stringify({ schemaVersion: CONTEXT_SCHEMA_VERSION, cacheKey, identity, capsule, createdAt: new Date().toISOString() }, null, 2)}\n`,
    "utf8",
  );
  return { capsule, sourceCount: normalizedSources.length, cacheHit: false };
};
