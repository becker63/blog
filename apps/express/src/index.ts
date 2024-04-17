import { zodiosApp } from "@zodios/express";
import { Blog, BlogSchemaType } from "mongoschema";
import mongoose from "mongoose";
import { z } from "zod";
import { API } from "api";
import { workspaceDotenv } from "helpers"; 
import * as dotenv from "dotenv"
import { sendBlogsToServer } from "./parseBlogs";

// process.env.NODE_ENV = 'production';
workspaceDotenv()
dotenv.config()
const app = zodiosApp(API);
const port = process.env.PORT || 3005


// eslint-disable-next-line @typescript-eslint/no-explicit-any
const errorHandler = (req: any, res: any, e:any) => {
  console.error(e, req.headers);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: "Internal error",
      headers: req.headers,
      errormsg: e,
    },
  });
}

app.get("/api/getAllPosts", async (req, res) => {
  try {
    const query = req.query;

    if (query.limit) {
      const blogs = await Blog.find<BlogSchemaType>({})
        .limit(query.limit)
        .then();
      res.send(blogs);
      return;
    }
    const blogs = await Blog.find<BlogSchemaType>({}).then();
    res.status(200).send(blogs);
  } catch (e) {
    errorHandler(req, res, e)
  }
});

app.get("/api/getNewestPosts", async (req, res) => {
  try {
    const query = req.query;

    if (query.limit) {
      const blogs = await Blog.find<BlogSchemaType>({})
        .sort({ added: -1 })
        .limit(query.limit)
        .then();

      res.send(blogs);
      return;
    }
    const blogs = await Blog.find<BlogSchemaType>({})
      .sort({ added: -1 })
      .then();

    res.status(200).send(blogs);
  } catch (e) {
    errorHandler(req, res, e)
  }
});

export const API_findByID = z.object({
  slug: z.string(),
});

app.get("/api/getSpecificPost", async (req, res) => {
  try {
    const query = API_findByID.parse(req.query);

    const blogs = await Blog.findById(query.slug).then();
  
    if (blogs != null) {
      res.status(200).send(blogs)
    } else {
      res.status(200).send('doesnt exist')
    }
    
  } catch (e) {
    errorHandler(req, res, e)
  }
});

app.listen(port, async () => {
  console.log(process.env.NODE_ENV)
  await mongoose.connect(process.env.DATABASE_URL!);
  await sendBlogsToServer()
  console.log(`Server running at ${process.env.EXPRESS_IP}\n`);
});

