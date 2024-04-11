import { Suspense } from "react";
import Image from "next/image";
import { Loading } from "../global_components/global_loading";
import { DescriptionTags, tags } from "../Search/Search_components/Badges";
import { API_client } from "api";
import Link from "next/link";

const LoadingCard = () => {
  return (
    <div className="w-full h-full flex justify-center items-center">
      <Loading fontsize={30} />
    </div>
  );
};

const FetchBlogs = async () => {
  const blogs = await API_client.get("/api/getNewestPosts", {
    queries: { limit: 3 },
  });

  return (
    <ul className="overflow-y-auto">
      {blogs.map((blog) => {
        const descomp = DescriptionTags(
          blog.meta.description.replace(" ", "").split(",") as tags[]
        );
        return (
          <Link
            href={"/Blogs/" + blog.slug}
            className="flex flex-row justify-between align-middle text-gray-800 mb-3 overflow-x-scroll"
            key={blog.slug}
          >
            <div className="flex flex-col max-w-[120]">
              <div>
                <h3 className="text-2xl font-bold text-white">
                  {blog.meta.title}
                </h3>
                <p className="text-gray-400">{blog.meta.description}</p>
              </div>

              <div>
                <p className="text-gray-200">{blog.meta.date}</p>
                <div>{descomp}</div>
              </div>
            </div>

            {!(blog.meta.image === undefined) ? <>
              <Suspense fallback={LoadingCard()}>
                <Image
                  src={blog.meta.image}
                  alt="blogcontent"
                  width={200}
                  height={200}
                  className=""
                />
              </Suspense>
            </> : <></>}
          </Link>
        );
      })}
    </ul>
  );
};

const LoadingLatest = () => (
  <div className="w-full h-full flex justify-center items-center">
    <Loading fontsize={30} />
  </div>
);

export const LatestBlogCard = () => {
  return (
    <div className="sm:px-20 lg:px-5 py-5 px-5 h-full">
      <h3 className="text-2xl text-bold text-blue-300">Latest</h3>
      <hr className="my-5" />
      <div className="w-full h-[80%] flex flex-col justify-center">
        <Suspense fallback={<LoadingLatest />}>
          <FetchBlogs />
        </Suspense>
      </div>
    </div>
  );
};
