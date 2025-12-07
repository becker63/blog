/**
 * Centralized layout configuration for the root page.
 * All gaps, spacing, and widths should be defined here.
 *
 * This provides a single source of truth for layout values
 * used across the root page and its components.
 */

// Core spacing values (in pixels)
export const LAYOUT = {
  /** Standard gap between elements (matches panda "layout" token = 12px) */
  gap: 12,

  /** Edge margin from viewport for full-width elements (e.g., navbar) */
  edgeMargin: 12,

  /** Content width as viewport percentage */
  contentWidth: "90vw",

  /** Navbar calculated values */
  navbar: {
    /** Full width minus edge margins on both sides */
    width: "calc(100vw - 24px)", // 100vw - (edgeMargin * 2)
    /** Approximate height of navbar */
    height: 45,
  },

  /** Animation scroll range for navbar fade */
  animation: {
    /** Scroll position where animation starts */
    scrollStart: 20,
    /** Scroll position where animation ends (navbar fully faded) */
    scrollEnd: 70,
    /** How far navbar moves up during fade */
    translateY: -30,
  },
} as const;

// Derived values for CSS calc expressions
export const layoutCalc = {
  /** Total edge margins (both sides) */
  totalEdgeMargins: LAYOUT.edgeMargin * 2,
  /** Navbar width calculated from layout values */
  navbarWidth: `calc(100vw - ${LAYOUT.edgeMargin * 2}px)`,
};

// CSS-ready values for direct use in styles
export const layoutStyles = {
  gap: `${LAYOUT.gap}px`,
  edgeMargin: `${LAYOUT.edgeMargin}px`,
  contentWidth: LAYOUT.contentWidth,
  navbarWidth: layoutCalc.navbarWidth,
};

/** Panda token name for use with css({ gap: LAYOUT_GAP }) */
export const LAYOUT_GAP = "layout";
