import fs from "node:fs";
import path from "node:path";
import {
  canonicalUrl,
  draftsDir,
  ensureLaunchDirs,
  readLaunch,
  utmLinksFilePath,
  type Launch,
} from "public-proof-core";
import { buildLaunchUtmLinks } from "public-proof-reporting";
import {
  heuristicSummarizePost,
  mdxToMarkdown,
  mdxToPlainText,
  readMdxPost,
} from "public-proof-content";
import {
  distributionSummarySchema,
  generatePlatformVariants,
  summarizePostForDistribution,
} from "public-proof-agent";
import { getProvider } from "public-proof-platforms";
import type { DistributionSummary } from "public-proof-agent";
import type { PlatformDraft } from "public-proof-platforms";

const PG_LAUNCH_UUID =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const resolveTraceLaunchPk = async (
  filesystemLaunchFolder: string,
  launch: Launch,
): Promise<string | null> => {
  if (PG_LAUNCH_UUID.test(launch.id)) return launch.id;
  const pgUrl =
    process.env.POSTGRES_URL?.trim() ||
    process.env.POSTGRES_URL_NON_POOLING?.trim() ||
    process.env.DATABASE_URL?.trim();
  if (!pgUrl) return null;
  try {
    const { getPublicProofDb, getLaunchBySlug } = await import("public-proof-db");
    const db = getPublicProofDb();
    let row = await getLaunchBySlug(db, launch.id);
    if (!row) row = await getLaunchBySlug(db, filesystemLaunchFolder);
    return row?.id ?? null;
  } catch {
    return null;
  }
};

export const loadLaunchContext = async (launchId: string) => {
  const launch = readLaunch(launchId);
  ensureLaunchDirs(launchId);
  const post = readMdxPost(launch.postSlug);
  const url = canonicalUrl(launch.canonicalPath);
  const utmLinks = buildLaunchUtmLinks(launch, url);
  fs.writeFileSync(utmLinksFilePath(launchId), `${JSON.stringify(utmLinks, null, 2)}\n`);
  const { markdown, warnings: mdxWarnings } = mdxToMarkdown(post.body);
  const plainText = mdxToPlainText(post.body);
  const traceLaunchPk = await resolveTraceLaunchPk(launchId, launch);
  const summary = await resolveDistributionSummary({
    launch,
    post: { title: post.title, description: post.description, tags: post.tags },
    canonicalUrl: url,
    plainText,
    primaryClaim: launch.primaryClaim,
    traceLaunchPk,
  });
  return { launch, post, url, utmLinks, markdown, plainText, summary, mdxWarnings, traceLaunchPk };
};

const resolveDistributionSummary = async (input: {
  launch: Launch;
  post: { title: string; description: string; tags: string[] };
  canonicalUrl: string;
  plainText: string;
  primaryClaim: string;
  traceLaunchPk: string | null;
}): Promise<DistributionSummary> => {
  if (process.env.CURSOR_API_KEY) {
    try {
      return await summarizePostForDistribution(
        {
          title: input.post.title,
          description: input.post.description,
          tags: input.post.tags,
          canonicalUrl: input.canonicalUrl,
          plainTextBody: input.plainText,
        },
        undefined,
        input.traceLaunchPk ?? undefined,
      );
    } catch (error) {
      console.warn(`Cursor summarize failed, using heuristic: ${(error as Error).message}`);
    }
  }
  const post = readMdxPost(input.launch.postSlug);
  return distributionSummarySchema.parse(
    heuristicSummarizePost(post, input.primaryClaim),
  );
};

export const renderAllDrafts = async (
  ctx: Awaited<ReturnType<typeof loadLaunchContext>>,
): Promise<Record<string, PlatformDraft>> => {
  const enabled = ctx.launch.platforms.filter((p) => p.enabled);
  const drafts: Record<string, PlatformDraft> = {};

  if (process.env.CURSOR_API_KEY) {
    try {
      const variants = await generatePlatformVariants(
        {
          summary: ctx.summary,
          utmLinks: ctx.utmLinks,
          platforms: enabled.map((p) => p.provider),
        },
        undefined,
        ctx.traceLaunchPk ?? undefined,
      );
      for (const variant of variants.variants) {
        drafts[variant.platform] = {
          provider: variant.platform,
          title: variant.title,
          body: variant.body,
          firstComment: variant.firstComment,
          warnings: variant.warnings,
        };
      }
    } catch (error) {
      console.warn(`Platform variants agent failed: ${(error as Error).message}`);
    }
  }

  for (const plan of enabled) {
    if (drafts[plan.provider]) continue;
    const provider = getProvider(plan.provider);
    const utmUrl = ctx.utmLinks[plan.provider] ?? ctx.url;
    drafts[plan.provider] = await provider.renderDraft({
      launch: ctx.launch,
      post: ctx.post,
      summary: ctx.summary,
      canonicalUrl: ctx.url,
      utmUrl,
      markdown: ctx.markdown,
      plainText: ctx.plainText,
    });
  }

  const dir = draftsDir(ctx.launch.id);
  fs.mkdirSync(dir, { recursive: true });
  for (const [provider, draft] of Object.entries(drafts)) {
    fs.writeFileSync(path.join(dir, `${provider}.json`), `${JSON.stringify(draft, null, 2)}\n`);
  }
  fs.writeFileSync(
    path.join(dir, "summary.json"),
    `${JSON.stringify(ctx.summary, null, 2)}\n`,
  );
  return drafts;
};
