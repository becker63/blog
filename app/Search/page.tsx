import React from "react";
import { SearchWrapper } from "../components/search/SearchWrapper";
import { getAllPosts } from "../../lib/blogs";
import { css } from "../../styled-system/css";

export default function BlogHomepage() {
  const posts = getAllPosts();

  return (
    <>
      <div
        className={css({
          layerStyle: "pageWithMargins",
        })}
      >
        <SearchWrapper posts={posts} />
      </div>
    </>
  );
}
