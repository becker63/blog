import * as React from "react";
import { css } from "../../../styled-system/css";
import { HomeNav } from "./HomeNav";
import { LatestBlogCard } from "./LatestBlogCard";
import { Card, Socials, BebopContainer } from ".";
import { glassCardStyles, glassPanelShellStyles } from "../shared/GlassCard";
import { AnimatedCard } from "../shared/AnimatedCard";
import { seededDelay } from "../../../lib/animationDelay";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { faMarkdown } from "@fortawesome/free-brands-svg-icons";
import { ProfileIdentityPanel } from "./ProfileIdentityPanel";

export const HomeDesktopLayout = () => {
  return (
    <>
      <div className={css({ display: "none", lg: { display: "block" } })}>
        <HomeNav />
      </div>

      <div
        className={css({
          display: "none",
          lg: { display: "flex" },
          layerStyle: "pageContainer",
          h: "100vh",
          w: "100vw",
          flexDirection: "column",
          minH: 0,
          overflow: "hidden",
        })}
      >
        <div
          data-testid="home-dashboard-grid"
          className={css({
            alignSelf: "stretch",
            mx: "layout",
            display: "grid",
            gridTemplateColumns:
              "minmax(260px, 0.95fr) minmax(0, 1.7fr) minmax(280px, 1fr)",
            gridTemplateRows:
              "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)",
            gridGap: "layout",
            gridTemplateAreas: `
              "About Svg Blog"
              "About Svg Latest-Blog"
              "About Svg Latest-Blog"
              "About Socials CV"
            `,
            flex: "1",
            h: 0,
            minH: 0,
          })}
        >
          <AnimatedCard
            delay={seededDelay("identity-desktop")}
            finalOpacity={1}
            className={css({
              ...glassPanelShellStyles,
              gridArea: "About",
              display: "flex",
              flexDirection: "column",
              minH: 0,
            })}
          >
            <ProfileIdentityPanel />
          </AnimatedCard>

          <AnimatedCard
            delay={seededDelay("bebop-desktop")}
            className={css({
              ...glassCardStyles,
              gridArea: "Svg",
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "stretch",
              overflow: "hidden",
            })}
          >
            <BebopContainer />
          </AnimatedCard>

          <AnimatedCard
            delay={seededDelay("resume-desktop")}
            className={css({
              ...glassCardStyles,
              gridArea: "CV",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: { base: "5", sm: "20", lg: "5" },
              py: "5",
            })}
          >
            <Card
              title="Resume"
              desc="My Background."
              color="#86efac"
              href="/resume.html"
              icon={faPaperclip}
            />
          </AnimatedCard>

          <AnimatedCard
            delay={seededDelay("blogs-desktop")}
            className={css({
              ...glassCardStyles,
              gridArea: "Blog",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: { base: "5", sm: "20", lg: "5" },
              py: "5",
            })}
          >
            <Card
              title="Blogs"
              desc="Search through my back catalog."
              color="#fca5a5"
              href="/Search"
              icon={faMarkdown}
            />
          </AnimatedCard>

          <AnimatedCard
            delay={seededDelay("latest-desktop")}
            finalOpacity={1}
            className={css({
              ...glassPanelShellStyles,
              gridArea: "Latest-Blog",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              position: "relative",
            })}
          >
            <LatestBlogCard />
          </AnimatedCard>

          <AnimatedCard
            delay={seededDelay("socials-desktop")}
            className={css({
              ...glassCardStyles,
              gridArea: "Socials",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              py: "5",
            })}
          >
            <Socials />
          </AnimatedCard>
        </div>
      </div>
    </>
  );
};
