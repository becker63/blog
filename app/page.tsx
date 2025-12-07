import * as React from "react";
import { css } from "../styled-system/css";
import { Bebop } from "./components/home/Bebop";
import { HomeNav } from "./components/home/HomeNav";
import { MobileLayout } from "./components/home/MobileScrollContainer";
import { LatestBlogCard } from "./components/home/LatestBlogCard";
import { Card, Socials, BebopContainer } from "./components/home";
import { glassCardStyles } from "./components/shared/GlassCard";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { faMarkdown } from "@fortawesome/free-brands-svg-icons";

/**
 * Homepage component with responsive mobile/desktop layouts.
 * - Mobile: Scroll-based navbar animation with stacked content cards
 * - Desktop: Fixed navbar with CSS Grid layout
 */
export default function Home() {
  return (
    <>
      {/* Mobile Layout */}
      <MobileLayout navbar={<HomeNav inline />}>
        {/* Bebop SVG Card */}
        <div
          className={css({
            ...glassCardStyles,
            w: "90vw",
            minH: "300px",
            position: "relative",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          })}
        >
          <div
            className={css({
              w: "90%",
              display: "flex",
              flexDirection: "column",
              alignContent: "center",
              alignItems: "center",
              position: "relative",
              aspectRatio: "1042 / 1066",
              maxH: "50vh",
            })}
          >
            <Bebop />
            <p className={css({ pr: "11", textAlign: "right", position: "absolute", bottom: 0, right: 0 })}>
              see ya space cowboy...
            </p>
          </div>
        </div>

        {/* Mobile Content Stack */}
        <div
          className={css({
            alignSelf: "center",
            w: "90vw",
            display: "flex",
            flexDirection: "column",
            gap: "layout",
            mt: "layout",
            pb: "layout",
          })}
        >
          {/* Resume Card */}
          <div
            className={css({
              ...glassCardStyles,
              h: "75px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: { base: "5", sm: "20" },
            })}
          >
            <Card title="Resume" desc="My Background." color="#86efac" href="#" icon={faPaperclip} />
          </div>

          {/* Blogs Card */}
          <div
            className={css({
              ...glassCardStyles,
              h: "75px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: { base: "5", sm: "20" },
            })}
          >
            <Card title="Blogs" desc="Search through my back catalog." color="#fca5a5" href="/Search" icon={faMarkdown} />
          </div>

          {/* Latest Blog Card */}
          <div
            className={css({
              ...glassCardStyles,
              h: "400px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            })}
          >
            <LatestBlogCard />
          </div>

          {/* Socials Card */}
          <div
            className={css({
              ...glassCardStyles,
              h: "75px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            })}
          >
            <Socials />
          </div>
        </div>
      </MobileLayout>

      {/* Desktop Navbar - Fixed at top */}
      <div className={css({ display: "none", lg: { display: "block" } })}>
        <HomeNav />
      </div>

      {/* Desktop Layout */}
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
          className={css({
            alignSelf: "center",
            w: "95%",
            maxWidth: "1250px",
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gridTemplateRows: "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)",
            gridGap: "layout",
            gridAutoFlow: "row",
            gridTemplateAreas: `
              "Svg Blog"
              "Svg Latest-Blog"
              "Svg Latest-Blog"
              "Socials CV"
            `,
            flex: "1",
            h: 0,
          })}
        >
          {/* Bebop Container */}
          <div
            className={css({
              ...glassCardStyles,
              gridArea: "Svg",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              alignItems: "stretch",
              overflow: "hidden",
              minH: "0",
            })}
          >
            <BebopContainer />
          </div>

          {/* CV/Resume Card */}
          <div
            className={css({
              ...glassCardStyles,
              gridArea: "CV",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: { base: "5", sm: "20", lg: "5" },
              py: "5",
              overflow: "hidden",
              minH: "0",
            })}
          >
            <Card title="Resume" desc="My Background." color="#86efac" href="/#" icon={faPaperclip} />
          </div>

          {/* Blogs Card */}
          <div
            className={css({
              ...glassCardStyles,
              gridArea: "Blog",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: { base: "5", sm: "20", lg: "5" },
              py: "5",
              overflow: "hidden",
              minH: "0",
            })}
          >
            <Card title="Blogs" desc="Search through my back catalog." color="#fca5a5" href="/Search" icon={faMarkdown} />
          </div>

          {/* Latest Blog Card */}
          <div
            className={css({
              ...glassCardStyles,
              gridArea: "Latest-Blog",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              overflow: "hidden",
              minH: "0",
              position: "relative",
            })}
          >
            <LatestBlogCard />
          </div>

          {/* Socials Card */}
          <div
            className={css({
              ...glassCardStyles,
              gridArea: "Socials",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              py: "5",
              overflow: "hidden",
              minH: "0",
            })}
          >
            <Socials />
          </div>
        </div>
      </div>
    </>
  );
}
