import { zodiosApp } from "@zodios/express";
import { Blog, BlogSchemaType, MainSchema } from "mongoschema";
import mongoose from "mongoose";
import { z } from "zod";
import { API } from "api";
import { workspaceDotenv } from "helpers"; 

workspaceDotenv()
const app = zodiosApp(API);
const port = process.env.PORT || 3000;


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

    const blogs = await Blog.findById<BlogSchemaType>(query.slug).then();
  
    res.status(200).send(MainSchema.parse(blogs));
    
  } catch (e) {
    errorHandler(req, res, e)
  }
});

app.listen(port, () => {
  mongoose.connect(process.env.DATABASE_URL!);
  console.log(`Server running at http://localhost:${port}`);
});
