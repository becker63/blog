export const buildRedditRankerPrompt = (input: {
  summary: unknown;
  candidates: unknown[];
}) =>
  [
    "Rank subreddit candidates for a technical blog post.",
    "Return JSON only matching RedditRecommendationSet.",
    "Prefer manual_review when self-promotion risk is not low.",
    "Never recommend spammy cross-posting.",
    "",
    "## Distribution summary",
    JSON.stringify(input.summary, null, 2),
    "",
    "## Candidate subreddits",
    JSON.stringify(input.candidates, null, 2),
  ].join("\n");

export const redditRankerExpectedShape = `{
  "recommendations": [{
    "subreddit": "string",
    "url": "string",
    "score": 0,
    "reason": "string",
    "audienceFit": "string",
    "ruleRisk": "low|medium|high|unknown",
    "selfPromotionRisk": "low|medium|high|unknown",
    "recommendedAction": "skip|manual_review|submit_candidate",
    "suggestedTitle": "string",
    "suggestedBody": "string",
    "notes": ["string"]
  }]
}`;
