import Link from "next/link";
import Image from "next/image";
import { DescriptionTags, tags } from "./Badges";
import React from "react";
import { API_client } from "api";

export const Fetchblogmeta = async () => {
  const blogs = await API_client.get("/api/getAllPosts");

  return (
    <div
      id="mobile view"
      className="flex flex-col w-full justify-center content-center mobileparentsize mt-1"
    >
      <ul>
        {blogs.map((blog) => {
          const tags = blog.meta.tags;
          //console.log(tags)
          const DescComp = DescriptionTags(tags as tags[]);
          //console.log(DescComp)
          return (
              <li className="self-center text-gray-800 sm:w-[80vw] md:w-[60vw] sm:mx-auto px-5 py-5 mb-5 mx-5 opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] bg-[#000000]" key={blog.slug}>
                <Link href={"/Blogs/" + blog.slug} key={blog.slug} className="flex flex-row justify-between align-middle">
                <div className="flex flex-col md:w-[30vw]">
                  <div>
                    <h3 className="text-2xl font-bold text-white">
                      {blog.meta.title}
                    </h3>
                    <p className="text-gray-400">{blog.meta.description}</p>
                  </div>

                  <div className="hidden sm:flex sm:text-gray-500 sm:flex-grow items-center md:w-[25vw] py-4">
                    <span className="inline-block align-middle">
                      {blog.text}
                    </span>
                  </div>

                  <div>
                    <p className="text-gray-200">{blog.meta.date}</p>
                    <div>{DescComp}</div>
                  </div>
                </div>

                <Image
                  src={blog.meta.image}
                  alt="blogcontent"
                  width={300}
                  height={300}
                  className=""
                />
                </Link>
              </li>
          );
        })}
      </ul>
    </div>
  );
};
