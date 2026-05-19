import { test, expect } from "@playwright/test";

/**
 * Keeps prerender/build regressions from shipping: missing profile assignments,
 * broken MDX, and other server failures show up as 5xx.
 *
 * Uses the HTTP `request` API only so these pass in minimal CI images without
 * Playwright's full browser system dependencies; layout tests still cover UI in `layout.spec.ts`.
 */
const PUBLIC_PATHS = [
  "/",
  "/Search",
  "/Blogs/ai-cognitive-overload",
  "/Blogs/ai-release-reports",
  "/Blogs/bundles",
  "/Blogs/designing-for-two",
  "/Blogs/searchbench-100x-context-reduction",
  "/Blogs/the-firewall-doesnt-live-in-the-kernel",
  "/Blogs/tight-loops",
  "/Blogs/zed",
];

test.describe("public routes (no 5xx)", () => {
  for (const path of PUBLIC_PATHS) {
    test(`GET ${path}`, async ({ request }) => {
      const res = await request.get(path);
      expect(
        res.status(),
        `${path} returned ${res.status()}`,
      ).toBeLessThan(500);
    });
  }
});

test.describe("public routes (HTML body)", () => {
  test("home returns HTML", async ({ request }) => {
    const res = await request.get("/");
    expect(res.status()).toBeLessThan(500);
    const body = await res.text();
    expect(body.length).toBeGreaterThan(100);
  });

  test("Search returns HTML", async ({ request }) => {
    const res = await request.get("/Search");
    expect(res.status()).toBeLessThan(500);
    expect(await res.text()).toMatch(/html/i);
  });

  test("MDX post with mermaid returns HTML", async ({ request }) => {
    const res = await request.get(
      "/Blogs/the-firewall-doesnt-live-in-the-kernel",
    );
    expect(res.status()).toBeLessThan(500);
    const text = await res.text();
    expect(text.length).toBeGreaterThan(200);
  });
});

test.describe("admin (public login)", () => {
  test("/admin/login responds", async ({ request }) => {
    const res = await request.get("/admin/login");
    expect(res.status()).toBeLessThan(500);
  });

  test("/admin/login returns HTML shell", async ({ request }) => {
    const res = await request.get("/admin/login");
    expect(res.status()).toBeLessThan(500);
    expect(await res.text()).toMatch(/html/i);
  });
});

test.describe("admin private surface (no crash)", () => {
  test("unauthenticated /admin does not 500", async ({ request }) => {
    const res = await request.get("/admin");
    expect(res.status()).toBeLessThan(500);
  });

  test("unauthenticated /admin/launches does not 500", async ({ request }) => {
    const res = await request.get("/admin/launches");
    expect(res.status()).toBeLessThan(500);
  });
});
