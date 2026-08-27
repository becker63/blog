import { expect, test } from "@playwright/test";

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
      await page.goto("/");
      await page.waitForTimeout(LOAD_WAIT_MS);

      const statusBar = page.getByTestId("home-status-bar");
      const dashboardGrid = page.getByTestId("home-dashboard-grid");

      await expect(statusBar).toBeVisible();
      await expect(dashboardGrid).toBeVisible();

      const statusBarBox = await statusBar.boundingBox();
      const dashboardGridBox = await dashboardGrid.boundingBox();

      expect(
        statusBarBox,
        `Missing status bar box at ${viewport.width}x${viewport.height}`,
      ).not.toBeNull();
      expect(
        dashboardGridBox,
        `Missing dashboard grid box at ${viewport.width}x${viewport.height}`,
      ).not.toBeNull();

      const widthDelta = Math.abs(
        statusBarBox!.width - dashboardGridBox!.width,
      );
      const leftDelta = Math.abs(statusBarBox!.x - dashboardGridBox!.x);
      const rightDelta = Math.abs(
        statusBarBox!.x +
          statusBarBox!.width -
          (dashboardGridBox!.x + dashboardGridBox!.width),
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

  test("search rows, branches, and rails share one bounded layout across viewports", async ({
    page,
  }) => {
    test.setTimeout(120000);

    for (const viewport of SEARCH_VIEWPORTS) {
      const label = `${viewport.width}x${viewport.height}`;
      await page.setViewportSize(viewport);
      await page.goto("/Search");
      await page.waitForTimeout(LOAD_WAIT_MS);

      const rootShell = page.getByTestId("search-root-shell");
      const parentCards = page.getByTestId("search-tree-parent-card");
      const childCards = page.getByTestId("search-tree-child-card");
      const firstGroup = page.getByTestId("search-tree-parent-group").first();
      const rootLine = page.getByTestId("tree-root-vertical-line");
      const groupRail = firstGroup.getByTestId("tree-group-root-rail");
      const firstChildRow = firstGroup
        .getByTestId("search-tree-child-row")
        .first();
      const firstChildRail = firstChildRow.getByTestId(
        "tree-branch-vertical-line",
      );

      await expect(rootShell).toBeVisible();
      await expect(parentCards.first()).toBeVisible();
      await expect(childCards.first()).toBeVisible();

      const rootBox = await rootShell.boundingBox();
      const firstParentCardBox = await parentCards.first().boundingBox();
      const firstChildCardBox = await childCards.first().boundingBox();
      const rootLineBox = await rootLine.boundingBox();
      const groupRailBox = await groupRail.boundingBox();
      const childRailBox = await firstChildRail.boundingBox();

      for (const [box, name] of [
        [rootBox, "root shell"],
        [firstParentCardBox, "parent card"],
        [firstChildCardBox, "child card"],
        [rootLineBox, "root connector"],
        [groupRailBox, "group rail"],
        [childRailBox, "child rail"],
      ] as const) {
        expect(box, `Missing ${name} at ${label}`).not.toBeNull();
      }

      const cardBoxes = await page
        .locator(
          '[data-testid="search-tree-parent-card"], [data-testid="search-tree-child-card"]',
        )
        .evaluateAll((elements) =>
          elements.map((element) => {
            const rect = element.getBoundingClientRect();
            return {
              left: rect.left,
              right: rect.right,
              testId: element.getAttribute("data-testid"),
            };
          }),
        );

      for (const cardBox of cardBoxes) {
        expect(
          cardBox.left - rootBox!.x,
          `${cardBox.testId} escapes left of root at ${label}`,
        ).toBeGreaterThanOrEqual(-WIDTH_TOLERANCE_PX);
        expect(
          cardBox.right - (rootBox!.x + rootBox!.width),
          `${cardBox.testId} escapes right of root at ${label}`,
        ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
        expect(
          Math.abs(cardBox.right - (rootBox!.x + rootBox!.width)),
          `${cardBox.testId} does not share the root right edge at ${label}`,
        ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      }

      expect(
        Math.abs(rootLineBox!.x - groupRailBox!.x),
        `root/category rail shifts horizontally at ${label}`,
      ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      expect(
        Math.abs(
          firstParentCardBox!.y - (rootBox!.y + rootBox!.height) - TREE_GAP_PX,
        ),
        `root/category gap is not ${TREE_GAP_PX}px at ${label}`,
      ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);
      expect(
        firstChildCardBox!.x - firstParentCardBox!.x,
        `child card is not meaningfully indented at ${label}`,
      ).toBeGreaterThanOrEqual(MIN_CHILD_INDENT_DELTA_PX);
      expect(
        Math.abs(
          childRailBox!.y -
            (firstParentCardBox!.y + firstParentCardBox!.height),
        ),
        `child rail is detached from its category at ${label}`,
      ).toBeLessThanOrEqual(WIDTH_TOLERANCE_PX);

      const overflow = await page.evaluate(() => ({
        page:
          document.documentElement.scrollWidth -
          document.documentElement.clientWidth,
        results:
          document.querySelector<HTMLElement>(
            '[data-testid="search-results-scroll-region"]',
          )!.scrollWidth -
          document.querySelector<HTMLElement>(
            '[data-testid="search-results-scroll-region"]',
          )!.clientWidth,
      }));
      expect(
        overflow.page,
        `page horizontal overflow at ${label}`,
      ).toBeLessThanOrEqual(1);
      expect(
        overflow.results,
        `result horizontal overflow at ${label}`,
      ).toBeLessThanOrEqual(1);
    }
  });
});
