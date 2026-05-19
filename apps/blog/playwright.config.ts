import { defineConfig, devices } from "@playwright/test";

/** Avoid clashing with a developer's dev server on :3000; keeps `baseURL` aligned with `webServer`. */
const E2E_PORT = process.env.PLAYWRIGHT_PORT ?? "3010";
const E2E_ORIGIN =
  process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${E2E_PORT}`;

/**
 * Layout/regression tests expect the app at PLAYWRIGHT_BASE_URL (default http://127.0.0.1:3010),
 * or set PLAYWRIGHT_BASE_URL when the dev server is started manually.
 */
export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: process.env.CI ? "list" : "html",
  use: {
    baseURL: E2E_ORIGIN,
    trace: "on-first-retry",
  },
  webServer: {
    command: `PORT=${E2E_PORT} bunx nx run blog:dev-app`,
    url: E2E_ORIGIN,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    stdout: "pipe",
    stderr: "pipe",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
