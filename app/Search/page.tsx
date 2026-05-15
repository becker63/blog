import React from "react";
import { SearchWrapper } from "../components/search/SearchWrapper";
import { getAllPosts } from "../../lib/blogs";
import { css } from "../../styled-system/css";
import { blogArticleShellStyles } from "../components/shared/GlassCard";

export default function BlogHomepage() {
  const posts = getAllPosts();

  return (
    <div
      className={css({
        ...blogArticleShellStyles,
        // Search layout is a flex column; margins do not collapse like on the
        // blog route’s block layout, so shell `mt` + navbar `mb` would double
        // the gap under the nav. Drop top margin here only.
        mt: 0,
        flex: 1,
        minH: 0,
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      })}
    >
      <SearchWrapper posts={posts} />
    </div>
  );
}
