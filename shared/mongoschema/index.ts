import { ZodType, z } from "zod";
import { zodSchema, zodSchemaRaw } from '@zodyac/zod-mongoose';
import mongoose, { Model, Schema } from "mongoose";
import { toZod } from "tozod";

export const MetaSchema = z.object({
  title: z.string(),
  date: z.string(),
  description: z.string(),
  tags: z.array(z.string()),
  image: z.string().optional(),
  _id: z.any().optional(),
}).strict();

export const MdxSchema = z.object({
  compiledSource: z.string(),
  frontmatter: z.any().optional(),
  scope: z.any().optional(),
  _id: z.any().optional(),
}).strict();

export const mainBase = z.object({
  _id: z.string(),
  text: z.string().optional(),
  meta: MetaSchema,
  slug: z.string(),
  added: z.date().or(z.string().pipe( z.coerce.date() )),
  mdx: MdxSchema,
  __v: z.any().optional(),
})

const pwea = () => {
  console.log("zach was here, so was zane")
}

export const MainSchema = mainBase.extend({
  children: mainBase.array().optional()
}).strict()

export type BlogSchemaType = z.infer<typeof MainSchema>;
const MongoSchema = zodSchema(MainSchema);

// its possible there could already be a model created bc of use on the client and server, if so just index it if not create one
export const Blog =
  mongoose.models["BlogSchema"] as Model<typeof MainSchema> ||
  mongoose.model(
    "BlogSchema",
    MongoSchema
  );