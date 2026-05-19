import type { ComponentPropsWithoutRef, ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";
import { paneParent } from "../../../styled-system/recipes";
import type { SystemStyleObject } from "../../../styled-system/types";

/**
 * **Single control** for Aside + PaneChild (and any code that spreads
 * `paneChildSurfaceStyles`). Adjust alpha only here.
 */
export const paneChildBackground = "rgba(0, 0, 0, 0.15)";

/**
 * Default vertical rhythm **between glass pane tiles** (stacked `PaneChild` / `AdminPanel`).
 * **Naming:** `layout` = **small** gaps for **broad** parents (page sections, dashboard grids, route chrome).
 * **`6`** = **large** gaps between **nested** glass siblings that sit **on** the shell (layered tiles).
 * The **outer** shell is the parent surface; tiles use **`position: relative` + `zIndex`** to read above it.
 */
export type PaneParentGap = "layout" | "6";

export type PaneParentProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  children: ReactNode;
  /**
   * `layout` — tight rhythm for broad stacks (homepage grid column, `AdminPageSections`).
   * `6` — large rhythm between glass pane rows (`AdminPanelStack`, category/search pane columns).
   */
  gap?: PaneParentGap;
};

/**
 * Shared glass pane surface (bg + shadow + radius) used by Aside and other
 * inset panes. Do not spread `glassCardStyles` here (Panda bg atom collisions).
 * Use `css.raw` so merging into `css({ ... })` is extraction-safe.
 */
export const paneChildSurfaceStyles = css.raw({
  position: "relative",
  zIndex: 1,
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
      data-pane-child=""
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

/** Stacks flex children: use **`gap: "layout"`** for broad parents, **`gap: "6"`** for glass pane groups. */
export function PaneParent({ children, gap = "6", className, ...rest }: PaneParentProps) {
  return (
    <div
      {...rest}
      data-pane-parent=""
      className={cx(paneParent({ gap }), className)}
    >
      {children}
    </div>
  );
}
