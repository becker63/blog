import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { all } from "lowlight";
import pkl from "@apple/highlightjs-pkl";
import remarkMermaidStatic from "./remark-mermaid-static";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

const languages = {
  ...all,
  pkl,
};

export const mdxOptions: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkMermaidStatic],
    rehypePlugins: [rehypeRaw, [rehypeHighlight, { languages }]] as any,
  },
};
