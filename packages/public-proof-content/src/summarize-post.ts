import type { MdxPost } from "./read-mdx-post";
import { mdxToPlainText } from "./mdx-to-plain-text";

export type HeuristicDistributionSummary = {
  primaryClaim: string;
  technicalTopics: string[];
  audienceTags: string[];
  shortSummary: string;
  longSummary: string;
  caveats: string[];
  suggestedHooks: string[];
};

export const heuristicSummarizePost = (
  post: MdxPost,
  primaryClaim: string,
): HeuristicDistributionSummary => {
  const plain = mdxToPlainText(post.body);
  const firstParagraph = plain.split(/\n\n+/).find((p) => p.length > 40) ?? plain.slice(0, 280);
  const topics = [...new Set([...post.tags, "engineering", "typescript"].filter(Boolean))];

  return {
    primaryClaim,
    technicalTopics: topics,
    audienceTags: post.tags.length ? post.tags : ["developers"],
    shortSummary: post.description || firstParagraph.slice(0, 240),
    longSummary: firstParagraph.slice(0, 600),
    caveats: ["Review platform-specific self-promotion rules before publishing."],
    suggestedHooks: [
      post.title,
      primaryClaim,
      `New post: ${post.title}`,
    ],
  };
};
