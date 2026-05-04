import { css } from "../../../styled-system/css";
import { motion } from "framer-motion";

const LAYOUT_GAP_PX = 12;
const FULL_LAYOUT_GAP = `${LAYOUT_GAP_PX}px`;
const LINE_WIDTH = "2px";
const BRANCH_LENGTH = "32px";
export const TREE_ROOT_GAP_WIDTH = "64px";
export const TREE_COLUMN_WIDTH = `calc(0px + ${BRANCH_LENGTH})`;
export const TREE_NODE_MAX_WIDTH = "800px";
export const TREE_PARENT_ROW_MAX_WIDTH = TREE_NODE_MAX_WIDTH;
export const TREE_CHILD_ROW_MAX_WIDTH = TREE_NODE_MAX_WIDTH;
export const TREE_PARENT_ROW_OFFSET = "20px";
export const TREE_CHILD_ROW_OFFSET = "56px";
export const TREE_PARENT_CONTENT_MAX_WIDTH = `calc(${TREE_PARENT_ROW_MAX_WIDTH} - ${TREE_PARENT_ROW_OFFSET})`;
export const TREE_CHILD_CONTENT_MAX_WIDTH = `calc(${TREE_CHILD_ROW_MAX_WIDTH} - ${TREE_PARENT_ROW_OFFSET})`;
export const TREE_CHILD_BRANCH_GAP = `calc(${TREE_CHILD_ROW_OFFSET} - ${TREE_COLUMN_WIDTH})`;

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
        background: "white",
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
}: {
  showTop: boolean;
  showBottom: boolean;
}) => (
  <TreeGutter>
    <VerticalSegment
      showTop={showTop}
      showBottom={showBottom}
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
        background: "white",
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
        left: "-7px",
        top: 0,
        bottom: 0,
        width: "1.5px",
        background: "white",
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
