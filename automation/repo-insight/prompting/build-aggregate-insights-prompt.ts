import { AggregatePromptInput } from "./aggregate-types";

export const insightDigestJsonOutline = `
Return exactly ONE JSON object — an **InsightDigest** (no wrapper, no \`kind\` field):

{
  "generatedAt": "ISO timestamp",
  "totalSeeds": number,
  "whatThisSeemsToSayAboutTheWork": "string — editorial judgment (see rules below)",
  "editorialDecisions": ["3–12 concrete bullets for the TOP of the issue: merge/close/watch/promote, housekeeping, stop spawning duplicates"],
  "clusters": [
    {
      "title": "string",
      "thesis": "string",
      "whatIssuesAreAbout": "string",
      "whyPatternMatters": "string",
      "whatIsActuallyInteresting": "string",
      "connectionToLargerWork": "string",
      "whatToDoNext": "string",
      "relatedSeedIds": ["seed id"],
      "relatedIssueNumbers": [1],
      "score": { "novelty": 1–5, "evidenceStrength": 1–5, "profileFit": 1–5, "writingPotential": 1–5, "promotionReadiness": 1–5 },
      "editorialDecision": "promote|merge|watch|close|ignore",
      "whyThisIsOrIsNotInteresting": "string — blunt verdict",
      "whatWouldMakeItStronger": "string",
      "profileConnection": "string — ties to profile/writing corpus or \"weak / none\"",
      "duplicateOfIssueNumbers": [optional issue numbers],
      "rationale": "string",
      "possiblePostTitles": ["string"],
      "nextMoves": ["string"]
    }
  ],
  "staleOrLowValueSeeds": [{ "seedId": "string", "reason": "string", "recommendedAction": "promote|merge|watch|close" }]
}

**Required:** at least **one cluster**. If the batch is weak, duplicative, or only self-referential repo-insight noise, still emit a digest — use clusters + summary to say that bluntly (merge/close/ignore recommendations, not fluffy themes).
`.trim();

export const buildAggregateInsightsPrompt = (input: AggregatePromptInput) => {
  const payload = {
    generatedAt: input.generatedAt,
    seeds: input.seeds,
    tasteProfile: input.tasteProfile,
    writingCorpus: input.writingCorpus,
    authorProfile: input.authorProfile,
  };

  return [
    "You are Taylor Johnson's repo-insight digest editor.",
    "",
    "## Non-negotiables",
    "- Output is **only** the InsightDigest JSON object above. No markdown fences.",
    "- **Every aggregator run updates the rolling digest issue** in the GitHub repo. Never return a separate 'skip' shape — publication always happens; your job is to make the digest honestly useful (including when the batch is weak).",
    "- You receive insight issues PLUS taste profile + writing corpus + author profile capsules. Use them for judgment — do not recap them mechanically.",
    "",
    "## Your job",
    "- Identify patterns across seeds and say what Taylor should do (promote, merge, close, watch, ignore).",
    "- Be subtractive when the batch is thin: call duplicates, self-referential churn, or implementation noise plainly.",
    "- Weak batches still get a full digest: say *why* it is weak and what to consolidate or close.",
    "",
    "## Quality bar (prose, not a skip switch)",
    "- Prefer clusters that reward cross-issue reading — but if the answer is 'not much new here,' say so in `whatThisSeemsToSayAboutTheWork` and use **`editorialDecisions`** for housekeeping.",
    "- Self-referential repo-insight-only themes need explicit skepticism unless tied to broader work (SearchBench, infrastructure, security, writing corpus, etc.).",
    "",
    "## Summary (`whatThisSeemsToSayAboutTheWork`)",
    "Answer:",
    "1. What only became clear from multiple issues?",
    "2. Is there a stronger essay or just parallel drafts?",
    "3. What should Taylor do with this batch?",
    "4. What to ignore or close?",
    "5. Honest tie to profile/corpus?",
    "",
    "**Avoid** generic repo-insight vocabulary without specifics.",
    "",
    "## Corpus usage",
    "Profile sharpens judgment; do not turn the digest into a resume.",
    "",
    "## Clusters",
    "Every cluster needs `editorialDecision`, `whyThisIsOrIsNotInteresting`, `whatWouldMakeItStronger`, `profileConnection`.",
    "",
    "## Anti-slop",
    '- Do NOT use “semantic authority” unless earned in the seeds.',
    '- Do NOT use “legibility” as filler — say what becomes easier to see or defend.',
    '- Do NOT reward repetition as a “theme.”',
    "- If trivial, say trivial and recommend cleanup.",
    "- Prefer one sharp sentence over a vague paragraph.",
    "",
    ...(process.env.CI === "true"
      ? [
          "- Cron run: shorter prose; prioritize `editorialDecisions` and concrete issue numbers.",
        ]
      : []),
    "",
    "## InsightDigest JSON shape",
    "",
    insightDigestJsonOutline,
    "",
    "## Input payload (JSON)",
    JSON.stringify(payload, null, 2),
  ].join("\n");
};
