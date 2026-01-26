import { motion } from "framer-motion";
import { css } from "../../../styled-system/css";
import Link from "next/link";
import Image from "next/image";
import { BlogPost } from "../../../lib/blogs";
import { DescriptionTags, tags } from "./Badges";

export const BlogCard = ({ blog }: { blog: BlogPost }) => {
  const DescripTags = DescriptionTags(blog.meta.tags as tags[]);
  const hasImage = blog.meta.image !== undefined;

  const truncatedDesc =
    blog.meta.description.length > 100
      ? blog.meta.description.slice(0, 100) + "..."
      : blog.meta.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 0.7, y: 0 }} // 👈 animate to your glass opacity
      exit={{ opacity: 0, y: 12 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className={css({
        flex: 1,
        minW: 0,
        color: "gray.800",
        px: "5",
        py: "5",
        borderRadius: "10px",
        boxShadow: "#00000F 0 0 10px",
        bg: "#000000",
      })}
    >
      <Link href={"/Blogs/" + blog.slug} className={css({ display: "block" })}>
        <div className={css({ display: "flex", flexDirection: "column" })}>
          <h3
            className={css({
              fontSize: "xl",
              fontWeight: "bold",
              color: "white",
              mb: "1",
            })}
          >
            {blog.meta.title}
          </h3>

          <p className={css({ color: "gray.400", mb: "2" })}>{truncatedDesc}</p>

          <div
            className={css({
              display: "flex",
              flexWrap: "wrap",
              alignItems: "center",
              gap: "2",
            })}
          >
            <span className={css({ color: "gray.200", fontSize: "sm" })}>
              {blog.meta.date}
            </span>
            <div>{DescripTags}</div>
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
              alt="blogcontent"
              width={200}
              height={200}
            />
          </div>
        )}
      </Link>
    </motion.div>
  );
};
