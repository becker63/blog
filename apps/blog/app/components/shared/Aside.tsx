// app/components/shared/Aside.tsx

import type { ReactNode } from "react";
import { css, cx } from "../../../styled-system/css";
import { paneChildSurfaceStyles } from "./PaneChild";

type AsideTone = "note" | "system" | "warning";

type AsideProps = {
  title?: string;
  tone?: AsideTone;
  children: ReactNode;
  defaultOpen?: boolean;
};

const toneStyles: Record<AsideTone, string> = {
  note: css({
    "& [data-aside-arrow]": {
      color: "gray.300",
    },
  }),

  system: css({
    "& [data-aside-arrow]": {
      color: "gray.200",
    },
  }),

  warning: css({
    "& [data-aside-arrow]": {
      color: "gray.200",
    },
  }),
};

const arrowLineClass = css({
  position: "absolute",
  top: "50%",
  left: "50%",
  w: "15px",
  h: "2.5px",
  borderRadius: "999px",
  bg: "currentColor",
  transformOrigin: "center",
});

export function Aside({
  title = "Aside",
  tone = "note",
  children,
  defaultOpen = true,
}: AsideProps) {
  return (
    <details
      open={defaultOpen}
      className={cx(
        css({
          ...paneChildSurfaceStyles,

          my: "8",
          px: "5",
          py: "4",

          "& summary": {
            listStyle: "none",
          },

          "& summary::-webkit-details-marker": {
            display: "none",
          },

          "&[open] [data-aside-arrow]": {
            transform: "rotate(0deg)",
          },

          "&:not([open]) [data-aside-arrow]": {
            transform: "rotate(-90deg)",
          },

          "&[open] [data-aside-content]": {
            display: "block",
          },

          "&:not([open]) [data-aside-content]": {
            display: "none",
          },
        }),
        toneStyles[tone],
      )}
    >
      <summary
        className={css({
          cursor: "pointer",
          userSelect: "none",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "4",

          _focusVisible: {
            outline: "2px solid rgba(255, 255, 255, 0.28)",
            outlineOffset: "4px",
            borderRadius: "6px",
          },
        })}
      >
        <span
          className={css({
            fontSize: "sm",
            fontWeight: "bold",
            lineHeight: "1.4",
            color: "white",
          })}
        >
          {title}
        </span>

        <span
          data-aside-arrow
          aria-hidden="true"
          className={css({
            position: "relative",
            display: "inline-block",
            w: "10",
            h: "10",
            flexShrink: 0,
            transition: "transform 160ms ease, color 160ms ease",
          })}
        >
          <span
            className={cx(
              arrowLineClass,
              css({
                transform: "translate(-74%, -50%) rotate(45deg)",
              }),
            )}
          />
          <span
            className={cx(
              arrowLineClass,
              css({
                transform: "translate(-26%, -50%) rotate(-45deg)",
              }),
            )}
          />
        </span>
      </summary>

      <div
        data-aside-content
        className={css({
          pt: "4",
          fontSize: "sm",
          lineHeight: "1.8",
          color: "rgba(255, 255, 255, 0.86)",

          "& p": {
            my: "3",
          },

          "& p:first-of-type": {
            mt: "0",
          },

          "& p:last-child": {
            mb: "0",
          },

          "& code": {
            fontSize: "0.9em",
          },

          "& ul, & ol": {
            pl: "5",
            my: "3",
          },
        })}
      >
        {children}
      </div>
    </details>
  );
}
