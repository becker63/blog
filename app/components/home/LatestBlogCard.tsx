import { Suspense } from "react";
import Image from "next/image";
import { Loading } from "../shared/Loading";
import { DescriptionTags, tags } from "../search/Badges";
import Link from "next/link";
import { css } from "../../../styled-system/css";
import { getAllPosts } from "../../../lib/blogs";

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

const FetchBlogs = async () => {
  const allBlogs = getAllPosts();
  const blogs = allBlogs.slice(0, 3);

  return (
    <ul className={css({ overflowY: "auto", flex: 1, minH: 0 })}>
      {blogs.map((blog) => {
        const tagBadges = DescriptionTags(blog.meta.tags as tags[]);

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
              overflow: "hidden",
              textOverflow: "ellipsis",
              wordBreak: "break-word",
            })}
            key={blog.slug}
            data-group
          >
            {blog.meta.image ? (
              <>
                <div
                  className={css({
                    display: "flex",
                    flexDirection: "column",
                    maxW: "120",
                    gap: "2",
                  })}
                >
                  <div>
                    <h3
                      className={css({
                        fontSize: "xl",
                        fontWeight: "bold",
                        color: "white",
                      })}
                    >
                      {blog.meta.title}
                    </h3>
                    <p className={css({ color: "gray.400" })}>
                      {blog.meta.date}
                    </p>

                    {/* MOBILE DESCRIPTION */}
                    <p
                      className={css({
                        display: { base: "block", lg: "none" },
                        color: "gray.400",
                        fontSize: "sm",
                        mt: "1",
                        lineHeight: "short",
                      })}
                    >
                      {blog.meta.description}
                    </p>
                  </div>

                  {/* DESKTOP TAGS */}
                  <div
                    className={css({
                      display: { base: "none", lg: "flex" },
                      flexWrap: "wrap",
                      gap: "1",
                      opacity: 0,
                      transition: "opacity 0.2s ease-in-out",
                      _groupHover: { opacity: 1 },
                    })}
                  >
                    {tagBadges}
                  </div>
                </div>

                <Suspense fallback={LoadingCard()}>
                  <Image
                    src={blog.meta.image}
                    alt="blogcontent"
                    width={200}
                    height={200}
                  />
                </Suspense>
              </>
            ) : (
              <div
                className={css({
                  display: "flex",
                  flexDirection: "column",
                  flex: 1,
                  gap: "1",
                })}
              >
                <div
                  className={css({
                    display: "flex",
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  })}
                >
                  <h3
                    className={css({
                      fontSize: "xl",
                      fontWeight: "bold",
                      color: "white",
                    })}
                  >
                    {blog.meta.title}
                  </h3>
                  <p className={css({ color: "gray.400" })}>{blog.meta.date}</p>
                </div>

                {/* MOBILE DESCRIPTION */}
                <p
                  className={css({
                    display: { base: "block", lg: "none" },
                    color: "gray.400",
                    fontSize: "sm",
                    lineHeight: "short",
                  })}
                >
                  {blog.meta.description}
                </p>

                {/* DESKTOP TAGS */}
                <div
                  className={css({
                    display: { base: "none", lg: "flex" },
                    flexWrap: "wrap",
                    gap: "1",
                    opacity: 0,
                    transition: "opacity 0.2s ease-in-out",
                    _groupHover: { opacity: 1 },
                  })}
                >
                  {tagBadges}
                </div>
              </div>
            )}
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
          w: "full",
          flex: 1,
          minH: 0,
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
