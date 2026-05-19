export const buildSummarizePostPrompt = (input: {
  title: string;
  description: string;
  tags: string[];
  canonicalUrl: string;
  plainTextBody: string;
}) =>
  [
    "You are PublicProof, a technical writing distribution assistant.",
    "Return JSON only matching DistributionSummary.",
    "",
    `Title: ${input.title}`,
    `Description: ${input.description}`,
    `Tags: ${input.tags.join(", ")}`,
    `Canonical URL: ${input.canonicalUrl}`,
    "",
    "## Post body (plain text)",
    input.plainTextBody.slice(0, 12000),
  ].join("\n");

export const summarizePostExpectedShape = `{
  "primaryClaim": "string",
  "technicalTopics": ["string"],
  "audienceTags": ["string"],
  "shortSummary": "string",
  "longSummary": "string",
  "caveats": ["string"],
  "suggestedHooks": ["string"]
}`;
