import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { migrate } from "drizzle-orm/neon-http/migrator";

const dir = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = resolve(dir, "..", "drizzle");

const url = process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL ?? process.env.DATABASE_URL;

if (!url?.trim()) {
  throw new Error("Set POSTGRES_URL_NON_POOLING (preferred) or POSTGRES_URL before running migrations.");
}

const sql = neon(url);
const db = drizzle(sql);
await migrate(db, { migrationsFolder });
void process.stdout.write(`public-proof-db: migrated from ${migrationsFolder}\n`);
