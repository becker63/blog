import { sql } from "drizzle-orm";

const run = async () => {
  const { getPublicProofDb } = await import("./client.js");
  const db = getPublicProofDb();
  await db.execute(sql`select 1`);
  void process.stdout.write("public-proof-db: connection OK.\n");
};

run().catch((err) => {
  void process.stderr.write(`${String((err as Error).message)}\n`);
  process.exitCode = 1;
});
