import { defineConfig, devices } from "@playwright/test";

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./e2e",
  forbidOnly: isCI,
  retries: isCI ? 2 : 0,
  workers: isCI ? 1 : undefined,
  reporter: isCI ? [["github"], ["list"]] : [["list"]],
  use: {
    baseURL: process.env.PLAYWRIGHT_BASE_URL || "http://localhost:3000",
    trace: "on-first-retry",
    actionTimeout: 15000,
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  // In CI: GitHub Actions workflow handles both API + Web server startup.
  // In local dev: run `pnpm dev` to start everything, or run this config directly.
  // The webServer starts Next.js (port 3000) and tells it to call API at port 3001.
  webServer: isCI
    ? undefined
    : {
        command: "pnpm dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 180_000,
        env: {
          NODE_ENV: "development",
          NEXT_PUBLIC_API_URL: "http://localhost:3001/api",
        },
      },
});
