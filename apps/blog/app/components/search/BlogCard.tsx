import { motion } from "framer-motion";
import { css } from "../../../styled-system/css";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "../../../lib/blogs";
import { DescriptionTags, tags } from "./Badges";
import { PaneChild } from "../shared/PaneChild";

/* ------------------------- */
/* Date Utilities            */
/* ------------------------- */

const formatFullDate = (date: Date) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

const formatRelative = (date: Date) => {
  const diff = Date.now() - date.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return "0 days ago";
  if (days === 1) return "1 day ago";
  if (days < 365) return `${days} days ago`;

  const years = Math.floor(days / 365);
  return `${years} year${years !== 1 ? "s" : ""} ago`;
};

const isNew = (date: Date) => {
  const diff = Date.now() - date.getTime();
  return diff < 1000 * 60 * 60 * 24 * 14;
};

/* ------------------------- */
/* Component                 */
/* ------------------------- */

export const BlogCard = ({ blog }: { blog: BlogPost }) => {
  const tagBadges = DescriptionTags(blog.meta.tags as tags[]);
  const hasImage = blog.meta.image !== undefined;

  const truncatedDesc =
    blog.meta.description.length > 500
      ? blog.meta.description.slice(0, 120) + "..."
      : blog.meta.description;

  return (
    <motion.div
      data-testid="search-tree-child-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={css({
        flex: 1,
        minW: 0,
      })}
    >
      <PaneChild className={css({ minW: 0, w: "full" })}>
      <Link href={`/Blogs/${blog.slug}`} className={css({ display: "block" })}>
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "2",
          })}
        >
          {/* Title */}
          <h3
            className={css({
              fontSize: "xl",
              fontWeight: "bold",
              color: "white",
            })}
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
                  px: "2",
                  py: "0.5",
                  borderRadius: "full",
                  bg: "green.500/20",
                  color: "green.300",
                  fontSize: "xs",
                  fontWeight: "medium",
                })}
              >
                New
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
            {truncatedDesc}
          </p>

          {/* Tags */}
          <div
            className={css({
              display: "flex",
              flexWrap: "wrap",
              gap: "1",
              mt: "1",
            })}
          >
            {tagBadges}
          </div>
        </div>

        {hasImage && (
          <div
            className={css({
              display: "flex",
              justifyContent: "center",
              mt: "3",
            })}
          >
            <Image
              src={blog.meta.image!}
              alt={blog.meta.title}
              width={200}
              height={200}
            />
          </div>
        )}
      </Link>
      </PaneChild>
    </motion.div>
  );
};
