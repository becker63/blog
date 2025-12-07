"use client";

import { motion } from "framer-motion";
import { ReactNode } from "react";
import { css } from "../../../styled-system/css";
import { layoutCalc } from "../../../lib/layout";
import { useScrollFadeAnimation, useMobileDetection } from "../../../hooks";

interface MobileLayoutProps {
    navbar: ReactNode;
    children: ReactNode;
}

/**
 * Mobile-only layout container with scroll-based navbar animation.
 * The navbar starts as part of the layout flow, then fades out on scroll
 * while content shifts up to fill the space.
 * 
 * Now uses the extracted useScrollFadeAnimation and useMobileDetection hooks.
 */
export const MobileLayout = ({ navbar, children }: MobileLayoutProps) => {
    const { opacity, y, marginBottom } = useScrollFadeAnimation();
    const { isMobile, hasMounted } = useMobileDetection();

    // Navbar container styles - fluid width with margins
    const navbarContainerStyles = css({
        alignSelf: "stretch", // Fill parent width
        mx: "layout",        // Apply standard layout margin (12px)
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
    });

    // Don't render on desktop or before hydration
    if (!hasMounted) {
        // SSR/initial render - show mobile layout without animation
        return (
            <div
                className={css({
                    lg: { display: "none" },
                    w: "100%", // Changed from 100vw to prevent horizontal scroll
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                })}
            >
                {/* Navbar with edge margins like desktop */}
                <div className={css({
                    alignSelf: "stretch",
                    mx: "layout",
                    mb: "layout",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                })}>
                    {navbar}
                </div>
                {children}
            </div>
        );
    }

    // Removed JS-based desktop check to prevents gaps during resize. 
    // We rely on the CSS 'lg: { display: "none" }' below to hide this on desktop.

    /* if (!isMobile) {
        return null;
    } */

    return (
        <div
            className={css({
                lg: { display: "none" },
                w: "100%", // Changed from 100vw to prevent horizontal scroll caused by vertical scrollbar
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pt: "layout", // Top padding like desktop navbar has
            })}
        >
            {/* Animated navbar container - full width with edge margins */}
            <motion.div
                style={{
                    opacity,
                    y,
                    marginBottom,
                }}
                className={navbarContainerStyles}
            >
                {navbar}
            </motion.div>
            {/* Content */}
            {children}
        </div>
    );
};
