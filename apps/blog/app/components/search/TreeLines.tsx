import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";
import { PaneParent } from "../shared/PaneChild";

/** Rendered value of Panda spacing `6`; retained for browser contracts. */
export const SEARCH_ROOT_CATEGORY_GAP_PX = 24;

const FULL_ROW_GAP = "var(--spacing-6)";
const HALF_ROW_GAP = "calc(var(--spacing-6) / 2)";
const NODE_CONTENT_INSET = "var(--spacing-5)";
const LINE_WIDTH = "1px";
const HALF_LINE_WIDTH = "0.5px";
const BRANCH_LENGTH = "28px";

/** Quiet enough to sit behind the pane surfaces while remaining legible. */
const TREE_LINE_COLOR = "rgba(255, 255, 255, 0.58)";

const TREE_COLUMN_WIDTH = BRANCH_LENGTH;
const TREE_NODE_MAX_WIDTH = "800px";

const frameClass = css({
  w: "full",
  maxW: TREE_NODE_MAX_WIDTH,
  mx: "auto",
});

const insetFrameClass = css({
  ps: "5",
  boxSizing: "border-box",
});

type TreeFrameProps = ComponentPropsWithoutRef<"div"> & {
  /** Rail frames use the shared pane-content inset; surface frames do not. */
  inset?: boolean;
};

/**
 * The one horizontal coordinate system used by the input, root connector, and
 * result tree. Keeping max-width and rail inset here prevents independently
 * centered rows from drifting when their containing layout changes.
 */
export function TreeFrame({
  children,
  className,
  inset = true,
  ...rest
}: TreeFrameProps) {
  return (
    <div
      {...rest}
      data-tree-frame=""
      className={cx(frameClass, inset ? insetFrameClass : undefined, className)}
    >
      {children}
    </div>
  );
}

const TreeGutter = ({ children }: { children?: ReactNode }) => (
  <div
    aria-hidden="true"
    className={css({
      position: "relative",
      alignSelf: "stretch",
      minH: 0,
      pointerEvents: "none",
    })}
  >
    {children}
  </div>
);

const VerticalSegment = ({
  showTop,
  showBottom,
  topExtension = HALF_ROW_GAP,
  bottomExtension = HALF_ROW_GAP,
}: {
  showTop: boolean;
  showBottom: boolean;
  topExtension?: string;
  bottomExtension?: string;
}) =>
  showTop || showBottom ? (
    <div
      data-testid="tree-branch-vertical-line"
      className={css({
        position: "absolute",
        insetInlineStart: 0,
        width: LINE_WIDTH,
        bg: TREE_LINE_COLOR,
      })}
      style={{
        top: showTop ? `calc(-1 * ${topExtension})` : "50%",
        bottom: showBottom ? `calc(-1 * ${bottomExtension})` : "50%",
      }}
    />
  ) : null;

const TreeBranch = ({
  showTop,
  showBottom,
  topExtension,
  bottomExtension,
}: {
  showTop: boolean;
  showBottom: boolean;
  topExtension?: string;
  bottomExtension?: string;
}) => (
  <TreeGutter>
    <VerticalSegment
      showTop={showTop}
      showBottom={showBottom}
      topExtension={topExtension}
      bottomExtension={bottomExtension}
    />
    <div
      data-testid="tree-branch-horizontal-line"
      className={css({
        position: "absolute",
        height: LINE_WIDTH,
        bg: TREE_LINE_COLOR,
      })}
      style={{
        top: `calc(50% - ${HALF_LINE_WIDTH})`,
        insetInlineStart: LINE_WIDTH,
        width: `calc(${BRANCH_LENGTH} - ${LINE_WIDTH})`,
      }}
    />
  </TreeGutter>
);

type TreeBranchRowProps = ComponentPropsWithoutRef<"div"> & {
  showTop: boolean;
  showBottom: boolean;
  topExtension?: string;
  bottomExtension?: string;
};

/** A node row whose branch and content always share the same grid tracks. */
function TreeBranchRow({
  children,
  className,
  style,
  showTop,
  showBottom,
  topExtension,
  bottomExtension,
  ...rest
}: TreeBranchRowProps) {
  return (
    <div
      {...rest}
      className={cx(
        css({
          display: "grid",
          w: "full",
          minW: 0,
        }),
        className,
      )}
      style={{
        ...style,
        gridTemplateColumns: `${TREE_COLUMN_WIDTH} minmax(0, 1fr)`,
      }}
    >
      <TreeBranch
        showTop={showTop}
        showBottom={showBottom}
        topExtension={topExtension}
        bottomExtension={bottomExtension}
      />
      {children}
    </div>
  );
}

type TreeCategoryRowProps = ComponentPropsWithoutRef<"div"> & {
  terminal: boolean;
};

/** Category branch; only the final category terminates the root rail. */
export function TreeCategoryRow({
  children,
  terminal,
  ...rest
}: TreeCategoryRowProps) {
  return (
    <TreeBranchRow
      {...rest}
      showTop={terminal}
      showBottom={false}
      topExtension="0px"
    >
      {children}
    </TreeBranchRow>
  );
}

type TreeChildRowProps = ComponentPropsWithoutRef<"div"> & {
  first: boolean;
  last: boolean;
};

/** Child branch with run-ins derived from the real pane-stack gap. */
export function TreeChildRow({
  children,
  first,
  last,
  ...rest
}: TreeChildRowProps) {
  return (
    <TreeBranchRow
      {...rest}
      showTop={true}
      showBottom={!last}
      topExtension={first ? FULL_ROW_GAP : HALF_ROW_GAP}
      bottomExtension={HALF_ROW_GAP}
    >
      {children}
    </TreeBranchRow>
  );
}

/** Stable line from the search pane to the scroll-region boundary. */
export const TreeRootConnector = () => (
  <div
    aria-hidden="true"
    className={css({
      position: "relative",
      h: "full",
      width: TREE_COLUMN_WIDTH,
      pointerEvents: "none",
    })}
  >
    <div
      data-testid="tree-root-vertical-line"
      className={css({
        position: "absolute",
        insetInlineStart: 0,
        top: 0,
        bottom: 0,
        width: LINE_WIDTH,
        bg: TREE_LINE_COLOR,
      })}
    />
  </div>
);

type TreeGroupProps = ComponentPropsWithoutRef<"div"> & {
  continues: boolean;
};

/** A category subtree and its root-rail continuation through the real pane gap. */
export function TreeGroup({
  children,
  className,
  continues,
  ...rest
}: TreeGroupProps) {
  return (
    <div
      {...rest}
      className={cx(
        css({
          position: "relative",
          w: "full",
          minW: 0,
        }),
        className,
      )}
    >
      {continues ? (
        <div
          data-testid="tree-group-root-rail"
          aria-hidden="true"
          className={css({
            position: "absolute",
            zIndex: 0,
            insetInlineStart: 0,
            top: 0,
            width: LINE_WIDTH,
            bg: TREE_LINE_COLOR,
            pointerEvents: "none",
          })}
          style={{ bottom: `calc(-1 * ${FULL_ROW_GAP})` }}
        />
      ) : null}
      {children}
    </div>
  );
}

type TreeChildListProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  children: ReactNode;
};

/**
 * The nested pane stack. Its rail aligns with the parent pane's content inset,
 * so category padding and tree indentation cannot diverge independently.
 */
export function TreeChildList({
  children,
  className,
  style,
  ...rest
}: TreeChildListProps) {
  return (
    <div
      {...rest}
      className={cx(
        css({
          position: "relative",
          mt: "6",
          minW: 0,
        }),
        className,
      )}
      style={{
        ...style,
        marginInlineStart: `calc(${TREE_COLUMN_WIDTH} + ${NODE_CONTENT_INSET})`,
      }}
    >
      <PaneParent gap="6" className={css({ w: "full" })}>
        {children}
      </PaneParent>
    </div>
  );
}
