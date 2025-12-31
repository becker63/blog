import rehypeHighlight from "rehype-highlight";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

/**
 * MDX configuration with syntax highlighting.
 * Uses rehype-highlight for highlight.js-based code highlighting.
 */
export const mdxOptions: MDXRemoteProps["options"] = {
    mdxOptions: {
        rehypePlugins: [rehypeHighlight],
    },
};
