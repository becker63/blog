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
