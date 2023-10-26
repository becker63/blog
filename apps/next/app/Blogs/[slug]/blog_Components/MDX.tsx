"use client";

import { useState } from "react";
import { MDXRemote } from "next-mdx-remote";
import Button from "./mdx/Button";

const components = { Button };

export function MDX({ post }: { post: string }) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [count, setcount] = useState(0);

  return <>{post && <MDXRemote compiledSource={post} components={components} scope={{}} frontmatter={{}} lazy/>}</>;
}
