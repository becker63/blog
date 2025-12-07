"server-only";

import React from "react";
import { css } from "../../../styled-system/css";
import { getAllPosts, getPostBySlug } from "../../../lib/blogs";
import { MDXRemote } from "next-mdx-remote/rsc";
import { LAYOUT_GAP } from "../../../lib/layout";

export async function generateStaticParams() {
  const blogs = getAllPosts();

  const paths = blogs.map((blog) => ({
    slug: blog.slug,
  }));

  return paths;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const blog = getPostBySlug(params.slug);

  if (blog)
    return {
      title: blog.meta.title,
      description: blog.meta.description,
    };
}

export default async function Post({ params }: { params: { slug: string } }) {
  try {
    const blog = getPostBySlug(params.slug);

    if (blog) {
      return (
        <>
          <div
            className={css({
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
              bg: "#000000",
              w: { base: "90%", md: "80%", lg: "70%" },
              h: { base: "90%", md: "80%", lg: "70%" },
              mx: "auto",
              p: "6",
              mb: "layout",
            })}
          >
            <div
              className={css({
                maxWidth: "65ch",
                mx: "auto",
                color: "white",
                "& h1": { fontSize: "3xl", fontWeight: "bold", mt: "2rem", mb: "1rem" },
                "& h2": { fontSize: "2xl", fontWeight: "bold", mt: "1.5rem", mb: "0.75rem" },
                "& h3": { fontSize: "xl", fontWeight: "bold", mt: "1.25rem", mb: "0.5rem" },
                "& p": { mb: "1rem", lineHeight: "relaxed" },
                "& ul": { listStyleType: "disc", pl: "1.5rem", mb: "1rem" },
                "& ol": { listStyleType: "decimal", pl: "1.5rem", mb: "1rem" },
                "& li": { mb: "0.5rem" },
                "& blockquote": {
                  borderLeftWidth: "4px",
                  borderLeftColor: "gray.500",
                  pl: "1rem",
                  fontStyle: "italic",
                  my: "1rem",
                },
                "& pre": {
                  bg: "gray.900",
                  p: "1rem",
                  borderRadius: "rounded",
                  overflowX: "auto",
                  mb: "1rem",
                },
                "& code": {
                  fontFamily: "mono",
                  bg: "rgba(255,255,255,0.1)",
                  px: "0.2em",
                  borderRadius: "sm",
                },
                "& pre code": {
                  bg: "transparent",
                  p: "0",
                },
                "& a": {
                  color: "blue.400",
                  textDecoration: "underline",
                  _hover: { color: "blue.300" },
                },
                "& img": {
                  maxWidth: "100%",
                  height: "auto",
                  borderRadius: "md",
                  my: "1rem",
                },
                "& hr": {
                  borderColor: "gray.700",
                  my: "2rem",
                },
              })}
            >
              <div className={css({ mb: "5" })}>
                <h1 className={css({ fontWeight: "bold", fontSize: "3xl", xl: { mt: "24" }, mb: "0" })}>
                  {blog.meta.title}
                </h1>
                <time className={css({ color: "gray.500", fontStyle: "italic" })}>{blog.meta.date}</time>
                <div className={css({ borderBottomWidth: "1px", borderBottomColor: "white", w: "full", mt: "5" })} />
              </div>
              <MDXRemote source={blog.content} />
            </div>
          </div>
        </>
      );
    }
  } catch (error) {
    console.error(error);
    return <p>something broke or this blog doesnt exist :/</p>;
  }
}
