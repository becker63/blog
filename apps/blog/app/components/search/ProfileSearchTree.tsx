"use client";

import { useState } from "react";
import { css } from "../../../styled-system/css";
import {
  ProfileCategoryId,
  SearchTreeChild,
  SearchTreeParent,
} from "../../../lib/profileNavigation";
import { PaneParent } from "../shared/PaneChild";
import { BlogCard } from "./BlogCard";
import { ProfileCategoryCard } from "./ProfileCategoryCard";
import {
  TreeCategoryRow,
  TreeChildList,
  TreeChildRow,
  TreeFrame,
  TreeGroup,
} from "./TreeLines";

const SearchChildNode = ({
  child,
  isFirst,
  isLast,
}: {
  child: SearchTreeChild;
  isFirst: boolean;
  isLast: boolean;
}) => (
  <TreeChildRow
    data-testid="search-tree-child-row"
    first={isFirst}
    last={isLast}
  >
    <BlogCard blog={child.blog} />
  </TreeChildRow>
);

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
    <TreeFrame data-testid="search-tree-frame">
      <PaneParent className={css({ w: "full" })}>
        {tree.map((parent, index) => {
          // During active search, matching parents are forced open so match context
          // stays visible instead of being hidden behind collapsed state.
          const isExpanded = isSearching ? true : expanded[parent.id] ?? true;
          const showChildren = isExpanded && parent.children.length > 0;
          const isLastParent = index === tree.length - 1;

          return (
            <TreeGroup
              key={parent.id}
              data-testid="search-tree-parent-group"
              continues={!isLastParent}
            >
              <div
                id={parent.id}
                data-testid="search-tree-parent-row"
                className={css({
                  scrollMarginTop: "navHeight",
                  w: "full",
                  minW: 0,
                })}
              >
                <TreeCategoryRow
                  data-testid="search-tree-parent-content"
                  terminal={isLastParent}
                >
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
                </TreeCategoryRow>
              </div>

              {showChildren ? (
                <TreeChildList data-testid="search-tree-child-list">
                  {parent.children.map((child, childIndex) => (
                    <SearchChildNode
                      key={child.id}
                      child={child}
                      isFirst={childIndex === 0}
                      isLast={childIndex === parent.children.length - 1}
                    />
                  ))}
                </TreeChildList>
              ) : null}
            </TreeGroup>
          );
        })}
      </PaneParent>
    </TreeFrame>
  );
};
