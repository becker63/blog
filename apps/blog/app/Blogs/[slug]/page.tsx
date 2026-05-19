"server-only";
export const dynamic = "force-static";
export const revalidate = false;

import React from "react";
import { css } from "../../../styled-system/css";
import { glassPanelShellStyles, blogArticleShellStyles } from "../../components/shared/GlassCard";
import { getAllPosts, getPostBySlug } from "../../../lib/blogs";
import { MDXRemote } from "next-mdx-remote/rsc";
import { mdxOptions } from "../../../lib/mdx";
import "highlight.js/styles/atom-one-dark.css";
import { Aside } from "../../components/shared/Aside";
import { blogContentProseClass } from "../../components/shared/blogContentProseStyles";
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
          ...blogArticleShellStyles,
        })}
      >
        <div data-testid="blog-post-prose" className={blogContentProseClass}>
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
          <MDXRemote
            source={blog.content}
            options={mdxOptions}
            components={{
              Aside,
            }}
          />
        </div>
      </div>
    );
  } catch (error) {
    console.error(error);
    return <p>something broke or this blog doesnt exist :/</p>;
  }
}
