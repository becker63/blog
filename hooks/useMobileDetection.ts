"use client";

import { useState, useEffect } from "react";

/**
 * Hook that detects if the viewport is mobile-sized and handles SSR hydration.
 * 
 * @param breakpoint - The max width in pixels considered "mobile" (default: 1024)
 * @returns Object with isMobile and hasMounted booleans
 * 
 * @example
 * ```tsx
 * const { isMobile, hasMounted } = useMobileDetection();
 * 
 * if (!hasMounted) return <SSRFallback />;
 * if (!isMobile) return null; // Don't render on desktop
 * 
 * return <MobileOnlyComponent />;
 * ```
 */
export function useMobileDetection(breakpoint: number = 1024) {
    const [isMobile, setIsMobile] = useState(false);
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);

        const checkMobile = () => {
            setIsMobile(window.innerWidth < breakpoint);
        };

        checkMobile();
        window.addEventListener("resize", checkMobile);

        return () => window.removeEventListener("resize", checkMobile);
    }, [breakpoint]);

    return { isMobile, hasMounted };
}
