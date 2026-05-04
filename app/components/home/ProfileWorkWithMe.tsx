import { css } from "../../../styled-system/css";
import { PROFILE_WORK_WITH_ME_COPY } from "../../../lib/profileNavigation";

export const ProfileWorkWithMe = () => {
  return (
    <section
      aria-labelledby="profile-work-with-me-title"
      className={css({
        display: "flex",
        flexDirection: "column",
        gap: "3",
        pt: "4",
        borderTopWidth: "1px",
        borderTopStyle: "solid",
        borderTopColor: "white/10",
      })}
    >
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "2",
        })}
      >
        <h3
          id="profile-work-with-me-title"
          className={css({
            fontSize: "sm",
            fontWeight: "semibold",
            letterSpacing: "0.08em",
            textTransform: "uppercase",
            color: "white/80",
          })}
        >
          {PROFILE_WORK_WITH_ME_COPY.title}
        </h3>

        <p
          className={css({
            color: "gray.200",
            fontSize: "sm",
            lineHeight: "1.7",
          })}
        >
          {PROFILE_WORK_WITH_ME_COPY.intro}
        </p>

        <p
          className={css({
            color: "gray.400",
            fontSize: "xs",
            lineHeight: "1.6",
          })}
        >
          {PROFILE_WORK_WITH_ME_COPY.pricing}
        </p>
      </div>

      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          borderTopWidth: "1px",
          borderTopStyle: "solid",
          borderTopColor: "white/10",
        })}
      >
        {PROFILE_WORK_WITH_ME_COPY.offerings.map((offering, index) => (
          <div
            key={offering.title}
            className={css({
              display: "grid",
              gridTemplateColumns: "auto minmax(0, 1fr)",
              columnGap: "3",
              alignItems: "start",
              py: "3",
              borderBottomWidth: "1px",
              borderBottomStyle: "solid",
              borderBottomColor: "white/10",
            })}
          >
            <span
              aria-hidden="true"
              className={css({
                fontFamily: "mono",
                fontSize: "xs",
                letterSpacing: "0.12em",
                color: "white/45",
                pt: "0.5",
              })}
            >
              {String(index + 1).padStart(2, "0")}
            </span>

            <article
              className={css({
                display: "flex",
                flexDirection: "column",
                gap: "1",
                minW: 0,
              })}
            >
              <h4
                className={css({
                  color: "white",
                  fontSize: "sm",
                  fontWeight: "medium",
                  lineHeight: "1.4",
                })}
              >
                {offering.title}
              </h4>

              <p
                className={css({
                  color: "gray.400",
                  fontSize: "xs",
                  lineHeight: "1.6",
                })}
              >
                {offering.description}
              </p>
            </article>
          </div>
        ))}
      </div>
    </section>
  );
};
