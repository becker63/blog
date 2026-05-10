import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { contextCacheDir } from "../cache/cache-paths";
import { authorProfileCapsuleSchema } from "../model/schemas";
import { AuthorProfileCapsule } from "../model/types";
import {
  readConfiguredTextFile,
  readContextConfig,
  sanitizeContextText,
} from "./read-context-config";
import { ContextBuildResult } from "./build-writing-corpus";

const CONTEXT_SCHEMA_VERSION = 1;
const MODEL_NAME = process.env.REPO_INSIGHT_CONTEXT_MODEL ?? "deterministic-context-v1";

const cacheEntrySchema = z.object({
  schemaVersion: z.literal(CONTEXT_SCHEMA_VERSION),
  cacheKey: z.string(),
  identity: z.unknown(),
  capsule: authorProfileCapsuleSchema,
  createdAt: z.string(),
});

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const uniq = (items: string[]) => [...new Set(items.map((item) => item.trim()).filter(Boolean))];

const includesAny = (haystack: string, needles: string[]) => needles.some((needle) => haystack.includes(needle));

const buildCapsule = (sources: Array<{ name: string; path: string; text: string }>): AuthorProfileCapsule => {
  const text = sources.map((source) => sanitizeContextText(source.text)).join("\n\n").toLowerCase();

  return authorProfileCapsuleSchema.parse({
    sourceNames: sources.map((source) => source.name),
    publicPositioning: uniq([
      "Taylor Johnson",
      "Infrastructure/platform engineer",
      "Systems translator / phase-boundary engineer",
      "Makes opaque systems legible, reproducible, and safer to operate",
      "Moves uncertainty out of people's heads into inspectable artifacts",
      ...(includesAny(text, ["instructor", "teaching"]) ? ["Engineer-instructor who turns systems understanding into teachable artifacts"] : []),
    ]),
    targetLanes: [
      "platform",
      "infrastructure",
      "security",
      "AI evals",
      "AI platform",
      "developer tooling",
      "technical solutions/FDE",
    ],
    proofPoints: [
      "SearchBench as AI eval/release-report proof point",
      "Static Control Plane as typed infrastructure proof point",
      "OSC as reproduction/auth/proxy-boundary tracing proof point",
      "libnftnl fuzzer as systems/security proof point",
      "Tarigma as operator tooling/frontend systems proof point",
      "Technical writing platform as communication proof point",
    ],
    recurringStrengths: [
      "translating opaque runtime behavior into inspectable artifacts",
      "building typed/testable interfaces around ambiguous operational work",
      "connecting implementation details to release, promotion, or trust decisions",
      "finding phase boundaries where semantic authority moves between people, config, runtime, and evidence",
    ],
    marketNarrative: [
      "Taylor is strongest where infrastructure, developer tooling, security, and AI evaluation need legible operating artifacts.",
      "The public profile should read as evidence of systems judgment, not generic career branding.",
    ],
    projectsToConnect: [
      "SearchBench",
      "Static Control Plane",
      "OSC",
      "libnftnl fuzzer",
      "Tarigma",
      "technical writing platform",
    ],
    avoidFraming: [
      "generic self-promotion",
      "resume prose",
      "ungrounded genius framing",
      "overexplaining identity arc",
      "private contact details or job-application tracker data",
    ],
    preferredFraming: [
      "legibility",
      "reproducibility",
      "semantic boundaries",
      "typed/testable interfaces",
      "artifact quality",
      "phase-boundary engineering",
    ],
    storyBankHighlights: [
      "Use career/profile context only when it clarifies the technical thesis.",
      "Connect current repo evidence to durable positioning through proof, not self-description.",
      "Prefer public, project-shaped evidence over private career-process details.",
    ],
  });
};

export const buildAuthorProfile = async (): Promise<ContextBuildResult<AuthorProfileCapsule>> => {
  const config = await readContextConfig();
  const sources = (
    await Promise.all(
      config.externalProfileFiles
        .filter((file) => file.enabled)
        .map((file) => readConfiguredTextFile(file.name, file.path)),
    )
  )
    .filter((source): source is NonNullable<typeof source> => Boolean(source))
    .map((source) => ({
      ...source,
      text: sanitizeContextText(source.text),
    }));

  const identity = {
    schemaVersion: CONTEXT_SCHEMA_VERSION,
    modelName: MODEL_NAME,
    sources: sources.map((source) => ({
      name: source.name,
      path: source.path,
      sha256: sha256(source.text),
    })),
  };
  const cacheKey = sha256(JSON.stringify(identity));
  const cachePath = path.join(contextCacheDir, `author-profile-${cacheKey}.json`);

  try {
    const entry = cacheEntrySchema.parse(JSON.parse(await readFile(cachePath, "utf8")));
    if (entry.cacheKey === cacheKey) {
      return { capsule: entry.capsule, sourceCount: sources.length, cacheHit: true };
    }
  } catch {
    // Bad or missing cache entries are regenerated below.
  }

  const capsule = buildCapsule(sources);
  await mkdir(contextCacheDir, { recursive: true });
  await writeFile(
    cachePath,
    `${JSON.stringify({ schemaVersion: CONTEXT_SCHEMA_VERSION, cacheKey, identity, capsule, createdAt: new Date().toISOString() }, null, 2)}\n`,
    "utf8",
  );
  return { capsule, sourceCount: sources.length, cacheHit: false };
};
