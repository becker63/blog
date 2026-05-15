import { expect, test } from "@playwright/test";

const BASE_URL = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";

const DASHBOARD_VIEWPORTS = [
  { width: 1040, height: 768 },
  { width: 1080, height: 720 },
  { width: 1152, height: 768 },
  { width: 1280, height: 800 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
  { width: 1536, height: 864 },
  { width: 1600, height: 900 },
  { width: 1680, height: 1050 },
  { width: 1728, height: 1117 },
  { width: 1920, height: 1080 },
] as const;

const SEARCH_VIEWPORTS = [
  { width: 360, height: 740 },
  { width: 375, height: 812 },
  { width: 390, height: 844 },
  { width: 414, height: 896 },
  { width: 768, height: 1024 },
  { width: 820, height: 1180 },
  { width: 912, height: 1368 },
  { width: 1024, height: 768 },
  { width: 1152, height: 768 },
  { width: 1280, height: 800 },
  { width: 1366, height: 768 },
  { width: 1440, height: 900 },
] as const;

const LOAD_WAIT_MS = 1500;
const WIDTH_TOLERANCE_PX = 2;
const MIN_CHILD_INDENT_DELTA_PX = 44;
/** Keep in sync with `SEARCH_ROOT_CATEGORY_GAP_PX` in `app/components/search/TreeLines.tsx`. */
const TREE_GAP_PX = 24;

test.describe("Viewport Consistency", () => {
  test("desktop dashboard shell matches the status bar width across laptop and desktop viewports", async ({
    page,
  }) => {
    test.setTimeout(120000);

    for (const viewport of DASHBOARD_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.goto(`${BASE_URL}/`);
      await page.waitForTimeout(LOAD_WAIT_MS);

      const statusBar = page.getByTestId("home-status-bar");
      const dashboardGrid = page.getByTestId("home-dashboard-grid");

      await expect(statusBar).toBeVisible();
      await expect(dashboardGrid).toBeVisible();

      const statusBarBox = await statusBar.boundingBox();
      const dashboardGridBox = await dashboardGrid.boundingBox();

      expect(statusBarBox, `Missing status bar box at ${viewport.width}x${viewport.height}`).not.toBeNull();
      expect(
        dashboardGridBox,
        `Missing dashboard grid box at ${viewport.width}x${viewport.height}`,
      ).not.toBeNull();

      const widthDelta = Math.abs(statusBarBox!.width - dashboardGridBox!.width);
      const leftDelta = Math.abs(statusBarBox!.x - dashboardGridBox!.x);
      const rightDelta = Math.abs(
        statusBarBox!.x + statusBarBox!.width - (dashboardGridBox!.x + dashboardGridBox!.width),
      );

      expect(
        widthDelta,
        `Dashboard/status bar width mismatch at ${viewport.width}x${viewport.height}`,
      ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      expect(
        leftDelta,
        `Dashboard/status bar left edge mismatch at ${viewport.width}x${viewport.height}`,
      ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      expect(
        rightDelta,
        `Dashboard/status bar right edge mismatch at ${viewport.width}x${viewport.height}`,
      ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
    }
  });

  test("search tree rows stay inside the search root width across mobile, tablet, and desktop viewports", async ({
    page,
  }) => {
    test.setTimeout(120000);

    for (const viewport of SEARCH_VIEWPORTS) {
      await page.setViewportSize(viewport);
      await page.goto(`${BASE_URL}/Search`);
      await page.waitForTimeout(LOAD_WAIT_MS);

      const searchRootShell = page.getByTestId("search-root-shell");
      const parentRows = page.getByTestId("search-tree-parent-row");
      const childRows = page.getByTestId("search-tree-child-row");
      const parentCards = page.getByTestId("search-tree-parent-card");
      const childCards = page.getByTestId("search-tree-child-card");
      const rootConnectorContent = page.getByTestId("search-root-connector-content");
      const parentContent = page.getByTestId("search-tree-parent-content");
      const rootVerticalLine = page.getByTestId("tree-root-vertical-line");
      const parentVerticalLines = page.getByTestId("tree-branch-vertical-line");
      const indentVerticalLines = page.getByTestId("tree-indent-vertical-line");
      const childBranchVerticalLine = page
        .locator('[data-testid="search-tree-child-content"] [data-testid="tree-branch-vertical-line"]')
        .first();

      await expect(searchRootShell).toBeVisible();
      await expect(parentRows.first()).toBeVisible();
      await expect(childRows.first()).toBeVisible();
      await expect(parentCards.first()).toBeVisible();
      await expect(childCards.first()).toBeVisible();
      await expect(parentContent.first()).toBeVisible();

      const rootBox = await searchRootShell.boundingBox();
      expect(rootBox, `Missing search root box at ${viewport.width}x${viewport.height}`).not.toBeNull();

      const cardBoxes = await page
        .locator('[data-testid="search-tree-parent-card"], [data-testid="search-tree-child-card"]')
        .evaluateAll(
        (elements) =>
          elements.map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              left: rect.left,
              right: rect.right,
              width: rect.width,
              testId: element.getAttribute("data-testid"),
            };
          }),
        );

      for (const cardBox of cardBoxes) {
        const leftDelta = cardBox.left - rootBox!.x;
        const rightOverflow = cardBox.right - (rootBox!.x + rootBox!.width);
        const rightGap = Math.abs(cardBox.right - (rootBox!.x + rootBox!.width));

        expect(
          leftDelta,
          `${cardBox.testId} escapes left of search root at ${viewport.width}x${viewport.height}`,
        ).toBeGreaterThanOrEqual(-WIDTH_TOLERANCE_PX);
        expect(
          rightOverflow,
          `${cardBox.testId} escapes right of search root at ${viewport.width}x${viewport.height}`,
        ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
        expect(
          rightGap,
          `${cardBox.testId} right edge is not aligned with the search root at ${viewport.width}x${viewport.height}`,
        ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      }

      const firstParentCardBox = await parentCards.first().boundingBox();
      const firstChildCardBox = await childCards.first().boundingBox();
      const searchRootInputBox = await page.getByTestId("search-root-input").boundingBox();
      const rootConnectorContentBox = await rootConnectorContent.boundingBox();
      const firstParentContentBox = await parentContent.first().boundingBox();
      const rootVerticalLineBox = await rootVerticalLine.boundingBox();
      const firstParentVerticalLineBox = await parentVerticalLines.first().boundingBox();
      const firstIndentVerticalLineBox = await indentVerticalLines.first().boundingBox();
      const firstChildBranchVerticalLineRect = await childBranchVerticalLine.evaluate((element) => {
        const rect = element.getBoundingClientRect();
        return {
          top: rect.top,
          bottom: rect.bottom,
          left: rect.left,
          right: rect.right,
          width: rect.width,
          height: rect.height,
        };
      });

      expect(firstParentCardBox, `Missing parent card box at ${viewport.width}x${viewport.height}`).not.toBeNull();
      expect(firstChildCardBox, `Missing child card box at ${viewport.width}x${viewport.height}`).not.toBeNull();
      expect(searchRootInputBox, `Missing search root input box at ${viewport.width}x${viewport.height}`).not.toBeNull();
      expect(
        rootConnectorContentBox,
        `Missing root connector content box at ${viewport.width}x${viewport.height}`,
      ).not.toBeNull();
      expect(
        firstParentContentBox,
        `Missing parent content box at ${viewport.width}x${viewport.height}`,
      ).not.toBeNull();
      expect(
        rootVerticalLineBox,
        `Missing root vertical line box at ${viewport.width}x${viewport.height}`,
      ).not.toBeNull();
      expect(
        firstParentVerticalLineBox,
        `Missing parent vertical line box at ${viewport.width}x${viewport.height}`,
      ).not.toBeNull();
      expect(
        firstIndentVerticalLineBox,
        `Missing child indent vertical line box at ${viewport.width}x${viewport.height}`,
      ).not.toBeNull();
      expect(
        firstChildBranchVerticalLineRect,
        `Missing child branch vertical line box at ${viewport.width}x${viewport.height}`,
      ).not.toBeNull();

      const parentConnectorDelta = Math.abs(firstParentContentBox!.x - rootConnectorContentBox!.x);
      expect(
        parentConnectorDelta,
        `Parent connector content is not aligned under the search root at ${viewport.width}x${viewport.height}`,
      ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);

      const verticalLineDelta = Math.abs(rootVerticalLineBox!.x - firstParentVerticalLineBox!.x);
      expect(
        verticalLineDelta,
        `Parent vertical connector is shifted relative to the search root at ${viewport.width}x${viewport.height}`,
      ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);

      const indentLineDelta = Math.abs(firstIndentVerticalLineBox!.x - firstParentVerticalLineBox!.x);
      expect(
        indentLineDelta,
        `Child continuation trunk is shifted relative to the parent connector at ${viewport.width}x${viewport.height}`,
      ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);

      const firstParentCardBottom = firstParentCardBox!.y + firstParentCardBox!.height;
      const firstChildCardTop = firstChildCardBox!.y;
      const rootGap = firstParentCardBox!.y - (searchRootInputBox!.y + searchRootInputBox!.height);

      expect(
        Math.abs(rootGap - TREE_GAP_PX),
        `Search root/category gap is not ${TREE_GAP_PX}px at ${viewport.width}x${viewport.height}`,
      ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);

      const childIndentDelta = firstChildCardBox!.x - firstParentCardBox!.x;
      expect(
        childIndentDelta,
        `Child cards are not meaningfully indented past parent cards at ${viewport.width}x${viewport.height}`,
      ).toBeGreaterThanOrEqual(MIN_CHILD_INDENT_DELTA_PX);

      const childGapTouchDelta = Math.abs(firstChildBranchVerticalLineRect.top - firstParentCardBottom);
      expect(
        childGapTouchDelta,
        `Child branch vertical line does not extend up to the parent/category gap at ${viewport.width}x${viewport.height}`,
      ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX + 1);
    }
  });

  test("search root connector hides after scrolling results", async ({ page }) => {
    test.setTimeout(30000);

    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto(`${BASE_URL}/Search`);
    await page.waitForTimeout(LOAD_WAIT_MS);

    const rootConnectorRow = page.getByTestId("search-root-connector-row");
    const scrollRegion = page.getByTestId("search-results-scroll-region");
    const rootConnectorLine = page.getByTestId("tree-root-vertical-line");

    await expect(rootConnectorRow).toHaveCount(1);
    await expect(scrollRegion).toBeVisible();
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
