"use client";

import React from "react";
import { useMachine } from "@xstate/react";
import { treeNodeMachine } from "./treeNodeMachine";
import { css } from "../../../styled-system/css";
import { BlogPost } from "../../../lib/blogs";
import { TreeLines, TREE_COLUMN_WIDTH } from "./TreeLines";
import { BlogCard } from "./BlogCard";

type TreeNodeProps = {
  blog: BlogPost;
  depth: number;
  isFirst: boolean;
  isLast: boolean;
};

export const TreeNode = ({ blog, depth, isFirst, isLast }: TreeNodeProps) => {
  useMachine(treeNodeMachine);

  return (
    <>
      <div
        className={css({
          display: "flex",
          justifyContent: "center",
          w: "full",
        })}
      >
        <div
          className={css({
            display: "flex",
            flexDirection: "row",
            w: "full",
            maxW: "800px",
          })}
        >
          {/* Indentation */}
          {Array.from({ length: depth }).map((_, i) => (
            <div key={i} style={{ width: TREE_COLUMN_WIDTH }} />
          ))}

          <TreeLines showTop={!isFirst} showBottom={!isLast} />
          <BlogCard blog={blog} />
        </div>
      </div>

      {blog.children?.map((child, index) => (
        <TreeNode
          key={child.slug}
          blog={child}
          depth={depth + 1}
          isFirst={index === 0}
          isLast={index === blog.children!.length - 1}
        />
      ))}
    </>
  );
};
