"use client";

import React, { useMemo, useState } from "react";
import { css } from "../../../styled-system/css";
import { BlogPost } from "../../../lib/blogs";
import { TreeNode } from "./TreeNode";
import { AnimatePresence } from "framer-motion";

export const SearchWrapper = ({ posts }: { posts: BlogPost[] }) => {
  const [search, setSearch] = useState("");

  const filteredPosts = useMemo(() => {
    const searchLower = search.toLowerCase();
    return posts.filter((post) => {
      const tags = Array.isArray(post.meta.tags) ? post.meta.tags : [];
      return (
        post.meta.title.toLowerCase().includes(searchLower) ||
        post.meta.description.toLowerCase().includes(searchLower) ||
        tags.some((tag) => tag.toLowerCase().includes(searchLower))
      );
    });
  }, [posts, search]);

  return (
    <div
      className={css({
        w: "full",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        pb: "layout",
      })}
    >
      {/* Glassy sticky header strip */}
      <div
        className={css({
          w: "full",
          position: "sticky",
          top: "navHeight",
          zIndex: 40,
          display: "flex",
          justifyContent: "center",
          backdropFilter: "blur(10px)",
          mb: "layout",
        })}
      >
        <div
          className={css({
            w: "full",
            maxW: "800px",
          })}
        >
          <input
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={css({
              w: "100%",
              p: "5",
              bg: "#000000",
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
              color: "white",
              outline: "none",
              fontSize: "xl",
              _focus: {
                borderColor: "white",
                boxShadow: "0 0 15px rgba(255,255,255,0.4)",
              },
              transition: "all 0.3s ease",
            })}
          />
        </div>
      </div>

      {/* Tree List */}
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          w: "full",
          alignItems: "center",
          gap: "layout",
        })}
      >
        {filteredPosts.map((blog, index) => (
          <TreeNode
            key={blog.slug}
            blog={blog}
            depth={0}
            isFirst={index === 0}
            isLast={index === filteredPosts.length - 1}
          />
        ))}
      </div>
    </div>
  );
};
