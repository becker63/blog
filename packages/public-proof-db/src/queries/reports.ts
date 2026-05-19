import { desc, eq } from "drizzle-orm";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";

import * as schema from "../schema";

export async function insertLaunchReport(
  db: NeonHttpDatabase<typeof schema>,
  input: {
    launchId: string;
    postingJobId?: string | null;
    bodyMarkdown: string;
    sourceKind?: string;
  },
): Promise<string> {
  const [row] = await db
    .insert(schema.launchReports)
    .values({
      launchId: input.launchId,
      postingJobId: input.postingJobId ?? null,
      bodyMarkdown: input.bodyMarkdown,
      sourceKind: input.sourceKind ?? "render_report_cron",
      createdAt: new Date(),
    })
    .returning({ id: schema.launchReports.id });
  return row!.id as string;
}

export async function listLaunchReportsForLaunch(
  db: NeonHttpDatabase<typeof schema>,
  launchId: string,
  limit = 12,
): Promise<Array<typeof schema.launchReports.$inferSelect>> {
  return db
    .select()
    .from(schema.launchReports)
    .where(eq(schema.launchReports.launchId, launchId))
    .orderBy(desc(schema.launchReports.createdAt))
    .limit(limit);
}
