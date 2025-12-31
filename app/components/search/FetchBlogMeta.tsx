"use client";

import Link from "next/link";
import Image from "next/image";
import { DescriptionTags, tags } from "./Badges";
import React from "react";
import { BlogPost } from "../../../lib/blogs";
import { css } from "../../../styled-system/css";

// Layout gap size - this should match 'layout' token value
const LAYOUT_GAP = "12px";

export const Fetchblogmeta = ({ posts }: { posts: BlogPost[] }) => {
  const blogs = posts;

  /**
   * Blog card inner content - compact by default, expands on hover
   * Uses CSS group hover for reliable hover detection
   */
  const InnerCard = ({ blog }: { blog: BlogPost }) => {
    const blogTags = blog.meta.tags;
    const DescripTags = DescriptionTags(blogTags as tags[]);
    const hasImage = blog.meta.image !== undefined;

    // Truncate description to ~100 characters
    const truncatedDesc = blog.meta.description.length > 100
      ? blog.meta.description.slice(0, 100) + "..."
      : blog.meta.description;

    return (
      <Link
        href={"/Blogs/" + blog.slug}
        className={css({
          display: "block",
          // Using CSS custom properties for hover state transitions
          "& .expanded-content": {
            maxHeight: "0",
            opacity: 0,
            overflow: "hidden",
            transition: "max-height 0.3s ease-in-out, opacity 0.3s ease-in-out",
          },
          "& .truncated-desc": {
            display: "block",
            transition: "opacity 0.2s ease-in-out",
          },
          "& .full-desc": {
            display: "none",
            opacity: 0,
            transition: "opacity 0.2s ease-in-out",
          },
          _hover: {
            "& .expanded-content": {
              maxHeight: "500px",
              opacity: 1,
            },
            "& .truncated-desc": {
              display: "none",
            },
            "& .full-desc": {
              display: "block",
              opacity: 1,
            },
          },
        })}
      >
        {/* Always visible: title, tags, date */}
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

          {/* Description - truncated by default, full on hover */}
          <p className={`truncated-desc ${css({ color: "gray.400", mb: "2" })}`}>
            {truncatedDesc}
          </p>
          <p className={`full-desc ${css({ color: "gray.400", mb: "2" })}`}>
            {blog.meta.description}
          </p>

          {/* Tags and date - always visible */}
          <div className={css({ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "2" })}>
            <span className={css({ color: "gray.200", fontSize: "sm" })}>{blog.meta.date}</span>
            <div>{DescripTags}</div>
          </div>
        </div>

        {/* Expandable content: read time and image */}
        <div
          className={`expanded-content ${css({
            mt: "3",
          })}`}
        >
          {/* Read time */}
          <div
            className={css({
              color: "gray.500",
              mb: hasImage ? "3" : "0",
            })}
          >
            <span>{blog.text}</span>
          </div>

          {/* Image */}
          {hasImage && (
            <div className={css({ display: "flex", justifyContent: "center" })}>
              <Image
                src={blog.meta.image!}
                alt="blogcontent"
                width={200}
                height={200}
              />
            </div>
          )}
        </div>
      </Link>
    );
  };



  // Build flat list of items with context
  type BlogItem = {
    blog: BlogPost;
    isFirst: boolean;
    isLast: boolean;
    isChild: boolean;
    parentContinues: boolean;
  };

  const items: BlogItem[] = [];
  blogs.forEach((blog, blogIndex) => {
    const isLastParent = blogIndex === blogs.length - 1;
    const hasChildren = blog.children && blog.children.length > 0;

    items.push({
      blog,
      isFirst: items.length === 0,
      isLast: false, // Will set properly at the end
      isChild: false,
      parentContinues: false,
    });

    if (hasChildren) {
      blog.children!.forEach((child, childIndex) => {
        items.push({
          blog: child,
          isFirst: false,
          isLast: false,
          isChild: true,
          parentContinues: !isLastParent,
        });
      });
    }
  });

  // Mark actual last item
  if (items.length > 0) {
    items[items.length - 1].isLast = true;
  }

  /**
   * BlogRow component - renders a single blog card with its tree line
   */
  const BlogRow = ({
    item,
    index,
    isLastItem,
  }: {
    item: BlogItem;
    index: number;
    isLastItem: boolean;
  }) => {
    // Determine line visibility
    const showTopLine = !item.isFirst;
    const showBottomLine = !isLastItem;

    return (
      <div
        className={css({
          display: "flex",
          justifyContent: "center",
          w: "full",
        })}
      >
        {/* Row container - strict 800px max to match search bar */}
        <div
          className={css({
            display: "flex",
            flexDirection: "row",
            w: "full",
            maxW: "800px",
          })}
        >
          {/* Tree line section - takes space within the 800px */}
          {items.length > 1 && (
            <div
              className={css({
                display: "flex",
                flexDirection: "row",
                flexShrink: 0,
                width: "20px",
                position: "relative",
                ml: item.isChild ? "20px" : "0",
                pointerEvents: "none",
              })}
            >
              {/* Parent continuation line for child items */}
              {item.isChild && item.parentContinues && (
                <div
                  className={css({
                    position: "absolute",
                    left: "-20px",
                    top: 0,
                    w: "1px",
                    bg: "white",
                  })}
                  style={{
                    height: isLastItem ? "50%" : `calc(100% + ${LAYOUT_GAP})`,
                  }}
                />
              )}

              {/* Main vertical line container */}
              <div
                className={css({
                  position: "relative",
                  w: "1px",
                  h: "full",
                })}
              >
                {showTopLine && (
                  <div
                    className={css({
                      position: "absolute",
                      top: 0,
                      left: 0,
                      w: "1px",
                      h: "50%",
                      bg: "white",
                    })}
                  />
                )}
                {showBottomLine && (
                  <div
                    className={css({
                      position: "absolute",
                      top: "50%",
                      left: 0,
                      w: "1px",
                      bg: "white",
                    })}
                    style={{
                      height: `calc(50% + ${LAYOUT_GAP})`,
                    }}
                  />
                )}
              </div>

              {/* Horizontal connector */}
              <div
                className={css({
                  position: "absolute",
                  top: "50%",
                  left: 0,
                  w: "15px",
                  h: "1px",
                  bg: "white",
                })}
              />
            </div>
          )}

          {/* Blog card - flexible, takes remaining space */}
          <div
            className={css({
              flex: 1,
              minW: 0,
              color: "gray.800",
              px: "5",
              py: "5",
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
              bg: "#000000",
            })}
          >
            <InnerCard blog={item.blog} />
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={css({
        w: "full",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      })}
    >
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          w: "full", // Allow full width so centered 800px items fit
          // Remove maxW on container since items constrain themselves
          alignItems: "center", // Center the items
          gap: "layout",
        })}
      >
        {items.map((item, index) => (
          <BlogRow
            key={item.blog.slug}
            item={item}
            index={index}
            isLastItem={index === items.length - 1}
          />
        ))}
      </div>
    </div>
  );
};
