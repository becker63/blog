"server-only";

import "./blog.css";
import { MDX } from "./blog_Components/MDX";
import React from "react";
import { API_client } from "api";

export async function generateStaticParams() {
  const blogs = await API_client.get("/api/getAllPosts");

  const paths = blogs.map((blog) => ({
    slug: blog.slug,
  }));

  return paths;
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const blog = await API_client.get("/api/getSpecificPost", {
    queries: { slug: params.slug },
  });

  if(blog)
  return {
    title: blog.meta.title,
    description: blog.meta.description,
  };
}

export default async function Post({ params }: { params: { slug: string } }) {
  try {
    const blog = await API_client.get("/api/getSpecificPost", {
      queries: { slug: params.slug },
      
    },);

    if (blog) {
      return (
        <>
          <div className="opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] bg-[#000000] w-[90%] h-[90%] md:w-[80%] md:h-[80%] lg:w-[70%] lg:h-[70%] mx-auto p-6 mb-5">
            <div className="prose prose-base lg:prose-lg 2xl:prose-2xl prose-invert mx-auto prose-hr:hidden">
              <div className="mb-5">
                <h1 className="font-bold text-3xl xl:mt-24 mb-0">
                  {blog.meta.title}
                </h1>
                <time className="text-gray-500 italic">{blog.meta.date}</time>
                <div className="border-b white w-full mt-5" />
              </div>
              <MDX post={blog.mdx.compiledSource} />
            </div>
          </div>
        </>
      );
    }
  } catch (error) {
    console.error(error);
    return <p>something broke or this blog doesnt exist :/</p>;
  }
}
