import { NextResponse } from "next/server";

/** Stub: reject actions from the mobile companion. */
export async function POST() {
  return NextResponse.json({ error: "not_implemented" }, { status: 501 });
}
