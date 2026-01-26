import { css } from "../../../styled-system/css";
import { motion } from "framer-motion";

const LAYOUT_GAP = "16px";
const LINE_WIDTH = "2px";
const BRANCH_LENGTH = "20px";
export const TREE_COLUMN_WIDTH = `calc(0px + ${BRANCH_LENGTH})`;

type Props = {
  showTop: boolean;
  showBottom: boolean;
};

export const TreeLines = ({ showTop, showBottom }: Props) => (
  <div
    className={css({
      flexShrink: 0,
      width: TREE_COLUMN_WIDTH,
      position: "relative",
      pointerEvents: "none",
    })}
  >
    {(showTop || showBottom) && (
      <motion.div
        initial={{ scaleY: 0 }}
        animate={{ scaleY: 1 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        style={{
          transformOrigin: "top",
          position: "absolute",
          left: 0,
          width: LINE_WIDTH,
          background: "white",
          top: showTop ? `calc(-${LAYOUT_GAP} / 2)` : "50%",
          bottom: showBottom ? `calc(-${LAYOUT_GAP} / 2)` : "50%",
        }}
      />
    )}

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
  </div>
);
