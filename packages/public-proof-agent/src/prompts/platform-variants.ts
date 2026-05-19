export const buildPlatformVariantsPrompt = (input: {
  summary: unknown;
  utmLinks: Record<string, string>;
  platforms: string[];
}) =>
  [
    "Generate platform-native variants for technical distribution.",
    "Return JSON only matching PlatformVariantSet.",
    "Respect platform length limits. Include warnings when truncating.",
    "",
    "## Distribution summary",
    JSON.stringify(input.summary, null, 2),
    "",
    "## UTM links",
    JSON.stringify(input.utmLinks, null, 2),
    "",
    "## Platforms",
    input.platforms.join(", "),
  ].join("\n");

export const platformVariantsExpectedShape = `{
  "variants": [{
    "platform": "string",
    "title": "optional string",
    "body": "string",
    "firstComment": "optional string",
    "warnings": ["string"]
  }]
}`;
