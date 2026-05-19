import type { RedditRecommendationSet } from "public-proof-agent";
import type { DistributionSummary } from "public-proof-agent";
import type { ProviderAdapter } from "./provider";

const nowIso = () => new Date().toISOString();

export type RedditCandidate = {
  subreddit: string;
  url: string;
  title?: string;
  subscribers?: number;
  publicDescription?: string;
};

export const defaultRedditCandidates = (topics: string[]): RedditCandidate[] => {
  const bases = [
    { subreddit: "programming", url: "https://reddit.com/r/programming" },
    { subreddit: "MachineLearning", url: "https://reddit.com/r/MachineLearning" },
    { subreddit: "devops", url: "https://reddit.com/r/devops" },
    { subreddit: "golang", url: "https://reddit.com/r/golang" },
    { subreddit: "typescript", url: "https://reddit.com/r/typescript" },
  ];
  if (topics.some((t) => /ai|llm|agent/i.test(t))) {
    bases.push({ subreddit: "LocalLLaMA", url: "https://reddit.com/r/LocalLLaMA" });
  }
  return bases;
};

export const searchRedditCandidates = async (
  queries: string[],
): Promise<RedditCandidate[]> => {
  const clientId = process.env.REDDIT_CLIENT_ID;
  const clientSecret = process.env.REDDIT_CLIENT_SECRET;
  if (!clientId || !clientSecret) {
    return defaultRedditCandidates(queries);
  }
  // OAuth + search would go here; v1 falls back to deterministic list
  return defaultRedditCandidates(queries);
};

export const heuristicRankSubreddits = (
  summary: DistributionSummary,
  candidates: RedditCandidate[],
  canonicalUrl: string,
): RedditRecommendationSet => ({
  recommendations: candidates.map((candidate, index) => ({
    subreddit: candidate.subreddit,
    url: candidate.url,
    score: Math.max(10, 90 - index * 12),
    reason: `Matches topics: ${summary.technicalTopics.slice(0, 3).join(", ")}`,
    audienceFit: summary.audienceTags.join(", "),
    ruleRisk: "unknown" as const,
    selfPromotionRisk: "medium" as const,
    recommendedAction: "manual_review" as const,
    suggestedTitle: summary.suggestedHooks[0] ?? summary.primaryClaim,
    suggestedBody: `${summary.shortSummary}\n\n${canonicalUrl}`,
    notes: [
      "Heuristic ranking — run with CURSOR_API_KEY for agent-ranked recommendations.",
      "Do not cross-post to multiple subreddits without explicit review.",
    ],
  })),
});

export const redditProvider: ProviderAdapter = {
  provider: "reddit",
  capabilities: {
    publish: true,
    schedule: false,
    fetchMetrics: false,
    manual: false,
    recommendOnly: true,
  },
  async renderDraft({ summary, utmUrl }) {
    return {
      provider: "reddit",
      title: summary.suggestedHooks[0],
      body: `${summary.shortSummary}\n\n${utmUrl}`,
      warnings: [
        "Reddit requires manual subreddit approval.",
        "Never auto-post without --subreddit and --confirm.",
      ],
    };
  },
  async publish({ launch, draft, confirm, dryRun, subreddit }) {
    const id = `${launch.id}-reddit`;
    if (dryRun || !confirm) {
      return {
        id,
        launchId: launch.id,
        provider: "reddit",
        status: "planned",
        createdAt: nowIso(),
        updatedAt: nowIso(),
        platformMetadata: { dryRun: true, subreddit },
      };
    }
    if (!subreddit) {
      throw new Error("Reddit publish requires --subreddit <name>");
    }
    const clientId = process.env.REDDIT_CLIENT_ID;
    const clientSecret = process.env.REDDIT_CLIENT_SECRET;
    const username = process.env.REDDIT_USERNAME;
    const password = process.env.REDDIT_PASSWORD;
    if (!clientId || !clientSecret || !username || !password) {
      throw new Error(
        "REDDIT_CLIENT_ID, REDDIT_CLIENT_SECRET, REDDIT_USERNAME, and REDDIT_PASSWORD are required to submit",
      );
    }
    void clientId;
    void clientSecret;
    void username;
    void password;
    void draft;
    throw new Error(
      `Reddit submit to r/${subreddit} is gated — wire snoowrap/oauth before live submit.`,
    );
  },
};

export const assertSingleSubredditPublish = (
  subreddits: string[],
  allowMultiple = process.env.PUBLIC_PROOF_ALLOW_MULTI_REDDIT === "1",
) => {
  if (subreddits.length > 1 && !allowMultiple) {
    throw new Error(
      "Refusing to publish to multiple subreddits. Pass one --subreddit or set PUBLIC_PROOF_ALLOW_MULTI_REDDIT=1.",
    );
  }
};
