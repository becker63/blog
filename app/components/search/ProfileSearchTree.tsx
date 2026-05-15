"use client";

import { useState } from "react";
import { css } from "../../../styled-system/css";
import {
  ProfileCategoryId,
  SearchTreeChild,
  SearchTreeParent,
} from "../../../lib/profileNavigation";
import { BlogCard } from "./BlogCard";
import { ProfileCategoryCard } from "./ProfileCategoryCard";
import {
  TREE_CHILD_BRANCH_GAP,
  TREE_CHILD_CONTENT_MAX_WIDTH,
  TREE_CHILD_ROW_MAX_WIDTH,
  TREE_PARENT_ROW_OFFSET,
  TREE_PARENT_CONTENT_MAX_WIDTH,
  TREE_PARENT_ROW_MAX_WIDTH,
  SEARCH_ROOT_CATEGORY_GAP_PX,
  SEARCH_TREE_VERTICAL_GAP,
  TREE_COLUMN_WIDTH,
  TREE_ROOT_GAP_WIDTH,
  TREE_BRANCH_RUN_IN_GAP,
  TreeBranch,
  TreeIndent,
  TreeParentChildGapConnector,
} from "./TreeLines";

const SearchChildNode = ({
  child,
  rootContinues,
  isFirst,
  isLast,
}: {
  child: SearchTreeChild;
  rootContinues: boolean;
  isFirst: boolean;
  isLast: boolean;
}) => {
  return (
    <div
      data-testid="search-tree-child-row"
      className={css({
        display: "flex",
        justifyContent: "center",
        w: "full",
        mt: isFirst ? 0 : SEARCH_TREE_VERTICAL_GAP,
      })}
    >
      <div
        className={css({
          w: "full",
          maxW: TREE_CHILD_ROW_MAX_WIDTH,
        })}
      >
        <div
          data-testid="search-tree-child-content"
          className={css({
            display: "flex",
            flexDirection: "row",
          })}
          style={{
            width: `calc(100% - ${TREE_PARENT_ROW_OFFSET})`,
            maxWidth: TREE_CHILD_CONTENT_MAX_WIDTH,
            marginLeft: TREE_PARENT_ROW_OFFSET,
          }}
        >
          <TreeIndent continues={rootContinues} />
          <div
            aria-hidden="true"
            className={css({
              flexShrink: 0,
            })}
            style={{ width: TREE_CHILD_BRANCH_GAP }}
          />
          <TreeBranch
            showTop={true}
            showBottom={!isLast}
            topExtension={isFirst ? "0px" : TREE_BRANCH_RUN_IN_GAP}
          />
          <BlogCard blog={child.blog} />
        </div>
      </div>
    </div>
  );
};

export const ProfileSearchTree = ({
  tree,
  query,
}: {
  tree: SearchTreeParent[];
  query: string;
}) => {
  const [expanded, setExpanded] = useState<Record<ProfileCategoryId, boolean>>({
    "security-systems": true,
    "platform-social-infrastructure": true,
  });

  const isSearching = query.trim().length > 0;

  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: SEARCH_TREE_VERTICAL_GAP,
        w: "full",
      })}
    >
      {tree.map((parent, index) => {
        // During active search, matching parents are forced open so match context
        // stays visible instead of being hidden behind collapsed state.
        const isExpanded = isSearching ? true : expanded[parent.id] ?? true;
        const showChildren = isExpanded && parent.children.length > 0;
        const isLastParent = index === tree.length - 1;

        return (
          <div
            key={parent.id}
            data-testid="search-tree-parent-group"
            className={css({
              display: "flex",
              flexDirection: "column",
              gap: "0",
            })}
          >
            <div
              id={parent.id}
              data-testid="search-tree-parent-row"
              className={css({
                scrollMarginTop: "navHeight",
                display: "flex",
                justifyContent: "center",
                w: "full",
              })}
            >
              <div
                data-testid="search-tree-parent-content"
                className={css({
                  display: "flex",
                  flexDirection: "row",
                })}
                style={{
                  width: `calc(100% - ${TREE_PARENT_ROW_OFFSET})`,
                  maxWidth: TREE_PARENT_CONTENT_MAX_WIDTH,
                  marginLeft: TREE_PARENT_ROW_OFFSET,
                }}
              >
                <TreeBranch
                  showTop={true}
                  showBottom={!isLastParent}
                  bottomExtension={showChildren ? "0px" : TREE_BRANCH_RUN_IN_GAP}
                />
                <ProfileCategoryCard
                  category={parent}
                  isExpanded={isExpanded}
                  onToggle={() =>
                    setExpanded((current) => ({
                      ...current,
                      [parent.id]: !(current[parent.id] ?? true),
                    }))
                  }
                />
              </div>
            </div>

            {showChildren ? (
              <>
                <div
                  data-testid="search-tree-section-gap-row"
                  className={css({
                    w: "full",
                    display: "flex",
                    justifyContent: "center",
                    flexShrink: 0,
                    pointerEvents: "none",
                  })}
                  style={{ height: SEARCH_ROOT_CATEGORY_GAP_PX }}
                >
                  <div
                    className={css({
                      display: "flex",
                      flexDirection: "row",
                      h: "full",
                      justifyContent: "flex-start",
                    })}
                    style={{
                      width: `calc(100% - ${TREE_PARENT_ROW_OFFSET})`,
                      maxWidth: TREE_PARENT_CONTENT_MAX_WIDTH,
                      marginLeft: TREE_PARENT_ROW_OFFSET,
                    }}
                  >
                    <TreeParentChildGapConnector />
                    <div
                      aria-hidden="true"
                      className={css({ flexShrink: 0 })}
                      style={{
                        width: `calc(${TREE_ROOT_GAP_WIDTH} - ${TREE_COLUMN_WIDTH})`,
                      }}
                    />
                  </div>
                </div>
                <div
                  className={css({
                    display: "flex",
                    flexDirection: "column",
                    gap: "0",
                  })}
                >
                  {parent.children.map((child, index) => (
                    <SearchChildNode
                      key={child.id}
                      child={child}
                      rootContinues={!isLastParent}
                      isFirst={index === 0}
                      isLast={index === parent.children.length - 1}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </div>
        );
      })}
    </div>
  );
};
