import { expect, test } from "@playwright/test";

const LOAD_WAIT_MS = 500;
const PX_TOLERANCE = 0.1;

const expectNear = (actual: number, expected: number, message: string) => {
  expect(Math.abs(actual - expected), message).toBeLessThanOrEqual(
    PX_TOLERANCE,
  );
};

test.describe("Search root connector", () => {
  test("connects the search pane to the first category on one shared rail", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/Search");
    await page.waitForTimeout(LOAD_WAIT_MS);

    const rootShell = page.getByTestId("search-root-shell");
    const connectorRow = page.getByTestId("search-root-connector-row");
    const rootLine = page.getByTestId("tree-root-vertical-line");
    const firstGroup = page.getByTestId("search-tree-parent-group").first();
    const groupRail = firstGroup.getByTestId("tree-group-root-rail");
    const parentCard = firstGroup.getByTestId("search-tree-parent-card");
    const parentBranch = firstGroup
      .getByTestId("search-tree-parent-content")
      .getByTestId("tree-branch-horizontal-line");

    await expect(rootLine).toBeVisible();
    await expect(groupRail).toBeVisible();

    const [
      rootShellBox,
      connectorRowBox,
      rootLineBox,
      groupBox,
      railBox,
      cardBox,
      branchBox,
    ] = await Promise.all([
      rootShell.boundingBox(),
      connectorRow.boundingBox(),
      rootLine.boundingBox(),
      firstGroup.boundingBox(),
      groupRail.boundingBox(),
      parentCard.boundingBox(),
      parentBranch.boundingBox(),
    ]);

    expect(rootShellBox).not.toBeNull();
    expect(connectorRowBox).not.toBeNull();
    expect(rootLineBox).not.toBeNull();
    expect(groupBox).not.toBeNull();
    expect(railBox).not.toBeNull();
    expect(cardBox).not.toBeNull();
    expect(branchBox).not.toBeNull();

    expectNear(
      rootLineBox!.y,
      rootShellBox!.y + rootShellBox!.height,
      "root line starts at pane",
    );
    expectNear(
      rootLineBox!.y + rootLineBox!.height,
      groupBox!.y,
      "root line reaches the first category group",
    );
    expectNear(
      rootLineBox!.x,
      railBox!.x,
      "root and category rails share an x coordinate",
    );
    expectNear(
      connectorRowBox!.height,
      24,
      "root connector uses the pane-row gap",
    );
    expectNear(
      branchBox!.x,
      railBox!.x + railBox!.width,
      "category branch starts at the root rail edge",
    );
    expectNear(
      branchBox!.x + branchBox!.width,
      cardBox!.x,
      "category branch reaches its card",
    );
  });

  test("stays stable at the scroll boundary instead of collapsing", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/Search");
    await page.waitForTimeout(LOAD_WAIT_MS);

    const rootShell = page.getByTestId("search-root-shell");
    const connectorRow = page.getByTestId("search-root-connector-row");
    const rootLine = page.getByTestId("tree-root-vertical-line");
    const scrollRegion = page.getByTestId("search-results-scroll-region");
    const before = await Promise.all([
      rootShell.boundingBox(),
      connectorRow.boundingBox(),
      rootLine.boundingBox(),
    ]);

    await scrollRegion.evaluate((element) => {
      element.scrollTop = 120;
    });
    await expect
      .poll(() => scrollRegion.evaluate((element) => element.scrollTop))
      .toBeGreaterThan(0);

    const after = await Promise.all([
      rootShell.boundingBox(),
      connectorRow.boundingBox(),
      rootLine.boundingBox(),
    ]);

    for (const box of [...before, ...after]) expect(box).not.toBeNull();
    expectNear(
      after[0]!.y,
      before[0]!.y,
      "search pane does not jump on result scroll",
    );
    expectNear(
      after[1]!.y,
      before[1]!.y,
      "connector row does not jump on result scroll",
    );
    expectNear(
      after[1]!.height,
      before[1]!.height,
      "connector row keeps its height",
    );
    expectNear(after[2]!.x, before[2]!.x, "root line stays on its rail");
    expectNear(
      after[2]!.height,
      before[2]!.height,
      "root line remains visible",
    );
  });

  test("keeps every frame centered when classic scrollbar gutters are reserved", async ({
    page,
  }) => {
    for (const viewport of [
      { width: 1080, expectedGutter: "auto" },
      { width: 1152, expectedGutter: "stable both-edges" },
    ]) {
      await page.setViewportSize({ width: viewport.width, height: 800 });
      await page.goto("/Search");
      await expect(page.getByTestId("search-tree-frame")).toBeVisible();

      const rootBox = await page
        .getByTestId("search-root-shell")
        .boundingBox();
      const connectorBox = await page
        .getByTestId("search-root-connector-content")
        .boundingBox();
      const treeBox = await page.getByTestId("search-tree-frame").boundingBox();
      const gutter = await page
        .getByTestId("search-results-scroll-region")
        .evaluate((element) => getComputedStyle(element).scrollbarGutter);

      for (const box of [rootBox, connectorBox, treeBox]) {
        expect(box).not.toBeNull();
      }
      expectNear(connectorBox!.x, rootBox!.x, "connector frame left edge");
      expectNear(connectorBox!.width, rootBox!.width, "connector frame width");
      expectNear(treeBox!.x, rootBox!.x, "result frame left edge");
      expectNear(treeBox!.width, rootBox!.width, "result frame width");
      expect(gutter).toBe(viewport.expectedGutter);
    }
  });
});
