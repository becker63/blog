import { expect, test, type Locator } from "@playwright/test";

/**
 * `.anim-typewriter` finishes revealing text around ~3s after load.
 * Settle before reading layout metrics so dimensions are stable.
 */
const TYPEWRITER_SETTLE_MS = 4000;

async function readBarChrome(locator: Locator) {
  return locator.evaluate((el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return {
      borderRadius: s.borderRadius,
      opacity: s.opacity,
      backgroundColor: s.backgroundColor,
      position: s.position,
      top: r.top,
      left: r.left,
      width: r.width,
      height: r.height,
      zIndex: s.zIndex,
    };
  });
}

test.describe("Blog status bar — look & act (regression guard)", () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test("home: fixed glass bar, logo copy, shell metrics", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(TYPEWRITER_SETTLE_MS);

    const bar = page.getByTestId("home-status-bar");
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("becker63");

    const chrome = await readBarChrome(bar);
    expect(chrome.position).toBe("fixed");
    expect(parseFloat(chrome.opacity)).toBeCloseTo(0.7, 1);
    expect(chrome.borderRadius).toBe("10px");
    expect(parseInt(chrome.zIndex, 10)).toBeGreaterThanOrEqual(50);
    expect(chrome.left).toBeGreaterThan(8);
    expect(chrome.left).toBeLessThan(20);
    expect(chrome.top).toBeGreaterThan(8);
    expect(chrome.top).toBeLessThan(20);
  });

  test("Search: blog bar matches home shell chrome", async ({ page }) => {
    await page.goto("/");
    await page.waitForTimeout(TYPEWRITER_SETTLE_MS);
    const home = await readBarChrome(page.getByTestId("home-status-bar"));

    await page.goto("/Search");
    await page.waitForTimeout(TYPEWRITER_SETTLE_MS);

    const bar = page.getByTestId("blog-status-bar");
    await expect(bar).toBeVisible();
    const search = await readBarChrome(bar);

    expect(search.borderRadius).toBe(home.borderRadius);
    expect(search.opacity).toBe(home.opacity);
    expect(parseFloat(search.opacity)).toBeCloseTo(0.7, 1);
  });

  test("post layout: bar is sticky (Blog / MDX chrome)", async ({ page }) => {
    await page.goto("/Blogs/zed");
    await page.waitForTimeout(TYPEWRITER_SETTLE_MS);

    const bar = page.getByTestId("blog-status-bar");
    await expect(bar).toBeVisible();

    const position = await bar.evaluate((el) => getComputedStyle(el).position);
    expect(position).toBe("sticky");
  });

  test("navigation from Search: Home link returns to / with home status bar", async ({ page }) => {
    await page.goto("/Search");
    await page.waitForTimeout(TYPEWRITER_SETTLE_MS);

    await page.getByRole("link", { name: "Home" }).click();
    await expect(page).toHaveURL("/");

    await page.waitForTimeout(TYPEWRITER_SETTLE_MS);
    const bar = page.getByTestId("home-status-bar");
    await expect(bar).toBeVisible();
    await expect(bar).toContainText("becker63");
  });
});
