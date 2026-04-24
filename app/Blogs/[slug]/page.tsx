"server-only";
export const dynamic = "force-static";
export const revalidate = false;

import React from "react";
import { css } from "../../../styled-system/css";
import { getAllPosts, getPostBySlug } from "../../../lib/blogs";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxOptions } from "../../../lib/mdx";
import "highlight.js/styles/atom-one-dark.css";

/* ------------------------- */
/* Date Utility              */
/* ------------------------- */

const formatFullDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

/* ------------------------- */
/* Static Generation         */
/* ------------------------- */

export async function generateStaticParams() {
  const blogs = getAllPosts();
  return blogs.map((blog) => ({ slug: blog.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const blog = getPostBySlug(params.slug);

  if (!blog) return {};

  return {
    title: blog.meta.title,
    description: blog.meta.description,
  };
}

/* ------------------------- */
/* Page Component            */
/* ------------------------- */

export default async function Post({ params }: { params: { slug: string } }) {
  try {
    const blog = getPostBySlug(params.slug);

    if (!blog) {
      return <p>something broke or this blog doesnt exist :/</p>;
    }

    return (
      <div
        className={css({
          borderRadius: "10px",
          boxShadow: "#00000F 0 0 10px",
          bg: "rgba(0, 0, 0, 0.7)",
          w: { base: "100%", md: "90%", lg: "80%" },
          mx: "auto",
          p: "6",
          mb: "layout",
          mt: "layout",
        })}
      >
        <div
          className={css({
            maxWidth: "65ch",
            mx: "auto",
            color: "rgba(255,255,255,0.85)",

            "& h1": {
              fontSize: "3xl",
              fontWeight: "bold",
              mt: "2rem",
              mb: "0.75rem",
            },
            "& h2": {
              fontSize: "2xl",
              fontWeight: "bold",
              mt: "1.5rem",
              mb: "0.75rem",
            },
            "& h3": {
              fontSize: "xl",
              fontWeight: "bold",
              mt: "1.25rem",
              mb: "0.5rem",
            },
            "& p": {
              mb: "1rem",
              lineHeight: "relaxed",
            },
            "& ul": {
              listStyleType: "disc",
              pl: "1.5rem",
              mb: "1rem",
            },
            "& ol": {
              listStyleType: "decimal",
              pl: "1.5rem",
              mb: "1rem",
            },
            "& li": { mb: "0.5rem" },
            "& blockquote": {
              borderLeftWidth: "4px",
              borderLeftColor: "gray.600",
              pl: "1rem",
              fontStyle: "italic",
              my: "1rem",
            },
            "& pre": {
              bg: "transparent",
              p: "1rem",
              borderRadius: "md",
              overflowX: "auto",
              mb: "1rem",
              fontSize: "sm",
              lineHeight: "1.6",
            },
            "& .hljs": {
              bg: "transparent !important",
            },
            "& code": {
              fontFamily: "mono",
              bg: "rgba(255,255,255,0.08)",
              px: "0.2em",
              borderRadius: "sm",
              fontSize: "0.9em",
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
          {/* Header */}
          <div className={css({ mb: "5" })}>
            <h1
              className={css({
                fontWeight: "bold",
                fontSize: "3xl",
                xl: { mt: "24" },
                mb: "1",
              })}
            >
              {blog.meta.title}
            </h1>

            <time
              dateTime={blog.meta.date.toISOString()}
              className={css({
                display: "block",
                fontSize: "sm",
                color: "gray.500",
                fontStyle: "italic",
                letterSpacing: "0.02em",
              })}
            >
              {formatFullDate(blog.meta.date)}
            </time>

            <div
              className={css({
                borderBottomWidth: "1px",
                borderBottomColor: "gray.700",
                w: "full",
                mt: "4",
              })}
            />
          </div>

          {/* Content */}
          <MDXRemote source={blog.content} options={mdxOptions} />
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    return <p>something broke or this blog doesnt exist :/</p>;
  }
}
