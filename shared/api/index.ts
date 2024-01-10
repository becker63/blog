import {
    Zodios,
  makeApi,
  makeErrors,
  makeParameters,
} from "@zodios/core";
import { z } from "zod";
import { MainSchema } from "mongoschema";
import { workspaceDotenv } from "helpers"; 
import * as dotenv from "dotenv"

workspaceDotenv()
dotenv.config()

const limitParam = makeParameters([
  {
    name: "limit",
    type: "Query",
    description: "limit how many blogs cmd outputs",
    schema: z.coerce.number().nullish(),
  },
]);

const errorType = makeErrors([
  {
    status: "default",
    description: "Default error",
    schema: z.object({
      error: z
        .object({
          code: z.string(),
          message: z.string(),
          headers: z.any(),
          errormsg: z.any(),
        })
        .strict(),
    }),
  },
]);

export const API = makeApi([
  {
    method: "get",
    path: "/api/getAllPosts",
    alias: "getAllPosts",
    parameters: limitParam,
    description: "Get all posts",
    response: MainSchema.array(),
    errors: errorType,
  },
  {
    method: "get",
    path: "/api/getNewestPosts",
    alias: "getNewestPosts",
    parameters: limitParam,
    description: "Get latest posts",
    response: MainSchema.array(),
    errors: errorType,
  },
  {
    method: "get",
    path: "/api/getSpecificPost",
    alias: "getSpecificPost",
    parameters: [
      {
        name: "slug",
        type: "Query",
        description: "The id/slug of the blog you want",
        schema: z.string(),
      },
    ],
    description: "Get latest posts",
    response: z.union([MainSchema, z.null()]),
    errors: errorType,
  },
]);

export const API_client = new Zodios(process.env.EXPRESS_IP as string, API)