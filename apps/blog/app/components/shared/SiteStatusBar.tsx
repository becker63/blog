import type { ReactNode } from "react";

import { css } from "@/styled-system/css";

export type SiteStatusBarMode = "fixed" | "sticky" | "inline";

type SiteStatusBarProps = {
  /** Home: `inline` on mobile shell, else `fixed`. Search/posts: `sticky` or `fixed`. Admin: `fixed`. */
  mode: SiteStatusBarMode;
  /** Home hero bar: centered logo. Blog routes + admin: logo/links row. */
  row: "center" | "spaceBetween";
  "data-testid"?: string;
  children: ReactNode;
};

/**
 * Single shared status bar chrome for the whole site: Panda `layerStyle: "navbar"` (blog, admin, etc.).
 * Do not fork a separate layer — keep visual parity with the homepage / Search bar.
 */
export function SiteStatusBar(props: SiteStatusBarProps) {
  const { mode, row, children, "data-testid": testId } = props;
  const isInline = mode === "inline";

  const innerRow =
    row === "center"
      ? css({
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          mx: "auto",
          w: "100%",
          maxW: "1536px",
        })
      : css({
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          mx: "auto",
          w: "100%",
          maxW: "1536px",
        });

  return (
    <nav
      data-testid={testId}
      className={css({
        layerStyle: "navbar",
        position: isInline ? "relative" : mode,
        w: isInline ? "100%" : undefined,
        left: isInline ? "unset" : undefined,
        right: isInline ? "unset" : undefined,
        top: isInline ? "unset" : undefined,
        mb: isInline ? "0" : undefined,
      })}
    >
      <div className={innerRow}>{children}</div>
    </nav>
  );
}
