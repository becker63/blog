import { expect, test, type Locator, type Page } from "@playwright/test";

const VIEWPORTS = [
  { width: 375, height: 812 },
  { width: 768, height: 1024 },
  { width: 1280, height: 800 },
  { width: 1440, height: 900 },
] as const;

const PX_TOLERANCE = 0.1;

const expectNear = (actual: number, expected: number, message: string) => {
  expect(Math.abs(actual - expected), message).toBeLessThanOrEqual(
    PX_TOLERANCE,
  );
};

const requireBox = async (locator: Locator, message: string) => {
  const box = await locator.boundingBox();
  expect(box, message).not.toBeNull();
  return box!;
};

const expectNoHorizontalOverflow = async (page: Page, label: string) => {
  const overflow = await page.evaluate(() => {
    const documentElement = document.documentElement;
    const scrollRegion = document.querySelector<HTMLElement>(
      '[data-testid="search-results-scroll-region"]',
    );
    return {
      page: documentElement.scrollWidth - documentElement.clientWidth,
      results: scrollRegion
        ? scrollRegion.scrollWidth - scrollRegion.clientWidth
        : 0,
    };
  });

  expect(
    overflow.page,
    `page overflows horizontally in ${label}`,
  ).toBeLessThanOrEqual(1);
  expect(
    overflow.results,
    `result region overflows horizontally in ${label}`,
  ).toBeLessThanOrEqual(1);
};

const expectInitialTreeGeometry = async (page: Page, label: string) => {
  const groups = page.getByTestId("search-tree-parent-group");
  const groupCount = await groups.count();
  expect(
    groupCount,
    `expected multiple category groups in ${label}`,
  ).toBeGreaterThan(1);

  const rootLineBox = await requireBox(
    page.getByTestId("tree-root-vertical-line"),
    "root line",
  );

  for (let groupIndex = 0; groupIndex < groupCount; groupIndex += 1) {
    const group = groups.nth(groupIndex);
    const groupBox = await requireBox(group, `category group ${groupIndex}`);
    const parentCard = group.getByTestId("search-tree-parent-card");
    const cardBox = await requireBox(parentCard, `category card ${groupIndex}`);
    const parentHorizontal = group
      .getByTestId("search-tree-parent-content")
      .getByTestId("tree-branch-horizontal-line");
    const parentHorizontalBox = await requireBox(
      parentHorizontal,
      `category branch ${groupIndex}`,
    );

    expectNear(
      parentHorizontalBox.y + parentHorizontalBox.height / 2,
      cardBox.y + cardBox.height / 2,
      `category branch is centered on card ${groupIndex} in ${label}`,
    );
    expectNear(
      parentHorizontalBox.x,
      rootLineBox.x + rootLineBox.width,
      `category branch touches the root rail without overlapping in ${label}`,
    );

    expectNear(
      parentHorizontalBox.x + parentHorizontalBox.width,
      cardBox.x,
      `category branch reaches card ${groupIndex} in ${label}`,
    );

    if (groupIndex < groupCount - 1) {
      const groupRailBox = await requireBox(
        group.getByTestId("tree-group-root-rail"),
        `root continuation ${groupIndex}`,
      );
      const nextGroupBox = await requireBox(
        groups.nth(groupIndex + 1),
        `next group ${groupIndex + 1}`,
      );

      expectNear(
        groupRailBox.x,
        rootLineBox.x,
        `root rail x remains fixed in ${label}`,
      );
      expectNear(
        groupRailBox.y,
        groupBox.y,
        `root rail starts with group ${groupIndex} in ${label}`,
      );
      expectNear(
        groupRailBox.y + groupRailBox.height,
        nextGroupBox.y,
        `root rail reaches category ${groupIndex + 1} in ${label}`,
      );
    } else {
      const terminalRailBox = await requireBox(
        group
          .getByTestId("search-tree-parent-content")
          .getByTestId("tree-branch-vertical-line"),
        "terminal root rail",
      );
      expectNear(
        terminalRailBox.x,
        rootLineBox.x,
        `terminal root rail stays aligned in ${label}`,
      );
      expectNear(
        terminalRailBox.y,
        groupBox.y,
        `terminal root rail begins at the group in ${label}`,
      );
      expectNear(
        terminalRailBox.y + terminalRailBox.height,
        parentHorizontalBox.y + parentHorizontalBox.height / 2,
        `terminal root rail ends on its branch axis in ${label}`,
      );
    }

    const childRows = group.getByTestId("search-tree-child-row");
    const childCount = await childRows.count();
    if (childCount === 0) continue;

    let previousVerticalBottom: number | null = null;
    for (let childIndex = 0; childIndex < childCount; childIndex += 1) {
      const childRow = childRows.nth(childIndex);
      const childCardBox = await requireBox(
        childRow.getByTestId("search-tree-child-card"),
        `child card ${childIndex}`,
      );
      expect(
        await childRow
          .getByTestId("search-tree-child-card")
          .evaluate((element) => getComputedStyle(element).transform),
        `child card ${childIndex} must not move independently of its rail`,
      ).toBe("none");
      const childRowBox = await requireBox(
        childRow,
        `child row ${childIndex}`,
      );
      const verticalBox = await requireBox(
        childRow.getByTestId("tree-branch-vertical-line"),
        `child rail ${childIndex}`,
      );
      const horizontalBox = await requireBox(
        childRow.getByTestId("tree-branch-horizontal-line"),
        `child branch ${childIndex}`,
      );

      expectNear(
        horizontalBox.x + horizontalBox.width,
        childCardBox.x,
        `child branch reaches card ${childIndex} in ${label}`,
      );
      expectNear(
        horizontalBox.x,
        verticalBox.x + verticalBox.width,
        `child branch touches its rail without overlapping in ${label}`,
      );
      expectNear(
        horizontalBox.y + horizontalBox.height / 2,
        childRowBox.y + childRowBox.height / 2,
        `child branch is centered on row ${childIndex} in ${label}`,
      );
      expect(
        verticalBox.x > cardBox.x && verticalBox.x < cardBox.x + cardBox.width,
        `child rail should emerge from inside category card ${groupIndex} in ${label}`,
      ).toBe(true);

      if (childIndex === 0) {
        expectNear(
          verticalBox.y,
          cardBox.y + cardBox.height,
          `child rail starts at category card ${groupIndex} in ${label}`,
        );
      }
      if (previousVerticalBottom !== null) {
        expectNear(
          verticalBox.y,
          previousVerticalBottom,
          `child sibling rails meet between rows ${childIndex - 1}/${childIndex} in ${label}`,
        );
      }
      previousVerticalBottom = verticalBox.y + verticalBox.height;
    }
  }

  await expectNoHorizontalOverflow(page, `${label} initial state`);
};

test.describe("Search tree geometry", () => {
  for (const viewport of VIEWPORTS) {
    const label = `${viewport.width}x${viewport.height}`;

    test(`stays continuous through initial, scroll, collapse, and filter states at ${label}`, async ({
      page,
    }) => {
      test.setTimeout(60_000);
      await page.setViewportSize(viewport);
      await page.goto("/Search");
      await expect(
        page.getByTestId("search-tree-parent-group").first(),
      ).toBeVisible();

      await expectInitialTreeGeometry(page, label);

      const rootConnector = page.getByTestId("tree-root-vertical-line");
      const connectorBefore = await requireBox(
        rootConnector,
        "root connector before scroll",
      );
      const scrollRegion = page.getByTestId("search-results-scroll-region");
      await scrollRegion.evaluate((element) => {
        element.scrollTop = 120;
      });
      await expect
        .poll(() => scrollRegion.evaluate((element) => element.scrollTop))
        .toBeGreaterThan(0);
      const connectorAfter = await requireBox(
        rootConnector,
        "root connector after scroll",
      );
      const scrollRegionBox = await requireBox(
        scrollRegion,
        "results viewport after scroll",
      );
      const scrolledRootRail = await requireBox(
        page
          .getByTestId("search-tree-parent-group")
          .first()
          .getByTestId("tree-group-root-rail"),
        "root rail after scroll",
      );
      expectNear(
        connectorAfter.x,
        connectorBefore.x,
        `root connector x after scroll in ${label}`,
      );
      expectNear(
        connectorAfter.height,
        connectorBefore.height,
        `root connector remains visible after scroll in ${label}`,
      );
      expectNear(
        scrolledRootRail.x,
        connectorAfter.x,
        `scrolled content keeps the root rail aligned in ${label}`,
      );
      expect(
        scrolledRootRail.y,
        `root rail should enter above the clipped viewport in ${label}`,
      ).toBeLessThanOrEqual(scrollRegionBox.y + PX_TOLERANCE);
      expect(
        scrolledRootRail.y + scrolledRootRail.height,
        `root rail should cross the clipped viewport boundary in ${label}`,
      ).toBeGreaterThanOrEqual(scrollRegionBox.y - PX_TOLERANCE);

      await scrollRegion.evaluate((element) => {
        element.scrollTop = 0;
      });
      const firstGroup = page.getByTestId("search-tree-parent-group").first();
      await firstGroup.getByRole("button", { name: /^Collapse / }).click();
      await expect(
        firstGroup.getByTestId("search-tree-child-list"),
      ).toHaveCount(0);
      await expect(
        firstGroup.getByTestId("tree-branch-vertical-line"),
      ).toHaveCount(0);
      const collapsedRail = await requireBox(
        firstGroup.getByTestId("tree-group-root-rail"),
        "collapsed rail",
      );
      const secondGroup = await requireBox(
        page.getByTestId("search-tree-parent-group").nth(1),
        "second category after collapse",
      );
      expectNear(
        collapsedRail.y + collapsedRail.height,
        secondGroup.y,
        `collapsed category leaves no orphan rail in ${label}`,
      );
      await expectNoHorizontalOverflow(page, `${label} collapsed state`);

      const input = page.getByTestId("search-root-input");
      await input.fill("firewall");
      await expect(page.getByTestId("search-tree-parent-group")).toHaveCount(1);
      await expect(page.getByTestId("search-tree-child-row")).toHaveCount(1);
      await expect(page.getByTestId("tree-group-root-rail")).toHaveCount(0);
      await expect(page.getByTestId("search-tree-parent-card")).toContainText(
        "Security / Systems Work",
      );

      const filteredGroup = page.getByTestId("search-tree-parent-group");
      const filteredParentCard = await requireBox(
        filteredGroup.getByTestId("search-tree-parent-card"),
        "filtered parent card",
      );
      const filteredChildRail = await requireBox(
        filteredGroup
          .getByTestId("search-tree-child-row")
          .getByTestId("tree-branch-vertical-line"),
        "filtered child rail",
      );
      expectNear(
        filteredChildRail.y,
        filteredParentCard.y + filteredParentCard.height,
        `filtered child rail stays attached in ${label}`,
      );
      await expectNoHorizontalOverflow(page, `${label} filtered state`);

      await input.fill("no-result-for-this-query");
      await expect(page.getByText("No matching entries.")).toBeVisible();
      await expect(page.getByTestId("search-root-connector-row")).toHaveCount(
        0,
      );
      await expect(page.getByTestId("search-tree-parent-group")).toHaveCount(0);
      await expect(page.getByTestId("tree-branch-vertical-line")).toHaveCount(
        0,
      );
      await expectNoHorizontalOverflow(page, `${label} no-result state`);
    });
  }
});
