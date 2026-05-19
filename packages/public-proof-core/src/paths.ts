import path from "node:path";

export const workspaceRoot = process.env.PUBLIC_PROOF_WORKSPACE ?? process.cwd();

export const fixtureLaunchJsonPath = (slug: string) =>
  path.join(workspaceRoot, "fixtures/public-proof/launches", `${slug}.json`);

export const publicProofDataDir = path.join(workspaceRoot, "data/public-proof");
export const launchesDir = path.join(publicProofDataDir, "launches");
export const postsDir = path.join(workspaceRoot, "content/posts");

export const launchDir = (launchId: string) => path.join(launchesDir, launchId);
export const launchFilePath = (launchId: string) => path.join(launchDir(launchId), "launch.json");
export const publicationsFilePath = (launchId: string) =>
  path.join(launchDir(launchId), "publications.json");
export const utmLinksFilePath = (launchId: string) =>
  path.join(launchDir(launchId), "utm-links.json");
export const draftsDir = (launchId: string) => path.join(launchDir(launchId), "drafts");
export const redditRecommendationsPath = (launchId: string) =>
  path.join(launchDir(launchId), "reddit-recommendations.md");
export const launchReportPath = (launchId: string) =>
  path.join(launchDir(launchId), "report.md");

export const siteBaseUrl = () =>
  (process.env.PUBLIC_PROOF_BASE_URL ?? process.env.PUBLIC_PROOF_SITE_URL ?? "https://www.becker63.digital").replace(
    /\/$/,
    "",
  );

export const canonicalUrl = (canonicalPath: string) =>
  `${siteBaseUrl()}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;
