import { css } from "../../../styled-system/css";

interface HomeNavProps {
  /** When true, removes fixed positioning (for mobile layout integration) */
  inline?: boolean;
}

export const HomeNav = ({ inline = false }: HomeNavProps) => {
  return (
    <nav
      className={css({
        layerStyle: "navbar",
        // For inline mode: use relative positioning and full width
        // Override the fixed positioning values from layerStyle
        position: inline ? "relative" : "fixed",
        w: inline ? "100%" : undefined,
        left: inline ? "unset" : undefined,
        right: inline ? "unset" : undefined,
        top: inline ? "unset" : undefined,
        mb: inline ? "0" : undefined, // MobileLayout handles the gap
      })}
    >
      <div
        className={css({
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          mx: "auto",
          w: "100%",
          maxW: "1536px", // 2xl
        })}
      >
        {/* home view */}
        <div className={css({ display: "flex" })}>
          <span
            className={`anim-typewriter ${css({
              alignSelf: "center",
              fontSize: "30px",
              fontWeight: "semibold",
              whiteSpace: "nowrap",
              _dark: { color: "white" },
              color: "white",
              fontFamily: "pixel",
            })}`}
          >
            becker63
          </span>
        </div>
      </div>
    </nav>
  );
};