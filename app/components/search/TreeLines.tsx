import { css } from "../../../styled-system/css";
import { motion } from "framer-motion";

/** Panda spacing token: same vertical gap everywhere on Search (root, sections, parent→children, siblings). */
export const SEARCH_TREE_VERTICAL_GAP = "6";

/**
 * Root spacer under the search field (px). Keep equal to theme spacing for
 * {@link SEARCH_TREE_VERTICAL_GAP} (default preset: `6` → 24px).
 */
export const SEARCH_ROOT_CATEGORY_GAP_PX = 24;

const LAYOUT_GAP_PX = 14;
const FULL_LAYOUT_GAP = `${LAYOUT_GAP_PX}px`;

/** Default vertical run-in (px string) for TreeBranch / TreeIndent segments. */
export const TREE_BRANCH_RUN_IN_GAP = FULL_LAYOUT_GAP;

const LINE_WIDTH = "1.5px";
const BRANCH_LENGTH = "28px";

/** Reads white on the shell without harsh pure #fff. */
export const TREE_LINE_COLOR = "rgba(255, 255, 255, 0.88)";

export const TREE_ROOT_GAP_WIDTH = "64px";
export const TREE_COLUMN_WIDTH = `calc(0px + ${BRANCH_LENGTH})`;
export const TREE_NODE_MAX_WIDTH = "800px";
export const TREE_PARENT_ROW_MAX_WIDTH = TREE_NODE_MAX_WIDTH;
export const TREE_CHILD_ROW_MAX_WIDTH = TREE_NODE_MAX_WIDTH;
export const TREE_PARENT_ROW_OFFSET = "22px";
/** Horizontal space between child indent column and branch column (grid lane). */
export const TREE_CHILD_BRANCH_GAP = "22px";
export const TREE_PARENT_CONTENT_MAX_WIDTH = `calc(${TREE_PARENT_ROW_MAX_WIDTH} - ${TREE_PARENT_ROW_OFFSET})`;
export const TREE_CHILD_CONTENT_MAX_WIDTH = `calc(${TREE_CHILD_ROW_MAX_WIDTH} - ${TREE_PARENT_ROW_OFFSET})`;

type Props = {
  showTop: boolean;
  showBottom: boolean;
  showBranch?: boolean;
};

const TreeGutter = ({ children }: { children?: React.ReactNode }) => (
  <div
    className={css({
      flexShrink: 0,
      width: TREE_COLUMN_WIDTH,
      position: "relative",
      pointerEvents: "none",
    })}
  >
    {children}
  </div>
);

const VerticalSegment = ({
  showTop,
  showBottom,
  topExtension = FULL_LAYOUT_GAP,
  bottomExtension = FULL_LAYOUT_GAP,
  testId,
}: {
  showTop: boolean;
  showBottom: boolean;
  topExtension?: string;
  bottomExtension?: string;
  testId?: string;
}) =>
  showTop || showBottom ? (
    <motion.div
      data-testid={testId}
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        transformOrigin: "top",
        position: "absolute",
        left: 0,
        width: LINE_WIDTH,
        background: TREE_LINE_COLOR,
        top: showTop ? `-${topExtension}` : "50%",
        bottom: showBottom ? `-${bottomExtension}` : "50%",
      }}
    />
  ) : null;

export const TreeIndent = ({ continues }: { continues: boolean }) => (
  <TreeGutter>
    <VerticalSegment
      showTop={continues}
      showBottom={continues}
      testId="tree-indent-vertical-line"
    />
  </TreeGutter>
);

export const TreeBranch = ({
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
      testId="tree-branch-vertical-line"
    />
    <motion.div
      initial={{ scaleX: 0 }}
      animate={{ scaleX: 1 }}
      transition={{ duration: 0.25, delay: 0.15 }}
      style={{
        transformOrigin: "left",
        position: "absolute",
        top: "50%",
        left: 0,
        height: LINE_WIDTH,
        width: BRANCH_LENGTH,
        background: TREE_LINE_COLOR,
      }}
    />
  </TreeGutter>
);

export const TreeRootConnector = () => (
  <TreeGutter>
    <motion.div
      data-testid="tree-root-vertical-line"
      initial={{ scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        transformOrigin: "top",
        position: "absolute",
        left: "-6px",
        top: 0,
        bottom: 0,
        width: LINE_WIDTH,
        background: TREE_LINE_COLOR,
      }}
    />
  </TreeGutter>
);

/** Vertical trunk in the gap between a parent category row and its child list (aligns with parent TreeBranch). */
export const TreeParentChildGapConnector = () => (
  <TreeGutter>
    <div
      data-testid="tree-section-gap-vertical"
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        bottom: 0,
        width: LINE_WIDTH,
        background: TREE_LINE_COLOR,
      }}
    />
  </TreeGutter>
);

export const TreeLines = ({ showTop, showBottom, showBranch = true }: Props) =>
  showBranch ? (
    <TreeBranch showTop={showTop} showBottom={showBottom} />
  ) : (
    <TreeIndent continues={showTop || showBottom} />
  );
