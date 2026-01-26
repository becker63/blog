import * as React from "react";
import { css } from "../../../styled-system/css";
import { Bebop } from "./Bebop";
import { HomeNav } from "./HomeNav";
import { MobileLayout } from "./MobileScrollContainer";
import { LatestBlogCard } from "./LatestBlogCard";
import { Card, Socials } from ".";
import { glassCardStyles } from "../shared/GlassCard";
import { AnimatedCard } from "../shared/AnimatedCard";
import { faPaperclip } from "@fortawesome/free-solid-svg-icons";
import { faMarkdown } from "@fortawesome/free-brands-svg-icons";

export const HomeMobileLayout = () => {
  return (
    <MobileLayout navbar={<HomeNav inline />}>
      <AnimatedCard
        index={0}
        className={css({
          ...glassCardStyles,
          w: "90vw",
          minH: "300px",
          position: "relative",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
        })}
      >
        <div
          className={css({
            w: "90%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            position: "relative",
            aspectRatio: "1042 / 1066",
            maxH: "50vh",
          })}
        >
          <Bebop />
          <p
            className={css({
              pr: "11",
              textAlign: "right",
              position: "absolute",
              bottom: 0,
              right: 0,
            })}
          >
            see ya space cowboy...
          </p>
        </div>
      </AnimatedCard>

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
        <AnimatedCard
          index={1}
          className={css({
            ...glassCardStyles,
            h: "95px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { base: "5", sm: "20" },
          })}
        >
          <Card
            title="Resume"
            desc="My Background."
            color="#86efac"
            href="https://docs.google.com/document/d/1PVuM1n5Q1qQNWRAvfe058KQaeYeUVvKFx681bQuDjVE/edit?usp=sharing"
            icon={faPaperclip}
          />
        </AnimatedCard>

        <AnimatedCard
          index={2}
          className={css({
            ...glassCardStyles,
            h: "95px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            px: { base: "5", sm: "20" },
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
          index={3}
          className={css({
            ...glassCardStyles,
            h: "400px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          })}
        >
          <LatestBlogCard />
        </AnimatedCard>

        <AnimatedCard
          index={4}
          className={css({
            ...glassCardStyles,
            h: "95px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          })}
        >
          <Socials />
        </AnimatedCard>
      </div>
    </MobileLayout>
  );
};
