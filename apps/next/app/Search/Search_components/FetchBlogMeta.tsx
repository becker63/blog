import Link from "next/link";
import Image from "next/image";
import { DescriptionTags, tags } from "./Badges";
import React from "react";
import { BlogPost } from "../../../lib/blogs";
import { css } from "../../../styled-system/css";

export const Fetchblogmeta = ({ posts }: { posts: BlogPost[] }) => {
  const blogs = posts;

  const topOrBottomLines = (index: number, last: number) => {
    if (index == 0) {
      return css({ h: "50%", translateY: "100%" });
    }
    if (index == last) {
      return css({ h: "50%" });
    }
    return css({ h: "100%" });
  };

  const Log = (p: { data: any }) => {
    console.log(p.data)
    return <></>
  }

  const Lines = (p: { index: number, last: number, lineLength: number, child?: boolean }) => {
    return (
      <>
        <div className={css({ opacity: 1 })}>
          {p.child == true && p.index == 0 ? (
            p.index == p.last ? (
              <div
                className={css({
                  h: "calc(50% + 20px)",
                  translateY: "-20%",
                  sm: { translateY: "-13%" },
                  md: { translateY: "-10%" },
                  lg: { translateY: "-13%" },
                  bg: "white",
                  w: "1px",
                })}
              />
            ) : (
              <div
                className={css({
                  h: "calc(100% + 20px)",
                  translateY: "-10%",
                  sm: { translateY: "-7%" },
                  md: { h: "calc(100% + 25px)", translateY: "-5%" },
                  lg: { h: "calc(100% + 25px)", translateY: "-7%" },
                  bg: "white",
                  w: "1px",
                })}
              />
            )
          ) : (
            <div className={`${topOrBottomLines(p.index, p.last)} ${css({ bg: "white", w: "1px" })}`} />
          )}
        </div>
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignContent: "center",
          })}
        >
          <div
            className={css({ h: "1px", bg: "white" })}
            style={{ width: p.lineLength.toString() + "px" }}
          />
        </div>
      </>
    );
  };

  const InnerCard = (p: { blog: BlogPost }) => {
    const blog = p.blog;
    const tags = blog.meta.tags;
    const DescripTags = DescriptionTags(tags as tags[]); // formatting tag type needed? assuming DescriptionTags works

    return (
      <Link
        href={"/Blogs/" + blog.slug}
        key={blog.slug}
        className={
          !(blog.meta.image === undefined)
            ? css({
              display: "grid",
              gridTemplateColumns: {
                base: "70% 30%",
                md: "50% 50%",
                lg: "60% 40%",
              },
            })
            : css({ display: "flex", justifyContent: "center", alignItems: "center" })
        }
      >
        <div className={css({ display: "flex", flexDirection: "column" })}>
          <div>
            <h3 className={css({ fontSize: "2xl", fontWeight: "bold", color: "white" })}>{blog.meta.title}</h3>
            <p className={css({ color: "gray.400", overflow: "scroll" })}>{blog.meta.description}</p>
          </div>

          <div
            className={css({
              display: { base: "none", sm: "flex" },
              color: "gray.500",
              flexGrow: 1,
              alignItems: "center",
              py: "4",
            })}
          >
            <span className={css({ display: "inline-block", verticalAlign: "middle" })}>{blog.text}</span>
          </div>

          <div>
            <p className={css({ color: "gray.200" })}>{blog.meta.date}</p>
            <div>{DescripTags}</div>
          </div>
        </div>

        <div className={css({ display: "flex", justifyContent: "center" })}>
          {!(blog.meta.image === undefined) ? (
            <>
              <Image src={blog.meta.image} alt="blogcontent" width={200} height={200} className="" />
            </>
          ) : (
            <></>
          )}
        </div>
      </Link>
    );
  };

  const Card = (blog: BlogPost, index: number) => {
    return (
      <>
        {/*parent*/}
        <div className={css({ display: "flex", flexDirection: "row", mx: "5" })}>
          <Lines index={index} last={blogs.length - 1} lineLength={15} />
          <div
            className={css({
              alignSelf: "center",
              color: "gray.800",
              w: { base: "90vw", sm: "80vw", md: "60vw" },
              px: "5",
              py: "5",
              mb: "5",
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
              bg: "#000000",
            })}
            key={blog.slug}
          >
            <InnerCard blog={blog} />
          </div>
        </div>
        {/* child */
          blog.children && blog.children.length !== 0 ? (
            blog.children.map((child, childindex) => {
              console.log(index, blogs.length);
              const returned = (
                <>
                  <div className={css({ display: "flex", flexDirection: "row", mx: "auto", justifyContent: "flex-end" })}>
                    {index !== blogs.length - 1 ? <div className={css({ mr: "auto", bg: "white", w: "1px" })} /> : <></>}
                    <Lines index={childindex} last={blog.children!.length - 1} lineLength={15} child={true} />
                    <div className={css({ display: "flex", flexDirection: "row", w: "85%" })} key={child.slug}>
                      <div
                        className={css({
                          alignSelf: "center",
                          color: "gray.800",
                          w: { base: "90vw", sm: "80vw", md: "60vw" },
                          px: "5",
                          py: "5",
                          mb: "5",
                          opacity: 0.7,
                          borderRadius: "10px",
                          boxShadow: "#00000F 0 0 10px",
                          bg: "#000000",
                        })}
                      >
                        <InnerCard blog={child} />
                      </div>
                    </div>
                  </div>
                </>
              );
              return returned;
            })
          ) : (
            <></>
          )}
      </>
    );
  };
  // this is a modified version of the index in map, that is set to 0 when we encounter a child
  // so that our lines will end at the right points
  const renderBlogs: React.JSX.Element[] = []

  console.log()
  for (const [index, blog] of blogs.entries()) {
    console.log(index, blog.slug)
    renderBlogs.push(Card(blog, index))
  }

  return (
    <div className={css({ w: "full", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", alignContent: "center" })}>
      <ul className={css({ display: "flex", flexDirection: "column", w: "full", justifyContent: "center", alignItems: "center", alignContent: "center" })}>
        {renderBlogs}
      </ul>
    </div>
  );
};
