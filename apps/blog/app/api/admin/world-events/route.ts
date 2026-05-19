import { validateAdminCookies } from "@/lib/admin/session-verify";

import { ADMIN_UI_WORLD_EVENTS } from "public-proof-admin-core/fixture";

export const dynamic = "force-dynamic";

/**
 * SSE stream of canonical fixture events — same vocabulary as `adminWorldState$` / Jotai bridge.
 * Requires an authenticated admin session cookie.
 */
export async function GET() {
  if (!validateAdminCookies()) {
    return new Response("Unauthorized", { status: 401 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      try {
        for (const ev of ADMIN_UI_WORLD_EVENTS) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(ev)}\n\n`));
          await new Promise((r) => setTimeout(r, 380));
        }
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
