import { defineRecipe } from "@pandacss/dev";

/**
 * Canonical stack for pane columns — **use the `PaneParent` React component**
 * (`app/components/shared/PaneChild.tsx`); do not duplicate these styles in `css()`.
 * Variants: **`layout`** = small gap on broad parents; **`6`** = large gap between glass tiles.
 */
export const paneParentRecipe = defineRecipe({
  className: "pane-parent",
  description:
    "Flex column: gap `layout` for broad stacks, gap `6` for nested glass pane rows. Prefer <PaneParent /> from @/components/shared.",
  base: {
    display: "flex",
    flexDirection: "column",
    w: "full",
  },
  variants: {
    gap: {
      "6": { gap: "6" },
      layout: { gap: "layout" },
    },
  },
  defaultVariants: {
    gap: "6",
  },
});
