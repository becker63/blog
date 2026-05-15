import { css } from "../../../styled-system/css";
import { SearchTreeParent } from "../../../lib/profileNavigation";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronDown,
  faChevronRight,
  faDiagramProject,
  faShield,
} from "@fortawesome/free-solid-svg-icons";
import { PaneChild } from "../shared/PaneChild";

const glyphIconMap = {
  shield: faShield,
  nodes: faDiagramProject,
} as const;

export const ProfileCategoryCard = ({
  category,
  isExpanded,
  onToggle,
}: {
  category: SearchTreeParent;
  isExpanded: boolean;
  onToggle: () => void;
}) => {
  const icon = category.glyph ? glyphIconMap[category.glyph] : null;
  const collapseIcon = isExpanded ? faChevronDown : faChevronRight;

  return (
    <PaneChild
      data-testid="search-tree-parent-card"
      className={css({
        flex: 1,
        minW: 0,
      })}
    >
      <div
        className={css({
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          gap: "3",
        })}
      >
        <div
          className={css({
            minW: 0,
            display: "flex",
            flexDirection: "column",
            gap: "1.5",
            flex: 1,
          })}
        >
          <div
            className={css({
              display: "flex",
              alignItems: "flex-start",
              gap: "3",
              minW: 0,
            })}
          >
            {icon ? (
              <span
                className={css({
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  mt: "0.5",
                  color: "gray.300",
                  fontSize: "sm",
                  flexShrink: 0,
                })}
              >
                <FontAwesomeIcon icon={icon} />
              </span>
            ) : null}

            <h2
              className={css({
                color: "white",
                fontSize: "lg",
                lineHeight: "1.2",
                fontWeight: "bold",
              })}
            >
              {category.title}
            </h2>
          </div>

          <p
            className={css({
              color: "gray.400",
              fontSize: "sm",
              lineHeight: "relaxed",
              maxW: "68ch",
            })}
          >
            {category.description}
          </p>
        </div>

        <button
          type="button"
          aria-expanded={isExpanded}
          aria-label={`${isExpanded ? "Collapse" : "Expand"} ${category.title}`}
          onClick={onToggle}
          className={css({
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            w: "8",
            h: "8",
            borderRadius: "999px",
            color: "gray.300",
            _hover: {
              bg: "white/8",
              color: "white",
            },
          })}
        >
          <FontAwesomeIcon icon={collapseIcon} />
        </button>
      </div>
    </PaneChild>
  );
};
