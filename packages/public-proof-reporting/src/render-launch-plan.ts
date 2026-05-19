import type { Launch, Publication } from "public-proof-core";
import type { PlatformDraft } from "public-proof-platforms";

export const renderLaunchPlan = (input: {
  launch: Launch;
  canonicalUrl: string;
  drafts: Record<string, PlatformDraft>;
  publications: Publication[];
  dryRun: boolean;
  only?: string;
}): string => {
  const lines = [
    `# Launch plan: ${input.launch.title}`,
    "",
    `Canonical: ${input.canonicalUrl}`,
    `Primary claim: ${input.launch.primaryClaim}`,
    `Mode: ${input.dryRun ? "DRY RUN" : "LIVE"}`,
    input.only ? `Filter: ${input.only}` : "",
    "",
    "## Platforms",
  ].filter(Boolean);

  for (const plan of input.launch.platforms.filter((p) => p.enabled)) {
    if (input.only && plan.provider !== input.only) continue;
    const draft = input.drafts[plan.provider];
    const pub = input.publications.find((p) => p.provider === plan.provider);
    lines.push(
      `### ${plan.provider}`,
      `- mode: ${plan.mode}`,
      `- draft: ${draft ? "yes" : "missing"}`,
      `- publication: ${pub?.status ?? "none"}`,
      "",
    );
  }

  lines.push(
    "## Safety",
    "- Publishing requires --confirm",
    "- Reddit requires exact --subreddit",
    "- LinkedIn/Substack are manual in v1",
  );
  return lines.join("\n");
};
