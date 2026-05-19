"use server";

import { cookies } from "next/headers";

import { redirect } from "next/navigation";

import {
  ADMIN_AUTH_COOKIE,
  adminSessionToken,
} from "./session-verify";

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "").trim();
  const secret = process.env.PUBLIC_PROOF_ADMIN_SECRET?.trim();
  if (!secret || password !== secret) {
    redirect("/admin/login?error=1");
    return;
  }
  cookies().set(ADMIN_AUTH_COOKIE, adminSessionToken(secret), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/admin",
    maxAge: 60 * 60 * 12,
  });
  redirect("/admin");
}

export async function adminLogout() {
  cookies().set(ADMIN_AUTH_COOKIE, "", { httpOnly: true, path: "/admin", maxAge: 0 });
  redirect("/admin/login");
}
