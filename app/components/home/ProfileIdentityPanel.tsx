import { cx, css } from "../../../styled-system/css";
import { PROFILE_PANEL_COPY } from "../../../lib/profileNavigation";
import { blogContentProseClass } from "../shared/blogContentProseStyles";
import { ProfileWorkWithMe } from "./ProfileWorkWithMe";

export const ProfileIdentityPanel = () => {
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        h: "100%",
        minH: 0,
        overflowY: "auto",
        px: { base: "5", lg: "6" },
        py: { base: "5", lg: "6" },
        scrollbarWidth: "thin",
        scrollbarColor: "#444 transparent",
        "&::-webkit-scrollbar": {
          width: "6px",
        },
        "&::-webkit-scrollbar-track": {
          background: "transparent",
        },
        "&::-webkit-scrollbar-thumb": {
          background: "#333",
          borderRadius: "9999px",
        },
        "&::-webkit-scrollbar-thumb:hover": {
          background: "#555",
        },
      })}
    >
      <div
        className={cx(
          blogContentProseClass,
          css({
            width: "100%",
            "& h2:first-of-type": {
              mt: 0,
            },
          }),
        )}
      >
        <h2>{PROFILE_PANEL_COPY.name}</h2>

        <p>{PROFILE_PANEL_COPY.identity}</p>

        <p>{PROFILE_PANEL_COPY.summary}</p>

        <hr />

        <ProfileWorkWithMe />
      </div>
    </div>
  );
};
