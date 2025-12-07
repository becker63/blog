"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { ReactNode, useEffect, useState } from "react";
import { css } from "../../styled-system/css";
import { LAYOUT, layoutCalc } from "../../lib/layout";

interface MobileLayoutProps {
    navbar: ReactNode;
    children: ReactNode;
}

/**
 * Mobile-only layout container with scroll-based navbar animation.
 * The navbar starts as part of the layout flow, then fades out on scroll
 * while content shifts up to fill the space.
 */
export const MobileLayout = ({ navbar, children }: MobileLayoutProps) => {
    const { scrollY } = useScroll();
    const [isMobile, setIsMobile] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024);
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    // Transform values for navbar animation - using centralized config
    const navbarOpacity = useTransform(
        scrollY,
        [LAYOUT.animation.scrollStart, LAYOUT.animation.scrollEnd],
        [1, 0]
    );
    const navbarY = useTransform(
        scrollY,
        [LAYOUT.animation.scrollStart, LAYOUT.animation.scrollEnd],
        [0, LAYOUT.animation.translateY]
    );
    // Animate margin-bottom from layout gap to 0
    const navbarMarginBottom = useTransform(
        scrollY,
        [LAYOUT.animation.scrollStart, LAYOUT.animation.scrollEnd],
        [LAYOUT.gap, 0]
    );

    // Navbar container styles - full width with edge margins like desktop
    const navbarContainerStyles = css({
        w: layoutCalc.navbarWidth,
        mx: "layout",
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
                    w: "100vw",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                })}
            >
                {/* Navbar with edge margins like desktop */}
                <div className={css({
                    w: layoutCalc.navbarWidth,
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

    if (!isMobile) {
        // Desktop - don't render anything (desktop layout is separate)
        return null;
    }

    return (
        <div
            className={css({
                lg: { display: "none" },
                w: "100vw",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                pt: "layout", // Top padding like desktop navbar has
            })}
        >
            {/* Animated navbar container - full width with edge margins */}
            <motion.div
                style={{
                    opacity: navbarOpacity,
                    y: navbarY,
                    marginBottom: navbarMarginBottom,
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
