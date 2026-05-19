import type { Launch } from "public-proof-core";
import { buildPlatformUtmLinks } from "public-proof-core";

export const renderUtmLinksMarkdown = (
  links: Record<string, string>,
): string =>
  [
    "# UTM links",
    "",
    ...Object.entries(links).map(([platform, url]) => `- **${platform}**: ${url}`),
  ].join("\n");

export const buildLaunchUtmLinks = (launch: Launch, canonicalUrl: string) =>
  buildPlatformUtmLinks(
    canonicalUrl,
    launch.campaign,
    launch.platforms.filter((p) => p.enabled).map((p) => p.provider),
  );
