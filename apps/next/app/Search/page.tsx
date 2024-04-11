import React from "react";
import "./Search.css";
import { Fetchblogmeta } from "./Search_components/FetchBlogMeta";

export default function BlogHomepage() {

  return (
    <>
      <div>
        {/* @ts-expect-error Server Component */}
        <Fetchblogmeta />
      </div>
    </>
  );
}
