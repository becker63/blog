import { css } from "../../../styled-system/css";
import { PROFILE_PANEL_COPY } from "../../../lib/profileNavigation";
import { ProfileWorkWithMe } from "./ProfileWorkWithMe";

export const ProfileIdentityPanel = () => {
  return (
    <div
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "5",
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
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "4",
          alignItems: "flex-start",
        })}
      >
        <div
          className={css({
            display: "flex",
            flexDirection: "column",
            gap: "3",
          })}
        >
          <div
            className={css({
              display: "flex",
              flexDirection: "column",
              gap: "1",
            })}
          >
            <h2
              className={css({
                fontSize: { base: "2xl", lg: "2xl" },
                lineHeight: "1.1",
                fontWeight: "bold",
                color: "white",
              })}
            >
              {PROFILE_PANEL_COPY.name}
            </h2>
          </div>

          <p
            className={css({
              color: "gray.100",
              fontSize: { base: "md", lg: "lg" },
              lineHeight: "1.6",
              maxW: "62ch",
            })}
          >
            {PROFILE_PANEL_COPY.identity}
          </p>
        </div>
      </div>

      <p
        className={css({
          color: "gray.300",
          fontSize: "sm",
          lineHeight: "1.8",
          maxW: "64ch",
        })}
      >
        {PROFILE_PANEL_COPY.summary}
      </p>

      <ProfileWorkWithMe />
    </div>
  );
};
