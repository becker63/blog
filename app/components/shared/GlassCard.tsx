import { ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";
import { SystemStyleObject } from "../../../styled-system/types";

export interface GlassCardProps {
  children: ReactNode;
  /** Additional Panda CSS styles to merge */
  styles?: SystemStyleObject;
  /** CSS class name */
  className?: string;
}

/**
 * Reusable glass-effect card component with consistent styling.
 * Provides the semi-transparent black background with border radius and shadow
 * used throughout the homepage.
 */
export const GlassCard = ({ children, styles, className }: GlassCardProps) => {
  return (
    <div
      className={cx(
        css({
          bg: "#000000",
          opacity: 0.7,
          borderRadius: "10px",
          boxShadow: "#00000F 0 0 10px",
          ...styles,
        }),
        className,
      )}
    >
      {children}
    </div>
  );
};

/**
 * Common glass card style object for use with css() when GlassCard component isn't suitable.
 */
export const glassCardStyles = {
  bg: "#000000",
  opacity: 0.7,
  borderRadius: "10px",
  boxShadow: "#00000F 0 0 10px",
} as const;

/**
 * Blog article shell / identity panel shell: dark glass via rgba background only
 * (no whole-card CSS opacity) so nested panes like Aside composite the same on
 * every route.
 */
export const glassPanelShellStyles = {
  borderRadius: "10px",
  boxShadow: "#00000F 0 0 10px",
  bg: "rgba(0, 0, 0, 0.7)",
} as const;

/**
 * Outer wrapper for blog posts and Search: same shell + width + `p: 6` as the
 * MDX article container.
 */
export const blogArticleShellStyles = {
  ...glassPanelShellStyles,
  w: { base: "100%", md: "90%", lg: "80%" },
  mx: "auto",
  p: "6",
  mb: "layout",
  mt: "layout",
};
