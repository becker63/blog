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

        <p>
          I’m seeking a mid-level individual-contributor role in AI systems or
          developer infrastructure, combining independent technical work with
          delivery on a production engineering team.
        </p>

        <p>
          <a href="https://github.com/becker63/attune">Attune source</a>
          {" · "}
          <a href="https://atlas-live-five.vercel.app/">How Attune works</a>
          {" · "}
          <a href="https://github.com/becker63/searchbench-go">SearchBench</a>
        </p>

        <p>
          My experiments include modifying llama.cpp embedding execution and
          investigating DSPy executable-program optimization. Typed contracts,
          compiler feedback, and repeatable tests help me decide which
          optimizations are safe and useful.
        </p>

        <p>
          Presented SearchBench at{" "}
          <a href="https://aitinkerers.org/talks/rsvp_t4IMPq7lJnc">
            AI Tinkerers Columbus in June 2026
          </a>
          ; featured as a Community Favorite in{" "}
          <a href="https://post-training.aitinkerers.org/p/top-ai-demos-31">
            Top AI Demos #31
          </a>
          .
        </p>

        <hr />

        <ProfileWorkWithMe />
      </div>
    </div>
  );
};
