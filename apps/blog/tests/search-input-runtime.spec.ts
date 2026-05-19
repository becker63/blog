import { expect, test } from "@playwright/test";

test("typing into the Search input does not trigger runtime errors", async ({
  page,
}) => {
  test.setTimeout(30000);

  const pageErrors: string[] = [];

  page.on("pageerror", (error) => {
    pageErrors.push(error.message);
  });

  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto("/Search");
  await page.waitForTimeout(1500);

  const input = page.getByTestId("search-root-input");
  await expect(input).toBeVisible();

  await input.fill("firewall");
  await expect(input).toHaveValue("firewall");
  await page.waitForTimeout(300);

  await expect(page.getByTestId("search-tree-child-card").first()).toBeVisible();
  expect(pageErrors).toEqual([]);
});
