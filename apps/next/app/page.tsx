import * as React from "react";
import "./home.css";
import { Bebop } from "./home_Components/bebopcomp";
import { Route } from "./global_components/client/linkwithloading";
import { HomeNav } from "./home_Components/home_Navbar";
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

export const Card = (p: {
  title: string;
  desc: string;
  icon?: IconDefinition;
  color: string;
  href: string;
}) => {
  return (
    <div className="flex justify-between">
      <div className="">
        <Route href={p.href} size={30} color={p.color}>
          <h3 className={`text-2xl text-bold hover:text-white`} color={p.color}>
            {p.title}
          </h3>
        </Route>
        <p className="text-gray-400">{p.desc}</p>
      </div>
      <div className="flex flex-col justify-center items-center">
        {p.icon ? <FontAwesomeIcon icon={p.icon} size="xl" /> : <></>}
      </div>
    </div>
  );
};

const Socials = () => (
  <div className="flex flex-row justify-evenly h-[80%]">
    <div className="flex flex-col justify-center">
      <Route href={"https://github.com/becker63"} size={30}>
        <FontAwesomeIcon icon={faGithub} size="2xl" className="hover:text-[#575757]"/>
      </Route>
    </div>
    <div className="w-px bg-[white] float-left h-[80%] self-center" />
    <div className="flex flex-col justify-center">
      <Route href={"https://www.linkedin.com/in/taylor-johnson-805061210/"} size={30}>
        <FontAwesomeIcon icon={faLinkedin} size="2xl" className="hover:text-[#ff63a4]"/>
      </Route>
    </div>
    <div className="w-px bg-[white] float-left h-[80%] self-center" />
    <div className="flex flex-col justify-center" >
      <Route href={"mailto:johnsontaylor6320@gmail.com"} size={30}>
        <FontAwesomeIcon icon={faEnvelope} size="2xl" className="hover:text-[#06c1ff]" />
      </Route>
    </div>
    <div className="w-px bg-[white] float-left h-[80%] self-center" />
    <div className="flex flex-col justify-center">
      <Route href={"https://www.instagram.com/taylorjohnson63200"} size={30}>
        <FontAwesomeIcon icon={faInstagram} size="2xl" className="hover:text-[#7301ff]"/>
      </Route>
    </div>
  </div>
);

const BebopContainer = () => {
  return (
    <div className=" md:w-[100%] lg:w-[70%] flex flex-col content-center justify-center">
      <Bebop />
      <p className="pr-16 " style={{ textAlign: "right" }}>
        see ya space cowboy...
      </p>
    </div>
  );
};

export default function Home() {
  return (
    <>
      <HomeNav />
      {/* mobile */}
      <div className="md:hidden h-[100%] mt-[145px] w-screen flex flex-col items-center justify-center">
        <div className="bg-[#000000] opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] w-[90vw] relative">
          <div className="w-[90%] flex flex-col content-center justify-center ">
            <Bebop mobile={true} />
            <p className="pr-11 " style={{ textAlign: "right" }}>
              see ya space cowboy...
            </p>
          </div>
        </div>

        <div className="self-center w-[90vw] flex flex-col mt-2">
          <div className="h-[75px] bg-[#000000] opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] my-2 flex flex-col justify-center sm:px-20 px-5">
            <Card
              title="Resume"
              desc="My Background."
              color="#86efac"
              href="#"
              icon={faPaperclip}
            />
          </div>

          <div className="h-[75px] bg-[#000000] opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] my-2 flex flex-col justify-center sm:px-20 px-5">
            <Card
              title="Blogs"
              desc="Search through my back catalog."
              color="#fca5a5"
              href="/Search"
              icon={faMarkdown}
            />
          </div>

          <div className="h-[400px] bg-[#000000] opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] my-2 flex flex-col justify-center">
            <LatestBlogCard />
          </div>

          <div className="h-[75px] bg-[#000000] opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] flex flex-col justify-center">
            <Socials />
          </div>
        </div>
      </div>

      {/* desktop */}
      <div className="hidden md:flex h-[calc(100vh_-_50px)] w-screen flex-col justify-center">
        <div className="self-center w-[95%] h-[95%] max-w-[1250px] desktopgrid ">
          <div className="Svg flex justify-center content-center bg-[#000000] opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px]">
            <BebopContainer />
          </div>
          <div className="CV flex flex-col justify-center sm:px-20 md:px-5 py-5 px-5 bg-[#000000] opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px]">
            <Card
              title="Resume"
              desc="My Background."
              color="#86efac"
              href="/#"
              icon={faPaperclip}
            />
          </div>
          <div className="Blog flex flex-col justify-center sm:px-20 md:px-5 py-5 px-5 bg-[#000000] opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px]">
            <Card
              title="Blogs"
              desc="Search through my back catalog."
              color="#fca5a5"
              href="/Search"
              icon={faMarkdown}
            />
          </div>
          <div className="Latest-Blog bg-[#000000] opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] flex flex-col justify-center ">
            <LatestBlogCard />
          </div>
          <div className="Socials bg-[#000000] opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] flex flex-col justify-center py-5 ">
            <Socials />
          </div>
        </div>
      </div>
    </>
  );
}
