import { createHash, timingSafeEqual } from "node:crypto";

import { cookies } from "next/headers";

export const ADMIN_AUTH_COOKIE = "pp-admin-session";

/** Deterministic session value derived from deployment secret — not the raw secret. */
export const adminSessionToken = (adminSecret: string) =>
  createHash("sha256").update(`${adminSecret}:public-proof:v1`).digest("base64url");

export const validateAdminCookies = (): boolean => {
  const secret = process.env.PUBLIC_PROOF_ADMIN_SECRET?.trim();
  if (!secret) return false;
  const token = cookies().get(ADMIN_AUTH_COOKIE)?.value;
  const expected = adminSessionToken(secret);
  if (!token || token.length !== expected.length) return false;
  try {
    return timingSafeEqual(Buffer.from(token), Buffer.from(expected));
  } catch {
    return false;
  }
};
