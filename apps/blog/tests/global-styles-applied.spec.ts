import { expect, test } from "@playwright/test";

/**
 * Regression: pages look completely **unstyled** in dev when Panda utility CSS never reaches the
 * browser (class names render, but rules for `.c_*` atoms are missing). This suite checks both:
 * - **`globals.css`** hand-written rules (e.g. `body` background),
 * - **Panda utilities** from `styled-system/styles.css` (e.g. `.c_white` on `<html>` from `RootLayout`).
 */
const ROUTES: ReadonlyArray<{ path: string; name: string }> = [
  { path: "/", name: "home" },
  { path: "/Search", name: "search" },
  { path: "/Blogs/zed", name: "blog post (MDX)" },
  { path: "/admin/login", name: "admin login" },
];

/** #581f37 from `globals.css` — if this fails, the main stylesheet bundle did not load. */
const BODY_BG = "rgb(88, 31, 55)";

async function settle(page: import("@playwright/test").Page) {
  await page.waitForLoadState("load");
  await page.waitForTimeout(500);
}

test.describe("Global CSS (Panda + globals.css)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  for (const { path, name } of ROUTES) {
    test(`${name} (${path}): layout shell has Panda + globals styles`, async ({ page }) => {
      await page.goto(path, { waitUntil: "domcontentloaded" });
      await settle(page);

      await expect(page.locator("body")).toHaveCSS("background-color", BODY_BG);

      const html = page.locator("html");
      await expect(html).toHaveAttribute("class", /\bc_white\b/);
      await expect(html).toHaveCSS(
        "color",
        "rgb(255, 255, 255)",
        {
          timeout: 15_000,
        },
      );

      const shell = page.locator("body > div").first();
      await expect(shell).toBeVisible();
      await expect(shell).toHaveCSS("position", "relative");
      await expect(shell).toHaveCSS("z-index", "1");
    });
  }

  test("home: parsed stylesheets define Panda atomic utilities (e.g. .c_white)", async ({
    page,
  }) => {
    await page.goto("/", { waitUntil: "domcontentloaded" });
    await settle(page);

    const hasCWhiteRule = await page.evaluate(() => {
      const needle = ".c_white";
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (let i = 0; i < rules.length; i++) {
          if (rules[i]!.cssText.includes(needle)) return true;
        }
      }
      return false;
    });

    expect(
      hasCWhiteRule,
      "expected a stylesheet rule for .c_white (import styled-system/styles.css via globals.css)",
    ).toBe(true);
  });
});
