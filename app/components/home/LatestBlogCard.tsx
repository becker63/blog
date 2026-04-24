import { Suspense } from "react";
import Image from "next/image";
import { Loading } from "../shared/Loading";
import { DescriptionTags, tags } from "../search/Badges";
import Link from "next/link";
import { css } from "../../../styled-system/css";
import { getAllPosts, BlogPost } from "../../../lib/blogs";

/* ------------------------- */
/* Utilities                 */
/* ------------------------- */

const clampTitle = css({
  display: "-webkit-box",
  WebkitLineClamp: 2,
  overflow: "hidden",
});

const formatFullDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const formatRelative = (date: Date) => {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) {
    return `${diffDays} day${diffDays !== 1 ? "s" : ""} ago`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    return `${diffMonths} month${diffMonths !== 1 ? "s" : ""} ago`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} year${diffYears !== 1 ? "s" : ""} ago`;
};

const isNew = (date: Date) => {
  const diffMs = Date.now() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  return diffDays < 14;
};

/* ------------------------- */
/* Loading                   */
/* ------------------------- */

const LoadingLatest = () => (
  <div
    className={css({
      w: "full",
      h: "full",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    })}
  >
    <Loading fontsize={30} />
  </div>
);

/* ------------------------- */
/* Blog Row                  */
/* ------------------------- */

interface BlogRowProps {
  blog: BlogPost;
}

const BlogRow = ({ blog }: BlogRowProps) => {
  const tagBadges = DescriptionTags(blog.meta.tags as tags[]);

  return (
    <li>
      <Link
        href={`/Blogs/${blog.slug}`}
        className={css({
          display: "flex",
          gap: "4",
          alignItems: "flex-start",
          py: "3",
        })}
      >
        <div
          className={css({
            flex: 1,
            minW: 0,
            display: "flex",
            flexDirection: "column",
            gap: "2",
          })}
        >
          {/* Title */}
          <h3
            className={
              css({
                fontSize: "xl",
                fontWeight: "bold",
                color: "white",
              }) +
              " " +
              clampTitle
            }
          >
            {blog.meta.title}
          </h3>

          {/* Metadata Row */}
          <div
            className={css({
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "2",
              fontSize: "sm",
            })}
          >
            <span
              className={css({
                color: "blue.300",
                fontWeight: "medium",
              })}
            >
              {formatFullDate(blog.meta.date)}
            </span>

            <span
              className={css({
                color: "gray.500",
                fontSize: "xs",
              })}
            >
              • {formatRelative(blog.meta.date)}
            </span>

            {isNew(blog.meta.date) && (
              <span
                className={css({
                  color: "green.400",
                  fontSize: "xs",
                  fontWeight: "medium",
                  letterSpacing: "wide",
                })}
              >
                • New
              </span>
            )}
          </div>

          {/* Description */}
          <p
            className={css({
              color: "gray.400",
              fontSize: "sm",
              lineHeight: "relaxed",
            })}
          >
            {blog.meta.description}
          </p>

          {/* Tags */}
          <div
            className={css({
              display: { base: "none", lg: "flex" },
              flexWrap: "wrap",
              gap: "1",
              minH: "24px",
              opacity: 0,
              transition: "opacity 0.2s ease-in-out",
              _groupHover: { opacity: 1 },
            })}
          >
            {tagBadges}
          </div>
        </div>

        {/* Optional Image */}
        {blog.meta.image && (
          <div
            className={css({
              flexShrink: 0,
              width: { base: "90px", lg: "110px" },
              height: "90px",
              position: "relative",
              borderRadius: "sm",
              overflow: "hidden",
            })}
          >
            <Suspense fallback={<LoadingLatest />}>
              <Image
                src={blog.meta.image}
                alt={blog.meta.title}
                fill
                style={{ objectFit: "cover" }}
              />
            </Suspense>
          </div>
        )}
      </Link>
    </li>
  );
};

/* ------------------------- */
/* Fetch Blogs               */
/* ------------------------- */

const FetchBlogs = async () => {
  const blogs = getAllPosts().slice(0, 3);

  return (
    <ul
      className={css({
        flex: 1,
        minH: 0,
        overflowY: "auto",
        display: "flex",
        flexDirection: "column",
        gap: "4",

        /* Scrollbar styling */
        scrollbarWidth: "thin",
        scrollbarColor: "#444 transparent",

        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#333",
          borderRadius: "9999px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#555",
        },
      })}
    >
      {blogs.map((blog) => (
        <BlogRow blog={blog} key={blog.slug} />
      ))}
    </ul>
  );
};

/* ------------------------- */
/* Latest Card               */
/* ------------------------- */

export const LatestBlogCard = () => {
  return (
    <div
      className={css({
        px: { sm: "20", lg: "5", base: "5" },
        py: "5",
        h: "f l",
        minH: 0,
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      })}
    >
      <h3
        className={css({
          fontSize: "2xl",
          fontWeight: "bold",
          color: "blue.300",
        })}
      >
        Latest
      </h3>

      <hr className={css({ my: "5" })} />

      <div
        className={css({
          flex: 1,
          minH: 0,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        })}
      >
        <Suspense fallback={<LoadingLatest />}>
          <FetchBlogs />
        </Suspense>
      </div>
    </div>
  );
};
