//import mongoose from "mongoose";
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
import { serialize } from 'next-mdx-remote/serialize'
import workspacesRoot from 'find-yarn-workspace-root'
import { Blog, BlogSchemaType } from 'mongoschema'

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

const striptext = (fileContent: string) => {
  // the text parser includes meta tags so get rid of all of them
  const file = removeMeta(fileContent)

  //  let stripp = "";
  //  remark()
  //    .use(strip)
  //    .process(file, (err, con) => {
  //      const a = con?.value as unknown as string;
  //      //regex to add spaces between punc, this parser aint great
  //      stripp = a.replace(/\s*([,.!?:;]+)(?!\s*$)\s*/g, "$1 ");
  //    });

  return file
}

const MetaAndContent = async (fileContent: string) => {
  type metatype = {
    title: string
    date: string
    description: string
    tags: string[]
    image: string
  }
  const frontmatter = matter(fileContent).data as metatype
  const ogtags = frontmatter.tags as unknown as string
  const meta = Object.assign(frontmatter, {
    tags: ogtags.replace(' ', '').split(',')
  })

  const content = await serialize(removeMeta(fileContent), {
    parseFrontmatter: false,
    mdxOptions: {
      development: true
      // rehypePlugins: [rehypeHighlight()]
    }
  })

  const mdx = content

  return { mdx, meta }
}

const readAndRrocessBlogs = async () => {
  // console.log(process.env.NODE_ENV !== 'production')
  console.log("Updating blogs to the db")
  // this below dir parse code is pretty bad this needs fixed
  const blogDir = path.resolve(((workspacesRoot() as string) + process.env.BLOGS_PATH?.replace('.', '')) as string)
  console.log('reading from: ' + blogDir + '\n')
  const files = fs.readdirSync(path.join(blogDir))

  const blogs = await Promise.all(
    files.map(async filename => {
      // 4) Read the content of that blog
      const fileContent = fs.readFileSync(path.join(blogDir, filename), 'utf-8')

      const { mdx, meta } = await MetaAndContent(fileContent)

      return {
        meta: meta,
        slug: filename.replace('.mdx', ''),
        text: striptext(fileContent),
        mdx: mdx
      }
    })
  ).catch(e => {
    console.error(e)
  })

  return blogs
}

export const sendBlogsToServer = async () => {
  // parse and get blogs in filesystem
  const processedBlogs = await readAndRrocessBlogs()
  for (const processedBlog of processedBlogs!) {
    const update = {
      _id: processedBlog.slug,
      meta: processedBlog.meta,
      mdx: processedBlog.mdx,
      slug: processedBlog.slug,
      text: processedBlog.text,
      added: new Date()
    }

    console.log(`sending blog: ${processedBlog.slug} to db`)

    const blog = new Blog<BlogSchemaType>(update)

    const exists = await Blog.findById(processedBlog.slug).then()

    if (exists == null) {
      console.log(processedBlog.slug + ': blog not found on server, adding..\n')
      await blog.save().catch(e => console.error(e))
    } else {
      console.log(exists._id)
      console.log(processedBlog.slug + ': updating blog on server')
      await Blog.findByIdAndUpdate(processedBlog.slug, update).then()
    }
    console.log("updated blog\n")
  }
}
