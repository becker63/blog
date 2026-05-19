import { timingSafeEqual } from "node:crypto";
import type { NextRequest } from "next/server";

/** Vercel Cron / manual worker auth: Bearer token or `Authorization: Bearer <CRON_SECRET>`. */
export const verifyCronRequest = (request: NextRequest): boolean => {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) return false;
  const auth = request.headers.get("authorization");
  const token = auth?.startsWith("Bearer ") ? auth.slice("Bearer ".length).trim() : "";
  const headerFallback = request.headers.get("x-cron-secret")?.trim() ?? "";
  const probe = token || headerFallback;
  if (!probe || probe.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(probe), Buffer.from(expected));
  } catch {
    return false;
  }
};
