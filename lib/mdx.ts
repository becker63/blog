import rehypeHighlight from "rehype-highlight";
import nim from "highlight.js/lib/languages/nim";
import { all } from "lowlight";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

export const mdxOptions: MDXRemoteProps["options"] = {
  mdxOptions: {
    rehypePlugins: [
      [
        rehypeHighlight,
        {
          languages: all,
        },
      ],
    ],
  },
};
