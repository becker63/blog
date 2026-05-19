import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

const connectionString =
  () => process.env.POSTGRES_URL ?? process.env.POSTGRES_URL_NON_POOLING ?? process.env.DATABASE_URL;

let cached: ReturnType<typeof drizzle<typeof schema>> | undefined;

/** Serverless Drizzle instance (Vercel Postgres / Neon). */
export const getPublicProofDb = () => {
  const url = connectionString();
  if (!url?.trim()) {
    throw new Error("POSTGRES_URL (or DATABASE_URL) is required to connect PublicProof Drizzle.");
  }
  cached ??= drizzle(neon(url), { schema });
  return cached;
};
