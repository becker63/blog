import { z } from "zod";
import { audienceGateSchema } from "./audience";

/** Git-backed import fixture (slug is stable string id separate from Postgres uuid). */
export const launchFixtureImportSchema = z.object({
  slug: z.string().min(1),
  title: z.string().min(1),
  postSlug: z.string().min(1),
  canonicalPath: z.string().min(1),
  campaign: z.string().min(1),
  primaryClaim: z.string().min(1),
  resumeClaim: z.string().min(1),
  audienceGate: audienceGateSchema,
});

export type LaunchFixtureImport = z.infer<typeof launchFixtureImportSchema>;
