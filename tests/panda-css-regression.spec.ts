import { expect, test } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

test.describe("Panda CSS extraction (regression)", () => {
  test("desktop: mobile home root is display:none and dashboard grid is visible", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(1500);

    const mobileRoot = page.getByTestId("home-mobile-layout-root");
    const desktopRoot = page.getByTestId("home-desktop-layout-root");
    const dashboard = page.getByTestId("home-dashboard-grid");

    await expect(dashboard).toBeVisible();

    const mobileDisplay = await mobileRoot.evaluate((el) => getComputedStyle(el).display);
    const desktopDisplay = await desktopRoot.evaluate((el) => getComputedStyle(el).display);

    expect(mobileDisplay, "mobile layout must be hidden at lg+").toBe("none");
    expect(desktopDisplay, "desktop layout must be flex at lg+").toBe("flex");
  });

  test("mobile width: desktop dashboard is hidden", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`${BASE_URL}/`);
    await page.waitForTimeout(1500);

    const desktopRoot = page.getByTestId("home-desktop-layout-root");
    const display = await desktopRoot.evaluate((el) => getComputedStyle(el).display);
    expect(display, "desktop shell must stay display:none below lg").toBe("none");
  });

  test("blog MDX: prose wrapper applies heading typography (CSS present, not browser default)", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1100, height: 800 });
    await page.goto(`${BASE_URL}/Blogs/zed`);
    await page.waitForTimeout(1500);

    const prose = page.getByTestId("blog-post-prose");
    await expect(prose).toBeVisible();

    const h2 = prose.locator("h2").first();
    await expect(h2).toBeVisible();

    const h2SizePx = await h2.evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    expect(h2SizePx, "MDX h2 should use prose token scale (~1.5rem), not default ~1rem").toBeGreaterThan(
      20,
    );

    const sheetHasProseAtoms = await page.evaluate(() => {
      const needle = "max-w_65ch";
      const nested = "[&_h2]";
      for (const sheet of Array.from(document.styleSheets)) {
        let rules: CSSRuleList;
        try {
          rules = sheet.cssRules;
        } catch {
          continue;
        }
        for (let i = 0; i < rules.length; i++) {
          const text = rules[i]!.cssText;
          if (text.includes(needle) && text.includes(nested)) return true;
        }
      }
      return false;
    });

    expect(sheetHasProseAtoms, "built CSS should define prose atomic classes").toBe(true);
  });
});
