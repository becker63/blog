import React from "react";
import { SearchWrapper } from "./Search_components/SearchWrapper";
import { getAllPosts } from "../../lib/blogs";
import { css } from "../../styled-system/css";
import { layoutStyles } from "../../lib/layout-styles";

export default function BlogHomepage() {
  const posts = getAllPosts();

  return (
    <>
      <div
        className={css({
          layerStyle: "pageContainer",
          minH: "100vh",
          w: "100vw",
        })}
      >
        <SearchWrapper posts={posts} />
      </div>
    </>
  );
}
