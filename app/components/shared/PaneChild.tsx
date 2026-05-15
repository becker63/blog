import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";
import type { SystemStyleObject } from "../../../styled-system/types";

/**
 * **Single control** for Aside + PaneChild (and any code that spreads
 * `paneChildSurfaceStyles`). Adjust alpha only here.
 */
export const paneChildBackground = "rgba(0, 0, 0, 0.15)";

/**
 * Shared glass pane surface (bg + shadow + radius) used by Aside and other
 * inset panes. Do not spread `glassCardStyles` here (Panda bg atom collisions).
 * Use `css.raw` so merging into `css({ ... })` is extraction-safe.
 */
export const paneChildSurfaceStyles = css.raw({
  borderRadius: "10px",
  //boxShadow: "rgba(0, 0, 0, 0.45) 0 0 10px",
  bg: paneChildBackground,
  borderWidth: "0",
});

export type PaneChildProps = {
  children: ReactNode;
  /** Extra Panda styles merged on top of the pane surface + default padding */
  styles?: SystemStyleObject;
  className?: string;
} & ComponentPropsWithoutRef<"div">;

const defaultPadding = css.raw({
  px: "5",
  py: "4",
});

/**
 * Inset pane wrapper so homepage (and other) blocks match Aside’s glass tile.
 */
export function PaneChild({
  children,
  styles,
  className,
  ...rest
}: PaneChildProps) {
  return (
    <div
      {...rest}
      className={cx(
        css({
          ...paneChildSurfaceStyles,
          ...defaultPadding,
          ...styles,
        }),
        className,
      )}
    >
      {children}
    </div>
  );
}
