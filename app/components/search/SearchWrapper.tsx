"use client";

import React, { useDeferredValue, useMemo, useState } from "react";
import { css } from "../../../styled-system/css";
import { BlogPost } from "../../../lib/blogs";
import {
  buildProfileSearchTree,
  filterProfileSearchTree,
} from "../../../lib/profileNavigation";
import { ProfileSearchTree } from "./ProfileSearchTree";
import { PaneChild } from "../shared/PaneChild";
import {
  TREE_COLUMN_WIDTH,
  TREE_NODE_MAX_WIDTH,
  TREE_PARENT_CONTENT_MAX_WIDTH,
  TREE_PARENT_ROW_OFFSET,
  TreeRootConnector,
  TREE_ROOT_GAP_WIDTH,
  SEARCH_ROOT_CATEGORY_GAP_PX,
} from "./TreeLines";

export const SearchWrapper = ({ posts }: { posts: BlogPost[] }) => {
  const ROOT_CATEGORY_GAP_PX = SEARCH_ROOT_CATEGORY_GAP_PX;
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
        flex: 1,
        minH: 0,
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
          <PaneChild className={css({ w: "full" })}>
          <input
            data-testid="search-root-input"
            type="text"
            placeholder="Search blogs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={css({
              w: "100%",
              p: "3",
              bg: "transparent",
              borderRadius: "8px",
              color: "white",
              outline: "none",
              fontSize: "xl",
              _focus: {
                boxShadow: "0 0 0 1px rgba(255,255,255,0.25)",
              },
              transition: "box-shadow 0.2s ease",
            })}
          />
          </PaneChild>
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
            <PaneChild
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
            </PaneChild>
          </div>
        )}
      </div>
    </div>
  );
};
