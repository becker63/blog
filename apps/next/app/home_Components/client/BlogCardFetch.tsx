
// // Client use of trpc isnt supported yet. When it is maybe check out..
// // https://github.com/trpc/next-13/blob/main/client/trpcClient.tsx
// 
// "use client";
// import { Loading } from "../../global_components/global_loading";
// import { Suspense } from "react";
// import Image from "next/image";
// import { v4 as uuidv4 } from 'uuid';
// 
// 
// const LoadingCard = () => {return (
//   <div className="w-full h-full flex justify-center items-center">
//         <Loading fontsize={30} />
//       </div>
// )}
// 
// export const LatestBlogCardFetch = () => {
//   const [post, postQuery] = browserClient.getNewestBlogs.useSuspenseQuery()  
//   
// 
//   return (
//     <Suspense fallback={LoadingCard()}>
//     <ul className="overflow-y-auto">
//     {blogs.map((blog) => {
//       return (
//         <div className="flex flex-row justify-between align-middle text-gray-800 mb-3" key={uuidv4()}>
//         <div className="flex flex-col">
//           <div>
//             <h3 className="text-2xl font-bold text-white">{blog.meta.title}</h3>
//             <p className="text-green-300">{blog.meta.description}</p>
//           </div>
// 
//           <div>
//             <p className="text-red-300">{blog.meta.date}</p>
//             <div>{descomp}</div>
//           </div>
//         </div>
// 
//         <Image
//           src="http://google.com/blogcontent.jpg"
//           alt="blogcontent"
//           width={200}
//           height={200}
//           className=""
//         />
//       </div>
//       )
//     })}
//     </ul>
//     </Suspense>
//   );
// 
//   return (
//     <p>something broke. heres the error: {JSON.stringify(error)}</p>
//   )
// };
