import rehypeHighlight from "rehype-highlight";
import rehypeRaw from "rehype-raw";
import { all } from "lowlight";
import remarkMermaidStatic from "./remark-mermaid-static";
import type { MDXRemoteProps } from "next-mdx-remote/rsc";

export const mdxOptions: MDXRemoteProps["options"] = {
  mdxOptions: {
    remarkPlugins: [remarkMermaidStatic],
    rehypePlugins: [rehypeRaw, [rehypeHighlight, { languages: all }]] as any,
  },
};
