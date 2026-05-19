import { css } from "../../../styled-system/css";

import { SiteStatusBar } from "../shared/SiteStatusBar";

interface HomeNavProps {
  /** When true, removes fixed positioning (for mobile layout integration) */
  inline?: boolean;
}

export const HomeNav = ({ inline = false }: HomeNavProps) => {
  return (
    <SiteStatusBar
      mode={inline ? "inline" : "fixed"}
      row="center"
      data-testid={inline ? "home-status-bar-inline" : "home-status-bar"}
    >
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
    </SiteStatusBar>
  );
};
