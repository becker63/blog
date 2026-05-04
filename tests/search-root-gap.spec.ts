import { expect, test } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const LOAD_WAIT_MS = 1500;
test.describe("Search Root Gap", () => {
  test("root gap vertical connector aligns with the first category vertical line", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/Search`);
    await page.waitForTimeout(LOAD_WAIT_MS);

    const rootVerticalLine = page.getByTestId("tree-root-vertical-line");
    const parentVerticalLine = page
      .locator('[data-testid="search-tree-parent-content"] [data-testid="tree-branch-vertical-line"]')
      .first();

    await expect(rootVerticalLine).toHaveCount(1);
    await expect(parentVerticalLine).toHaveCount(1);

    const rootVerticalBox = await rootVerticalLine.boundingBox();
    const parentVerticalBox = await parentVerticalLine.boundingBox();

    expect(rootVerticalBox).not.toBeNull();
    expect(parentVerticalBox).not.toBeNull();

    const xDelta = Math.abs(rootVerticalBox!.x - parentVerticalBox!.x);

    expect(
      xDelta,
      "Expected the root gap vertical connector to align with the first category vertical line",
    ).toBeLessThanOrEqual(2);
  });

  test("root gap becomes visually transparent after scroll except for the connector line", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/Search`);
    await page.waitForTimeout(LOAD_WAIT_MS);

    const scrollRegion = page.getByTestId("search-results-scroll-region");
    const connectorContent = page.getByTestId("search-root-connector-content");
    const connectorRow = page.getByTestId("search-root-connector-row");

    await expect(connectorContent).toHaveCount(1);
    await expect(connectorRow).toHaveCount(1);

    await scrollRegion.evaluate((element) => {
      element.scrollTop = 120;
      element.dispatchEvent(new Event("scroll", { bubbles: true }));
    });

    await page.waitForTimeout(150);

    const metrics = await page.evaluate(() => {
      const row = document.querySelector('[data-testid="search-root-connector-row"]');
      const content = document.querySelector('[data-testid="search-root-connector-content"]');
      if (!row || !content) {
        return null;
      }

      const rowStyle = window.getComputedStyle(row);
      const contentStyle = window.getComputedStyle(content);

      return {
        rowOpacity: rowStyle.opacity,
        rowBackgroundColor: rowStyle.backgroundColor,
        rowBoxShadow: rowStyle.boxShadow,
        rowBackdropFilter: rowStyle.backdropFilter,
        contentOpacity: contentStyle.opacity,
        contentBackgroundColor: contentStyle.backgroundColor,
        contentBoxShadow: contentStyle.boxShadow,
        contentBackdropFilter: contentStyle.backdropFilter,
      };
    });

    expect(metrics).not.toBeNull();
    expect(
      Number(metrics.rowOpacity),
      "Expected the root gap row itself to be visually gone after scroll",
    ).toBe(0);
    expect(metrics.rowBackgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(metrics.rowBoxShadow).toBe("none");
    expect(metrics.rowBackdropFilter).toBe("none");
    expect(
      Number(metrics.contentOpacity),
      "Expected the root gap content wrapper to be visually gone after scroll",
    ).toBe(0);
    expect(metrics.contentBackgroundColor).toBe("rgba(0, 0, 0, 0)");
    expect(metrics.contentBoxShadow).toBe("none");
    expect(metrics.contentBackdropFilter).toBe("none");
  });

  test("root gap line disappears when the results scroll", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/Search`);
    await page.waitForTimeout(LOAD_WAIT_MS);

    const rootConnectorRow = page.getByTestId("search-root-connector-row");
    const rootConnectorLine = page.getByTestId("tree-root-vertical-line");
    const scrollRegion = page.getByTestId("search-results-scroll-region");

    await expect(rootConnectorRow).toHaveCount(1);
    await expect(rootConnectorLine).toHaveCount(1);

    await scrollRegion.evaluate((element) => {
      element.scrollTop = 120;
      element.dispatchEvent(new Event("scroll", { bubbles: true }));
    });

    await page.waitForTimeout(150);

    await expect(rootConnectorRow).toHaveCount(1);
    await expect(rootConnectorLine).toHaveCount(0);
  });
});
