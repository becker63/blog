"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { useScrollFadeAnimation } from "../../../hooks";

interface BlogNavbarWrapperProps {
    children: ReactNode;
}

/**
 * Client-side wrapper that makes the navbar fade away on scroll
 * for the blog slug pages.
 */
export const BlogNavbarWrapper = ({ children }: BlogNavbarWrapperProps) => {
    const { opacity, y } = useScrollFadeAnimation();

    return (
        <motion.div
            style={{
                opacity,
                y,
            }}
        >
            {children}
        </motion.div>
    );
};
