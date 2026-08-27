"use client";

/**
 * Search body layout: the page shell owns the flat background; the search
 * field and result cards are shared pane surfaces. Connector geometry follows
 * the same max-width row and pane inset as those surfaces.
 */

import { useDeferredValue, useMemo, useState } from "react";
import { css } from "../../../styled-system/css";
import { BlogPost } from "../../../lib/blogs";
import {
  buildProfileSearchTree,
  filterProfileSearchTree,
} from "../../../lib/profileNavigation";
import { ProfileSearchTree } from "./ProfileSearchTree";
import { PaneChild } from "../shared/PaneChild";
import { TreeFrame, TreeRootConnector } from "./TreeLines";

export const SearchWrapper = ({ posts }: { posts: BlogPost[] }) => {
  const [search, setSearch] = useState("");
  const deferredSearch = useDeferredValue(search);
  const searchTree = useMemo(() => buildProfileSearchTree(posts), [posts]);

  const filteredTree = useMemo(
    () => filterProfileSearchTree(searchTree, deferredSearch),
    [searchTree, deferredSearch],
  );

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
        <TreeFrame inset={false} data-testid="search-root-shell">
          <PaneChild className={css({ w: "full" })}>
            <input
              data-testid="search-root-input"
              type="text"
              placeholder="Search blogs..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
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
        </TreeFrame>
      </div>

      {filteredTree.length > 0 ? (
        <div
          data-testid="search-root-connector-row"
          className={css({
            w: "full",
            h: "6",
            display: "flex",
            justifyContent: "center",
            flexShrink: 0,
            pointerEvents: "none",
          })}
        >
          <TreeFrame
            data-testid="search-root-connector-content"
            className={css({
              h: "full",
            })}
          >
            <TreeRootConnector />
          </TreeFrame>
        </div>
      ) : null}

      <div
        className={css({
          flex: 1,
          minH: 0,
          containerType: "inline-size",
        })}
      >
        <div
          data-testid="search-results-scroll-region"
          className={css({
            h: "full",
            overflowY: "auto",
            overflowX: "hidden",
            // Classic scrollbars otherwise move an auto-centered result frame by
            // half their width while the fixed connector above stays put. Only
            // reserve both edges once the 800px frame still fits between them.
            scrollbarGutter: "auto",
            "@/searchTreeFrame": {
              scrollbarGutter: "stable both-edges",
            },
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
            <TreeFrame inset={false}>
              <PaneChild
                className={css({
                  w: "full",
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
            </TreeFrame>
          )}
        </div>
      </div>
    </div>
  );
};
