"use client";

import React, { useState } from "react";
import { css } from "../../../styled-system/css";
import { BlogPost } from "../../../lib/blogs";
import { Fetchblogmeta } from "./FetchBlogMeta";

export const SearchWrapper = ({ posts }: { posts: BlogPost[] }) => {
    const [search, setSearch] = useState("");

    const filteredPosts = posts.filter((post) =>
        post.meta.title.toLowerCase().includes(search.toLowerCase()) ||
        post.meta.description.toLowerCase().includes(search.toLowerCase()) ||
        post.meta.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
    );

    return (
        <div className={css({ w: "full", display: "flex", flexDirection: "column", alignItems: "center", pb: "5" })}>
            <div className={css({
                w: "full",
                maxW: "800px",
                p: "4",
                position: "sticky",
                top: "100px",
                zIndex: 40,
                display: "flex",
                justifyContent: "center"
            })}>
                <input
                    type="text"
                    placeholder="Search blogs..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className={css({
                        w: "100%",
                        p: "4",
                        bg: "rgba(0,0,0,0.5)",
                        backdropFilter: "blur(4px)",
                        borderRadius: "lg",
                        border: "1px solid rgba(255,255,255,0.2)",
                        color: "white",
                        outline: "none",
                        fontSize: "xl",
                        _focus: {
                            borderColor: "white",
                            boxShadow: "0 0 15px rgba(255,255,255,0.2)"
                        },
                        transition: "all 0.3s ease"
                    })}
                />
            </div>
            <Fetchblogmeta posts={filteredPosts} />
        </div>
    );
};
