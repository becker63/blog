import process from "node:process";

import { getLaunchPostJobById, getPublicProofDb } from "public-proof-db";

const jobIdRaw = process.argv.find((arg) => arg.startsWith("--job="))?.split("=")[1]?.trim();

if (!jobIdRaw) {
  console.error("usage: tsx packages/public-proof-cli/src/job-status.ts --job=<uuid>");
  process.exitCode = 1;
} else {
const db = getPublicProofDb();
const job = await getLaunchPostJobById(db, jobIdRaw);
if (!job) {
  console.error(JSON.stringify({ error: "job_not_found" }));
  process.exitCode = 1;
} else {
  console.log(JSON.stringify(job, null, 2));
}
}
