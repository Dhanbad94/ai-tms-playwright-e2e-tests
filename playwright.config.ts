import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" }); // <-- Load .env.local variables at the very top

import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests",
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 1,
  workers: 2,

  timeout: 30000,
  expect: {
    timeout: 10000,
  },

  reporter: [
    [
      "html",
      { open: "never", outputFolder: "playwright-report", onlyFailures: true },
    ],
    ["list"],
    ["junit", { outputFile: "results.xml" }],
  ],

  use: {
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    headless: process.env.CI ? true : false,
    viewport: { width: 1280, height: 720 },
    ignoreHTTPSErrors: true,
    actionTimeout: 10000,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
    {
      name: "firefox",
      use: {
        ...devices["Desktop Firefox"],
      },
    },
  ],
});
