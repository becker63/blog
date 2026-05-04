"use client";

import React, { useDeferredValue, useMemo, useState } from "react";
import { css } from "../../../styled-system/css";
import { BlogPost } from "../../../lib/blogs";
import {
  buildProfileSearchTree,
  filterProfileSearchTree,
} from "../../../lib/profileNavigation";
import { ProfileSearchTree } from "./ProfileSearchTree";
import {
  TREE_COLUMN_WIDTH,
  TREE_NODE_MAX_WIDTH,
  TREE_PARENT_CONTENT_MAX_WIDTH,
  TREE_PARENT_ROW_OFFSET,
  TreeRootConnector,
  TREE_ROOT_GAP_WIDTH,
} from "./TreeLines";

export const SearchWrapper = ({ posts }: { posts: BlogPost[] }) => {
  const ROOT_CATEGORY_GAP_PX = 12;
  const [search, setSearch] = useState("");
  const [showRootConnectorLine, setShowRootConnectorLine] = useState(true);
  const deferredSearch = useDeferredValue(search);
  const searchTree = useMemo(() => buildProfileSearchTree(posts), [posts]);

  const filteredTree = useMemo(
    () => filterProfileSearchTree(searchTree, deferredSearch),
    [searchTree, deferredSearch],
  );
  const rootGapOpacity = showRootConnectorLine ? 1 : 0;
  const rootGapHeight = showRootConnectorLine ? `${ROOT_CATEGORY_GAP_PX}px` : "0px";

  return (
    <div
      className={css({
        w: "full",
        display: "flex",
        flexDirection: "column",
        minH: "calc(100dvh - 82px)",
        h: "calc(100dvh - 82px)",
      })}
    >
      <div
        className={css({
          w: "full",
          display: "flex",
          justifyContent: "center",
          flexShrink: 0,
        })}
      >
        <div
          data-testid="search-root-shell"
          className={css({
            w: "full",
            maxW: TREE_NODE_MAX_WIDTH,
          })}
        >
          <input
            data-testid="search-root-input"
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={css({
              w: "100%",
              p: "5",
              bg: "rgba(0, 0, 0, 0.82)",
              borderRadius: "10px",
              boxShadow: "0 0 4px rgba(0, 0, 15, 0.35)",
              backdropFilter: "blur(10px)",
              color: "white",
              outline: "none",
              fontSize: "xl",
              _focus: {
                borderColor: "white",
                boxShadow: "0 0 15px rgba(255,255,255,0.4)",
              },
              transition: "all 0.3s ease",
            })}
          />
        </div>
      </div>

      {filteredTree.length > 0 ? (
        <div
          data-testid="search-root-connector-row"
          className={css({
            w: "full",
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
            bg: "transparent",
            backdropFilter: "none",
            pointerEvents: "none",
            overflow: "hidden",
          })}
          style={{ opacity: rootGapOpacity, height: rootGapHeight }}
        >
          <div
            data-testid="search-root-connector-content"
            className={css({
              display: "flex",
              flexDirection: "row",
              h: "full",
              bg: "transparent",
              backdropFilter: "none",
              pointerEvents: "none",
              justifyContent: "flex-start",
            })}
            style={{
              width: `calc(100% - ${TREE_PARENT_ROW_OFFSET})`,
              maxWidth: TREE_PARENT_CONTENT_MAX_WIDTH,
              marginLeft: TREE_PARENT_ROW_OFFSET,
              opacity: rootGapOpacity,
              height: rootGapHeight,
            }}
          >
            {showRootConnectorLine ? <TreeRootConnector /> : null}
            <div
              aria-hidden="true"
              className={css({
                flexShrink: 0,
                bg: "transparent",
                pointerEvents: "none",
              })}
              style={{
                width: `calc(${TREE_ROOT_GAP_WIDTH} - ${TREE_COLUMN_WIDTH})`,
              }}
            />
          </div>
        </div>
      ) : null}

      <div
        data-testid="search-results-scroll-region"
        onScroll={(event) => {
          setShowRootConnectorLine(event.currentTarget.scrollTop <= ROOT_CATEGORY_GAP_PX);
        }}
        className={css({
          flex: 1,
          minH: 0,
          overflowY: "auto",
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
        {filteredTree.length > 0 ? (
          <ProfileSearchTree tree={filteredTree} query={deferredSearch} />
        ) : (
          <div
            className={css({
              display: "flex",
              justifyContent: "center",
              w: "full",
            })}
          >
            <div
              className={css({
                w: "full",
                maxW: TREE_NODE_MAX_WIDTH,
              })}
            >
              <p
                className={css({
                  color: "gray.400",
                  fontSize: "sm",
                  lineHeight: "1.8",
                })}
              >
                No matching entries.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
