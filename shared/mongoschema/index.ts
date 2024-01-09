import { z } from "zod";
import {
  toMongooseSchema,
  toZodMongooseSchema,
} from "mongoose-zod";
import mongoose, { Model } from "mongoose";

export const MetaSchema = z.object({
  title: z.string(),
  date: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  image: z.string(),
  _id: z.any().optional(),
});

export const MdxSchema = z.object({
  compiledSource: z.string(),
  frontmatter: z.any().optional(),
  scope: z.any().optional(),
  _id: z.any().optional(),
});

export const MainSchema = z.object({
  _id: z.string(),
  text: z.string().optional(),
  meta: MetaSchema,
  slug: z.string(),
  added: z.date().or(z.string().pipe( z.coerce.date() )),
  mdx: MdxSchema,
});

export type BlogSchemaType = z.infer<typeof MainSchema>;

// its possible there could already be a model created bc of use on the client and server, if so just index it if not create one
export const Blog =
   mongoose.models["BlogSchema"] as Model<typeof MainSchema> ||
   mongoose.model(
     "BlogSchema",
     toMongooseSchema(toZodMongooseSchema(MainSchema))
   );

// export const Blog = mongoose.model("BlogSchema", toMongooseSchema(toZodMongooseSchema(MainSchema)))
