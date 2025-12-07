"use client";

import { useScroll, useTransform, MotionValue } from "framer-motion";
import { LAYOUT } from "../lib/layout";

/**
 * Configuration for scroll-based fade animation
 */
export interface ScrollFadeConfig {
    /** Scroll position where animation starts (default: 0) */
    scrollStart: number;
    /** Scroll position where animation ends (default: 200) */
    scrollEnd: number;
    /** How far the element moves vertically during fade (default: -30) */
    translateY: number;
    /** Starting margin that animates to 0 (default: 12) */
    marginStart: number;
}

/**
 * Return type for the scroll fade animation hook
 */
export interface ScrollFadeValues {
    /** Opacity value from 1 to 0 */
    opacity: MotionValue<number>;
    /** Y translation value */
    y: MotionValue<number>;
    /** Margin bottom value from marginStart to 0 */
    marginBottom: MotionValue<number>;
    /** The scroll Y position */
    scrollY: MotionValue<number>;
}

/**
 * Hook that provides scroll-based fade animation values.
 * Use with framer-motion's motion components for smooth fade-out-on-scroll effects.
 * 
 * @example
 * ```tsx
 * const { opacity, y, marginBottom } = useScrollFadeAnimation();
 * 
 * return (
 *   <motion.div style={{ opacity, y, marginBottom }}>
 *     Content that fades on scroll
 *   </motion.div>
 * );
 * ```
 */
export function useScrollFadeAnimation(config?: Partial<ScrollFadeConfig>): ScrollFadeValues {
    const { scrollY } = useScroll();

    const finalConfig: ScrollFadeConfig = {
        scrollStart: config?.scrollStart ?? LAYOUT.animation.scrollStart,
        scrollEnd: config?.scrollEnd ?? LAYOUT.animation.scrollEnd,
        translateY: config?.translateY ?? LAYOUT.animation.translateY,
        marginStart: config?.marginStart ?? LAYOUT.gap,
    };

    const opacity = useTransform(
        scrollY,
        [finalConfig.scrollStart, finalConfig.scrollEnd],
        [1, 0]
    );

    const y = useTransform(
        scrollY,
        [finalConfig.scrollStart, finalConfig.scrollEnd],
        [0, finalConfig.translateY]
    );

    const marginBottom = useTransform(
        scrollY,
        [finalConfig.scrollStart, finalConfig.scrollEnd],
        [finalConfig.marginStart, 0]
    );

    return { opacity, y, marginBottom, scrollY };
}
