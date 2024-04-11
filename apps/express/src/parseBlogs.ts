//import mongoose from "mongoose";
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import workspacesRoot from 'find-yarn-workspace-root'
import { Blog, BlogSchemaType, MainSchema } from 'mongoschema'
import markdownToTxt from 'markdown-to-txt';
import { MDXRemoteSerializeResult } from 'next-mdx-remote'
import { glob } from 'glob'

const removeMeta = (fileContent: string) =>
  fileContent
    .split('\n')
    .filter(function (line) {
      const values = ['tags', 'description', 'date', 'title', 'image']
      for (const value of values) {
        if (line.includes(value)) {
          return false
        }
      }
      return true
    })
    .join('\n')

const striptext = (fileContent: string): string => {
  // the text parser includes meta tags so get rid of all of them
  const file = removeMeta(fileContent)

  // let stripp = "";
  // remark()
  //   .use(strip)
  //   .process(file, (err: any, con: { value: string }) => {
  //     const a = con?.value;
  //     //regex to add spaces between punc, this parser aint great
  //     stripp = a.replace(/\s*([,.!?:;]+)(?!\s*$)\s*/g, "$1 ");
  //   });

  return markdownToTxt(file).substring(0, 300)
}

const MetaAndContent = async (fileContent: string) => {
  const frontmatter = matter(fileContent).data

  // this is super ew..
  let ogtags = frontmatter.tags as unknown as string
  if (Array.isArray(ogtags))
    ogtags = ogtags.join("")

  const meta = Object.assign(frontmatter, {
    tags: ogtags.replace(' ', '').split(',')
  }) as BlogSchemaType["meta"]

  const content = await serialize(removeMeta(fileContent), {
    parseFrontmatter: false,
    mdxOptions: {
      development: false
      // rehypePlugins: [rehypeHighlight()]
    }
  })

  const mdx = content as BlogSchemaType["mdx"]

  return { mdx, meta }
}

const handleSingle = async (fpath: string, filename: string, childs?: BlogSchemaType[]): Promise<BlogSchemaType> => {
  const fileContent = fs.readFileSync(fpath, 'utf-8')
  const { mdx, meta } = await MetaAndContent(fileContent)
  const slug = filename.replace('.mdx', '')
  return {
    meta: meta,
    slug: slug,
    text: striptext(fileContent),
    mdx: mdx,
    children: childs != undefined ? childs : undefined,
    added: new Date(),
    _id: slug,
  }
}

const readAndRrocessBlogs = async () => {
  // console.log(process.env.NODE_ENV !== 'production')
  console.log("Updating blogs to the db")
  // this below dir parse code is pretty bad this needs fixed
  const blogDir = path.resolve(((workspacesRoot() as string) + process.env.BLOGS_PATH?.replace('.', '')) as string)

  console.log('reading from: ' + blogDir + '\n')
  const globbed = await glob(blogDir + "/**", { withFileTypes: true })

  const blogs: BlogSchemaType[] = []

  for (const file of globbed) {
    // the possibility that the file wont have a parent is an extreme edge case, who needs proper error handling ;)
    if (file.isNamed(file?.parent?.name! + ".mdx")) {

      // get paths of children
      const childrenPaths = file.parent?.children()
        .filter((child) => !child.isNamed(file?.parent?.name! + ".mdx"))
        .map((child) => child)
      console.log("read from child at:", file.fullpath(), "\nchildren: \n", childrenPaths?.map(e => e.name))

      // construct children
      const children = await Promise.all(childrenPaths!.map(async child => {
        return await handleSingle(child.fullpath(), child.name)
      }))
      console.log("constructed children")

      // construct parent
      const parentfile = await handleSingle(file.fullpath(), file.name, children)
      console.log("constructed object for parent")

      blogs.push(parentfile)
    }
    else {
      if ((!file.isDirectory()) && (file!.parent!.fullpath() == blogDir)) {
        console.log("handling file: ", file.fullpath())
        const blog = await handleSingle(file.fullpath(), file.name)
        blogs.push(blog)
      }
    }
  }

  return blogs
}

export const sendBlogsToServer = async () => {
  // parse and get blogs in filesystem
  const processedBlogs = await readAndRrocessBlogs()
  for (const processedBlog of processedBlogs!) {
    const update: BlogSchemaType = {
      _id: processedBlog.slug,
      meta: processedBlog.meta,
      mdx: processedBlog.mdx,
      slug: processedBlog.slug,
      text: processedBlog.text,
      added: new Date(),
      children: processedBlog.children,
    }

    MainSchema.parse(update)

    // console.log(`sending blog: ${processedBlog.slug} to db`)

    const blog = new Blog<BlogSchemaType>(update)

    const exists = await Blog.findById(processedBlog.slug).then()

    if (exists == null) {
      console.log(processedBlog.slug + ': blog not found on server, adding.')
      await blog.save().catch((e: any) => console.error(e))
    } else {
      //console.log(exists._id)
      //console.log(processedBlog.slug + ': updating blog on server')
      await Blog.findByIdAndUpdate(processedBlog.slug, update).then()
    }
    // console.log("updated blog\n")
  }
}
