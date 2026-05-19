"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { audienceGateSchema } from "public-proof-core/audience";
import { getPublicProofDb } from "public-proof-db/client";
import { insertAuditLog } from "public-proof-db/queries/audit-log";
import { getLaunchBySlug, setLaunchAudienceGateBySlug } from "public-proof-db/queries/launches";

import { validateAdminCookies } from "./session-verify";

export async function updateLaunchAudienceGate(formData: FormData): Promise<void> {
  if (!validateAdminCookies()) redirect("/admin/login");

  const slug = String(formData.get("slug") ?? "").trim();
  const rawGate = String(formData.get("audienceGate") ?? "").trim();
  if (!slug) return;

  const gateParse = audienceGateSchema.safeParse(rawGate);
  if (!gateParse.success) return;

  const db = getPublicProofDb();
  const before = await getLaunchBySlug(db, slug);
  if (!before) return;

  const updated = await setLaunchAudienceGateBySlug(db, slug, gateParse.data);
  if (!updated) return;

  await insertAuditLog(db, {
    actor: "owner",
    event: "launch_audience_gate_updated",
    entityType: "launch",
    entityId: updated.id,
    metadataJson: {
      slug,
      audienceGatePrevious: before.audienceGate,
      audienceGateNext: gateParse.data,
    },
  });

  revalidatePath(`/admin/launches/${slug}`);
  revalidatePath("/admin/launches");
}
