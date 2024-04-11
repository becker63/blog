import Link from "next/link";
import Image from "next/image";
import { DescriptionTags, tags } from "./Badges";
import React, { Suspense } from "react";
import { API_client } from "api";
import { BlogSchemaType } from "mongoschema";
import { passByRef } from "helpers"

export const Fetchblogmeta = async () => {
  const blogs = await API_client.get("/api/getAllPosts");

  const topOrBottomLines = (index: number, last: number) => {
    if (index == 0) {
      return "h-[50%] translate-y-full"
    }
    if (index == last) {
      return "h-[50%] "
    }
    return "h-[100%]"
  }

  const Log = (p: { data: any }) => {
    console.log(p.data)
    return <></>
  }

  const Lines = (p: { index: number, last: number, lineLength: number, child?: boolean }) => {
    return (
      <>
        <div className="bg-opacity-100 opacity-100">
          {
            p.child == true && p.index == 0 ?
              p.index == p.last ?
                <div className={"h-[calc(50%_+_20px)] -translate-y-[20%] sm:-translate-y-[13%] md:-translate-y-[10%] lg:-translate-y-[13%] bg-white w-[1px]"} />
                :
                <div className={"h-[calc(100%_+_20px)] -translate-y-[10%] sm:-translate-y-[7%] md:h-[calc(100%_+_25px)] md:-translate-y-[5%] lg:h-[calc(100%_+_25px)] lg:-translate-y-[7%]  bg-white w-[1px]"} />
              :
              <div className={topOrBottomLines(p.index, p.last) + " bg-white w-[1px]"} />
          }
        </div>
        <div className="flex flex-col justify-center content-center">
          <div className={"h-[1px] bg-white"} style={{ "width": p.lineLength.toString() + "px" }} />
        </div>
      </>

    )
  }

  const InnerCard = (p: { blog: BlogSchemaType }) => {
    const blog = p.blog
    const tags = blog.meta.tags;
    const DescripTags = DescriptionTags(tags as tags[]);

    return (
      <Link href={"/Blogs/" + blog.slug} key={blog.slug} className={!(blog.meta.image === undefined) ? "grid grid-cols-[70%_30%] md:grid-cols-[50%_50%] lg:grid-cols-[60%_40%]" : "flex justify-center items-center"}>
        <div className="flex flex-col ">
          <div>
            <h3 className="text-2xl font-bold text-white">
              {blog.meta.title}
            </h3>
            <p className="text-gray-400 overflow-scroll">{blog.meta.description}</p>
          </div>

          <div className="hidden sm:flex sm:text-gray-500 sm:flex-grow items-center py-4">
            <span className="inline-block align-middle">
              {blog.text}
            </span>
          </div>

          <div>
            <p className="text-gray-200">{blog.meta.date}</p>
            <div>{DescripTags}</div>
          </div>
        </div>

        <div className="flex justify-center">
          {!(blog.meta.image === undefined) ? <>
            <Image
              src={blog.meta.image}
              alt="blogcontent"
              width={200}
              height={200}
              className=""
            />
          </> : <></>}
        </div>
      </Link>
    )
  }

  const Card = (blog: BlogSchemaType, index: number) => {
    const tags = blog.meta.tags;
    const DescripTags = DescriptionTags(tags as tags[]);

    return (
      <>

        {/*parent*/}
        <div className="flex flex-row mx-5 ">
          <Lines index={index} last={blogs.length - 1} lineLength={15} />
          <div className="self-center text-gray-800 w-[90vw] sm:w-[80vw] md:w-[60vw] px-5 py-5 mb-5 opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] bg-[#000000]" key={blog.slug}>
            <InnerCard blog={blog} />
          </div>
        </div>
        {/* child */
          blog.children?.length !== 0 ?
            (
              blog.children?.map((child, childindex) => {
                console.log(index, blogs.length)
                const returned = (
                  <>
                  <div className="flex flex-row mx-auto justify-end">
                  {
                    index !== blogs.length -1 ? 
                    <div className="mr-auto bg-white w-[1px]" />
                    :
                    <></>
                    }
                    <Lines index={childindex} last={blog.children!.length - 1} lineLength={15} child={true} />
                    <div className="flex flex-row  w-[85%]" key={child.slug}>
                      <div className="self-center text-gray-800 w-[90vw] sm:w-[80vw] md:w-[60vw] px-5 py-5 mb-5 opacity-70 rounded-[10px] shadow-[#00000F_0_0_10px] bg-[#000000]">
                        <InnerCard blog={child} />
                      </div>
                    </div>
                  </div>
                  </>
                )
                return returned
              })
            )
            :
            <></>

        }

      </>
    )
  }
  // this is a modified version of the index in map, that is set to 0 when we encounter a child
  // so that our lines will end at the right points
  const renderBlogs: React.JSX.Element[] = []

  console.log()
  for (const [index, blog] of blogs.entries()) {
    console.log(index, blog.slug)
    renderBlogs.push(Card(blog, index))
  }

  return (
    <div
    >
      <ul className="flex flex-col w-full justify-center content-center items-center">
        {renderBlogs}
      </ul>
    </div>
  );
};
