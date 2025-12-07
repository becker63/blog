import * as React from "react";
import { css } from "../styled-system/css";
import { Bebop } from "./home_Components/Bebop";
import { Route } from "./global_components/client/linkwithloading";
import { HomeNav } from "./home_Components/home_Navbar";
import { MobileLayout } from "./home_Components/MobileScrollContainer";
import { LatestBlogCard } from "./home_Components/LatestBlogCard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  IconDefinition,
  faEnvelope,
  faPaperclip,
} from "@fortawesome/free-solid-svg-icons";
import {
  faGithub,
  faInstagram,
  faLinkedin,
  faMarkdown,
} from "@fortawesome/free-brands-svg-icons";
//<Link href="/BlogHomepage" className="anim-typewriter">
//blogs
//</Link>
//          <Image priority src={bebop} alt="image failed to load" width={350} height={350} />

const Card = (p: {
  title: string;
  desc: string;
  icon?: IconDefinition;
  color: string;
  href: string;
}) => {
  return (
    <div className={css({ display: "flex", justifyContent: "space-between" })}>
      <div className="">
        <Route href={p.href} size={30} color={p.color}>
          <h3
            className={css({
              fontSize: "2xl",
              fontWeight: "bold",
              _hover: { color: "white" },
            })}
            color={p.color}
          >
            {p.title}
          </h3>
        </Route>
        <p className={css({ color: "gray.400" })}>{p.desc}</p>
      </div>
      <div
        className={css({
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
        })}
      >
        {p.icon ? <FontAwesomeIcon icon={p.icon} size="xl" /> : <></>}
      </div>
    </div>
  );
};

const Socials = () => (
  <div
    className={css({
      display: "flex",
      flexDirection: "row",
      justifyContent: "space-evenly",
      height: "80%",
    })}
  >
    <div
      className={css({ display: "flex", flexDirection: "column", justifyContent: "center" })}
    >
      <Route href={"https://github.com/becker63"} size={30}>
        <FontAwesomeIcon
          icon={faGithub}
          size="2xl"
          className={css({ _hover: { color: "#575757" } })}
        />
      </Route>
    </div>
    <div
      className={css({
        w: "1px",
        bg: "white",
        float: "left",
        h: "80%",
        alignSelf: "center",
      })}
    />
    <div
      className={css({ display: "flex", flexDirection: "column", justifyContent: "center" })}
    >
      <Route href={"https://www.linkedin.com/in/taylor-johnson-805061210/"} size={30}>
        <FontAwesomeIcon
          icon={faLinkedin}
          size="2xl"
          className={css({ _hover: { color: "#ff63a4" } })}
        />
      </Route>
    </div>
    <div
      className={css({
        w: "1px",
        bg: "white",
        float: "left",
        h: "80%",
        alignSelf: "center",
      })}
    />
    <div
      className={css({ display: "flex", flexDirection: "column", justifyContent: "center" })}
    >
      <Route href={"mailto:johnsontaylor6320@gmail.com"} size={30}>
        <FontAwesomeIcon
          icon={faEnvelope}
          size="2xl"
          className={css({ _hover: { color: "#06c1ff" } })}
        />
      </Route>
    </div>
    <div
      className={css({
        w: "1px",
        bg: "white",
        float: "left",
        h: "80%",
        alignSelf: "center",
      })}
    />
    <div
      className={css({ display: "flex", flexDirection: "column", justifyContent: "center" })}
    >
      <Route href={"https://www.instagram.com/taylorjohnson63200"} size={30}>
        <FontAwesomeIcon
          icon={faInstagram}
          size="2xl"
          className={css({ _hover: { color: "#7301ff" } })}
        />
      </Route>
    </div>
  </div>
);

const BebopContainer = () => {
  return (
    <div
      className={css({
        lg: { w: "100%" },
        alignItems: "center",
        display: "flex",
        flexDirection: "column",
        alignContent: "center",
        justifyContent: "center",
        h: "100%",
        overflow: "hidden",
      })}
    >
      <div className={css({
        position: "relative",
        w: "100%",
        h: "100%",
        display: "flex",
        flexDirection: "column",
        flex: 1,
        minHeight: 0,
        alignItems: "center",
        justifyContent: "center"
      })}>
        <Bebop />
      </div>
      <p className={css({ pr: "16", textAlign: "right" })}>
        see ya space cowboy...
      </p>
    </div>
  );
};

export default function Home() {
  return (
    <>
      {/* mobile */}
      <MobileLayout navbar={<HomeNav inline />}>
        <div
          className={css({
            bg: "#000000",
            opacity: 0.7,
            borderRadius: "10px",
            boxShadow: "#00000F 0 0 10px",
            w: "90vw",
            minH: "300px", // Ensure container has height for SVG
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
              position: "relative", // Required for absolute-positioned Bebop
              aspectRatio: "1042 / 1066", // Match SVG aspect ratio
              maxH: "50vh", // Limit height on mobile
            })}
          >
            <Bebop />
            <p className={css({ pr: "11", textAlign: "right", position: "absolute", bottom: 0, right: 0 })}>
              see ya space cowboy...
            </p>
          </div>
        </div>

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
          <div
            className={css({
              h: "75px",
              bg: "#000000",
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
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
              href="#"
              icon={faPaperclip}
            />
          </div>

          <div
            className={css({
              h: "75px",
              bg: "#000000",
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
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
          </div>

          <div
            className={css({
              h: "400px",
              bg: "#000000",
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            })}
          >
            <LatestBlogCard />
          </div>

          <div
            className={css({
              h: "75px",
              bg: "#000000",
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
            })}
          >
            <Socials />
          </div>
        </div>
      </MobileLayout>

      {/* desktop navbar - fixed at top */}
      <div className={css({ display: "none", lg: { display: "block" } })}>
        <HomeNav />
      </div>

      {/* desktop */}
      <div
        className={css({
          display: "none",
          lg: { display: "flex" },
          layerStyle: "pageContainer",
          h: "100vh",
          w: "100vw",
          flexDirection: "column",
          minH: 0, // CRITICAL: Changed from "auto" to 0 to prevent content expansion
          overflow: "hidden",
        })}
      >
        <div
          className={css({
            alignSelf: "center",
            w: "95%",
            maxWidth: "1250px",
            // Desktop grid styles from home.css ported here
            display: "grid",
            gridTemplateColumns: "minmax(0, 2fr) minmax(0, 1fr)",
            gridTemplateRows:
              "minmax(0, 1fr) minmax(0, 1fr) minmax(0, 2fr) minmax(0, 1fr)",
            gridGap: "layout",
            gridAutoFlow: "row",
            gridTemplateAreas: `
              "Svg Blog"
              "Svg Latest-Blog"
              "Svg Latest-Blog"
              "Socials CV"
            `,
            flex: "1",
            h: 0, // CRITICAL: Forces flex item to size from available space, not content
          })}
        >
          <div
            className={css({
              gridArea: "Svg",
              display: "flex",
              justifyContent: "center",
              alignContent: "center",
              bg: "#000000",
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
              alignItems: "stretch",
              overflow: "hidden",
              minH: "0",
            })}
          >
            <BebopContainer />
          </div>
          <div
            className={css({
              gridArea: "CV",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: {
                base: "5",

                sm: "20",
                lg: "5",
              },
              py: "5",
              bg: "#000000",
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
              overflow: "hidden",
              minH: "0",
            })}
          >
            <Card
              title="Resume"
              desc="My Background."
              color="#86efac"
              href="/#"
              icon={faPaperclip}
            />
          </div>
          <div
            className={css({
              gridArea: "Blog",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              px: {
                base: "5",

                sm: "20",
                lg: "5",
              },
              py: "5",
              bg: "#000000",
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
              overflow: "hidden",
              minH: "0",
            })}
          >
            <Card
              title="Blogs"
              desc="Search through my back catalog."
              color="#fca5a5"
              href="/Search"
              icon={faMarkdown}
            />
          </div>
          <div
            className={css({
              gridArea: "Latest-Blog",
              bg: "#000000",
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              overflow: "hidden",
              minH: "0",
              position: "relative", // Establish positioning context
            })}
          >
            <LatestBlogCard />
          </div>
          <div
            className={css({
              gridArea: "Socials",
              bg: "#000000",
              opacity: 0.7,
              borderRadius: "10px",
              boxShadow: "#00000F 0 0 10px",
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
