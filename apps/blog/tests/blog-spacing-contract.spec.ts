import { expect, test } from "@playwright/test";

import { SEARCH_ROOT_CATEGORY_GAP_PX } from "../app/components/search/TreeLines";

/**
 * Locks **current** blog spacing as rendered in the browser — no token names here.
 * If this fails after a layout change, either revert the visual change or update this
 * spec deliberately in the same PR as any Panda/docs “enshrinement”.
 */
const PX_TOLERANCE = 2;

test.describe("Blog spacing contract (visual baseline)", () => {
  test("home desktop: dashboard grid gap stays 12px (layout rhythm)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");
    await page.waitForTimeout(1500);

    const gapPx = await page.getByTestId("home-dashboard-grid").evaluate((el) => {
      const s = getComputedStyle(el);
      return parseFloat(s.rowGap || s.gap || "0");
    });

    expect(gapPx).toBeGreaterThanOrEqual(12 - PX_TOLERANCE);
    expect(gapPx).toBeLessThanOrEqual(12 + PX_TOLERANCE);
  });

  test("home mobile: card stack column gap stays 12px", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForTimeout(2000);

    const gapPx = await page.getByTestId("home-mobile-card-stack").evaluate((el) => {
      const s = getComputedStyle(el);
      return parseFloat(s.gap || s.rowGap || "0");
    });

    expect(gapPx).toBeGreaterThanOrEqual(12 - PX_TOLERANCE);
    expect(gapPx).toBeLessThanOrEqual(12 + PX_TOLERANCE);
  });

  test("Search: article shell horizontal padding matches shell (p:6)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/Search");
    await page.waitForTimeout(1500);

    const padLeft = await page.getByTestId("search-page-shell").evaluate((el) => {
      return parseFloat(getComputedStyle(el).paddingLeft);
    });

    expect(padLeft).toBeGreaterThanOrEqual(24 - PX_TOLERANCE);
    expect(padLeft).toBeLessThanOrEqual(24 + PX_TOLERANCE);
  });

  test("Search: root connector row height matches tree root gap constant", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/Search");
    await page.waitForTimeout(1500);

    const row = page.getByTestId("search-root-connector-row");
    await expect(row).toBeVisible();

    const heightPx = await row.evaluate((el) => el.getBoundingClientRect().height);
    expect(heightPx).toBeGreaterThanOrEqual(SEARCH_ROOT_CATEGORY_GAP_PX - PX_TOLERANCE);
    expect(heightPx).toBeLessThanOrEqual(SEARCH_ROOT_CATEGORY_GAP_PX + PX_TOLERANCE);
  });
});
