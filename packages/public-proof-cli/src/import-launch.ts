import fs from "node:fs";
import {
  fixtureLaunchJsonPath,
  launchFixtureImportSchema,
} from "public-proof-core";
import { readMdxPost } from "public-proof-content";
import { getPublicProofDb, upsertLaunchFromFixtureRow } from "public-proof-db";

import { parseCliArgs, requireLaunch } from "./args";

const main = async () => {
  const args = parseCliArgs();
  const slug = requireLaunch(args);
  const fixturePath = fixtureLaunchJsonPath(slug);
  if (!fs.existsSync(fixturePath)) {
    throw new Error(
      `Fixture not found for launch "${slug}". Expected JSON at ${fixturePath}. Create fixtures/public-proof/launches/${slug}.json first.`,
    );
  }

  const raw = JSON.parse(fs.readFileSync(fixturePath, "utf8"));
  const fixture = launchFixtureImportSchema.parse(raw);

  try {
    readMdxPost(fixture.postSlug);
  } catch {
    throw new Error(
      [
        `Import blocked: canonical MDX is missing for this launch.`,
        `Expected file: content/posts/${fixture.postSlug.replace(/\.mdx$/, "")}.mdx`,
        `Create or rename the MDX article before importing "${fixture.slug}" into Postgres.`,
      ].join("\n"),
    );
  }

  void process.stdout.write(
    `Fixture "${fixture.slug}" validated; MDX for "${fixture.postSlug}" resolves.\n`,
  );

  if (args.persistDb) {
    const db = getPublicProofDb();
    await upsertLaunchFromFixtureRow(db, {
      slug: fixture.slug,
      title: fixture.title,
      postSlug: fixture.postSlug,
      canonicalPath: fixture.canonicalPath,
      campaign: fixture.campaign,
      primaryClaim: fixture.primaryClaim,
      resumeClaim: fixture.resumeClaim,
      audienceGate: fixture.audienceGate,
      status: "draft",
    });
    void process.stdout.write(`Inserted/updated launches row slug=${fixture.slug}\n`);
  }
};

main().catch((err) => {
  void process.stderr.write(`${(err as Error).message ?? err}\n`);
  process.exitCode = 1;
});
