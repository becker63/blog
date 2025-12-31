"use client";

import React, { useState } from "react";
import { css } from "../../../styled-system/css";
import { BlogPost } from "../../../lib/blogs";
import { Fetchblogmeta } from "./FetchBlogMeta";

export const SearchWrapper = ({ posts }: { posts: BlogPost[] }) => {
    const [search, setSearch] = useState("");

    const filteredPosts = posts.filter((post) => {
        const searchLower = search.toLowerCase();
        const tags = Array.isArray(post.meta.tags) ? post.meta.tags : [];
        return (
            post.meta.title.toLowerCase().includes(searchLower) ||
            post.meta.description.toLowerCase().includes(searchLower) ||
            tags.some(tag => tag.toLowerCase().includes(searchLower))
        );
    });

    return (
        <div className={css({ w: "full", display: "flex", flexDirection: "column", alignItems: "center", pb: "layout" })}>
            {/* Glassy sticky header strip */}
            <div className={css({
                w: "full",
                position: "sticky",
                top: "navHeight", // Dock below navbar
                zIndex: 40,
                display: "flex",
                justifyContent: "center",
                backdropFilter: "blur(10px)", // Glass effect
                py: "2", // Vertical padding for toolbar feel
                mb: "layout", // Gap below the strip
                // removed manual mt to fix jumpiness
            })}>
                {/* Inner input container - centered and limited width */}
                <div className={css({
                    w: "full",
                    maxW: "800px",
                })}>
                    <input
                        type="text"
                        placeholder="Search blogs..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className={css({
                            w: "100%",
                            p: "5", // Match blog card padding
                            bg: "#000000", // Match blog card background
                            opacity: 0.7, // Match blog card opacity
                            borderRadius: "10px", // Match blog card radius
                            boxShadow: "#00000F 0 0 10px", // Match blog card shadow
                            color: "white",
                            outline: "none",
                            fontSize: "xl",
                            _focus: {
                                borderColor: "white", // Keep focus indication
                                boxShadow: "0 0 15px rgba(255,255,255,0.4)" // Enhanced focus shadow
                            },
                            transition: "all 0.3s ease"
                        })}
                    />
                </div>
            </div>
            <Fetchblogmeta posts={filteredPosts} />
        </div>
    );
};
