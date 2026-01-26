"use client";

import { motion, HTMLMotionProps, useReducedMotion } from "framer-motion";
import React from "react";
import { cx } from "../../../styled-system/css";

type AnimatedCardProps = HTMLMotionProps<"div"> & {
  delay?: number;
  index?: number;
  finalOpacity?: number;
};

export const AnimatedCard = React.forwardRef<HTMLDivElement, AnimatedCardProps>(
  (
    { delay, index, finalOpacity = 0.7, className, style, children, ...rest },
    ref,
  ) => {
    const prefersReducedMotion = useReducedMotion();
    const computedDelay = index !== undefined ? index * 0.06 : delay ?? 0;

    return (
      <motion.div
        ref={ref}
        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
        animate={prefersReducedMotion ? {} : { opacity: finalOpacity, y: 0 }}
        transition={{
          duration: 0.4,
          delay: computedDelay,
          ease: [0.22, 1, 0.36, 1],
        }}
        className={cx(className)}
        style={{
          ...style,
          willChange: "transform, opacity",
        }}
        {...rest}
      >
        {children}
      </motion.div>
    );
  },
);

AnimatedCard.displayName = "AnimatedCard";
