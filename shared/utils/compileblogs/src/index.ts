//import mongoose from "mongoose";
import fs from 'fs'
import path from 'path'
import matter from 'gray-matter'
// import mdx from "remark-mdx";
// import { remark } from "remark";
import { serialize } from 'next-mdx-remote/serialize'
// import rehypeHighlight from 'rehype-highlight'
import mongoose, { connect } from 'mongoose'
import * as dotenv from 'dotenv'
import { Blog } from 'mongoschema'
import { BlogSchemaType } from 'mongoschema'
import {workspaceDotenv} from "helpers"
import workspacesRoot from 'find-yarn-workspace-root'

workspaceDotenv()
dotenv.config()

//import {serialize, deserialize} from "../../node_modules_tweaked/react-serialize"
// import { workspaceDotenv } from 'helpers'

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
  console.log(frontmatter)
  const meta = Object.assign(frontmatter, {
    tags: ogtags.replace(' ', '').split(',')
  })

  console.log(meta)

  const content = await serialize(removeMeta(fileContent), {
    parseFrontmatter: false,
    mdxOptions: {
      development:  true,
      // rehypePlugins: [rehypeHighlight()]
    }
  })

  const mdx = content

  return { mdx, meta }
}

const readAndRrocessBlogs = async () => {
  // this below is pretty bad this needs fixed
  const blogDir = path.resolve(workspacesRoot() as string + process.env.BLOGS_PATH?.replace(".", "") as string)
  console.log("reading from: " + blogDir)
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
    console.log(e)
  })

  return blogs
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const main = async () => {
  const processedBlogs = await readAndRrocessBlogs()

  await connect(encodeURI(process.env.DATABASE_URL!))

  for (const processedBlog of processedBlogs!) {
    const update = {
      _id: processedBlog.slug,
      meta: processedBlog.meta,
      mdx: processedBlog.mdx,
      slug: processedBlog.slug,
      text: processedBlog.text,
      added: new Date()
    }

    const blog = new Blog<BlogSchemaType>(update)

    //    const blog2 = Blog.findById("blog._id")
    //    console.log(blog2)

    const exists = await Blog.exists({ _id: processedBlog.slug }).then()
    console.log(exists)

    if (exists == null) {
      console.log(processedBlog.slug + ': blog not found, adding')
      await blog.save()
    } else {
      console.log(processedBlog.slug + ': updating blog')
      Blog.findByIdAndUpdate(processedBlog.slug, update)
    }
  }
  await mongoose.connection.close()

  return
}

main();

//readAndRrocessBlogs()

//let str = "test wow test"
//const comp = lz.compress(str)
//console.log(comp)
