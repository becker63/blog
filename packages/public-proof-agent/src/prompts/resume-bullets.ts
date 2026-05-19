export const buildResumeBulletsPrompt = (input: {
  launch: unknown;
  publications: unknown[];
  metrics: unknown[];
}) =>
  [
    "Generate resume-ready bullets for a technical launch.",
    "Return JSON only matching ResumeBulletSet.",
    "Mark requiresMetrics when metrics are placeholders.",
    "",
    "## Launch",
    JSON.stringify(input.launch, null, 2),
    "",
    "## Publications",
    JSON.stringify(input.publications, null, 2),
    "",
    "## Metrics",
    JSON.stringify(input.metrics, null, 2),
  ].join("\n");

export const resumeBulletsExpectedShape = `{
  "bullets": [{
    "style": "engineering|market|combined",
    "text": "string",
    "requiresMetrics": true,
    "missingMetrics": ["string"]
  }]
}`;
