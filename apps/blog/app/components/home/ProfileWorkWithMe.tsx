import { css } from "../../../styled-system/css";
import { PROFILE_WORK_WITH_ME_COPY } from "../../../lib/profileNavigation";
import { Aside } from "../shared/Aside";

export const ProfileWorkWithMe = () => {
  const { intro, pricing, offerings } = PROFILE_WORK_WITH_ME_COPY;

  return (
    <section aria-labelledby="profile-work-with-me-title">
      <h3 id="profile-work-with-me-title">
        {PROFILE_WORK_WITH_ME_COPY.title}
      </h3>

      <p>{intro}</p>

      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          gap: "8",
          "& details": {
            my: "0",
          },
        })}
      >
        <Aside title="What I can help with" tone="system" defaultOpen>
          <p>
            Typical themes: opaque software and infrastructure, security
            boundaries, developer tooling, and AI-agent workflows — made easier
            to inspect, debug, and trust.
          </p>
          <ul>
            {offerings.map((o) => (
              <li key={o.title}>{o.title}</li>
            ))}
          </ul>
        </Aside>

        <Aside title="Good first projects" tone="system" defaultOpen={false}>
          <p>
            Small, bounded work tends to fit best: diagnostics, internal tools,
            repo or CI cleanup, observability hooks, eval or reporting passes,
            dashboards, or documentation that makes a system legible.
          </p>
          {offerings.map((o) => (
            <p key={o.title}>
              <strong>{o.title}.</strong> {o.description}
            </p>
          ))}
        </Aside>

        <Aside title="Rates and scope" tone="system" defaultOpen={false}>
          <p>{pricing}</p>
          <p>
            If you are not sure how to scope something, describe the system and
            what feels unclear — we can pick a narrow first slice.
          </p>
        </Aside>
      </div>
    </section>
  );
};
