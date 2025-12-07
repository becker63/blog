import { Suspense } from "react";
import Image from "next/image";
import { Loading } from "../shared/Loading";
import { DescriptionTags, tags } from "../search/Badges";

import Link from "next/link";

import { css } from "../../../styled-system/css";

const LoadingCard = () => {
  return (
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
};

import { getAllPosts } from "../../../lib/blogs";

const FetchBlogs = async () => {
  const allBlogs = getAllPosts();
  const blogs = allBlogs.slice(0, 3);

  return (
    <ul className={css({ overflowY: "auto", flex: 1, minH: 0 })}>
      {blogs.map((blog) => {
        const descomp = DescriptionTags(
          blog.meta.description.replace(" ", "").split(",") as tags[]
        );
        return (
          <Link
            href={"/Blogs/" + blog.slug}
            className={css({
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              color: "gray.800",
              mb: "3",
              overflow: "hidden", // Changed from scroll to hidden
              textOverflow: "ellipsis",
              wordBreak: "break-word",
            })}
            key={blog.slug}
          >
            <div className={css({ display: "flex", flexDirection: "column", maxW: "120" })}>
              <div>
                <h3 className={css({ fontSize: "2xl", fontWeight: "bold", color: "white" })}>
                  {blog.meta.title}
                </h3>
                <p className={css({ color: "gray.400" })}>{blog.meta.description}</p>
              </div>

              <div>
                <p className={css({ color: "gray.200" })}>{blog.meta.date}</p>
                <div>{descomp}</div>
              </div>
            </div>

            {!(blog.meta.image === undefined) ? <>
              <Suspense fallback={LoadingCard()}>
                <Image
                  src={blog.meta.image}
                  alt="blogcontent"
                  width={200}
                  height={200}
                  className=""
                />
              </Suspense>
            </> : <></>}
          </Link>
        );
      })}
    </ul>
  );
};

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

export const LatestBlogCard = () => {
  return (
    <div
      className={css({
        px: { sm: "20", lg: "5", base: "5" },
        py: "5",
        h: "full",
        minH: 0, // CRITICAL: Prevents content from expanding beyond grid cell
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
      })}
    >
      <h3 className={css({ fontSize: "2xl", fontWeight: "bold", color: "blue.300" })}>Latest</h3>
      <hr className={css({ my: "5" })} />
      <div
        className={css({
          w: "full",
          flex: 1, // Take remaining space
          minH: 0, // CRITICAL: Prevents content from expanding
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          overflow: "hidden",
        })}
      >
        <Suspense fallback={<LoadingLatest />}>
          <FetchBlogs />
        </Suspense>
      </div>
    </div>
  );
};
