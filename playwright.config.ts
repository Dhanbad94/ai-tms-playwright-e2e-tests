import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { defineConfig, devices } from "@playwright/test";
import { TIMEOUTS, VIEWPORTS } from "./constants";

/**
 * Playwright Configuration for TMS E2E Tests
 *
 * Key improvements:
 * - Better parallelization with setup project for auth
 * - Configurable workers based on CI/local environment
 * - Visual comparison settings
 * - Better timeout management via constants
 */

// Determine if running in CI environment
const isCI = !!process.env.CI;

export default defineConfig({
  testDir: "./tests",

  // Parallelization settings
  // Enable full parallel for independent tests
  fullyParallel: true,

  // Forbid test.only on CI
  forbidOnly: isCI,

  // Retry configuration
  retries: isCI ? 2 : 1,

  // Worker configuration - more workers locally, fewer in CI for stability
  workers: isCI ? 2 : 4,

  // Global timeout
  timeout: TIMEOUTS.PAGE_LOAD,

  // Expect timeout
  expect: {
    timeout: TIMEOUTS.EXPECT,
    // Visual comparison settings
    toHaveScreenshot: {
      maxDiffPixels: 100,
      threshold: 0.2,
    },
    toMatchSnapshot: {
      maxDiffPixelRatio: 0.05,
    },
  },

  // Reporter configuration
  reporter: [
    // HTML report - always generate but only open on failure locally
    [
      "html",
      {
        open: isCI ? "never" : "on-failure",
        outputFolder: "playwright-report",
      },
    ],
    // List reporter for console output
    ["list"],
    // JUnit for CI integration
    ["junit", { outputFile: "results.xml" }],
    // JSON reporter for custom processing
    ["json", { outputFile: "test-results.json" }],
  ],

  // Global settings for all tests
  use: {
    // Base URL from environment
    baseURL: process.env.BASE_URL || "https://staging.trackmyshuttle.com",

    // Trace, screenshot, and video settings
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",

    // Headless mode
    headless: true,

    // Viewport
    viewport: VIEWPORTS.DESKTOP,

    // Ignore HTTPS errors for staging/test environments
    ignoreHTTPSErrors: true,

    // Timeouts
    actionTimeout: TIMEOUTS.ACTION,
    navigationTimeout: TIMEOUTS.NAVIGATION,

    // Locale and timezone
    locale: "en-US",
    timezoneId: "America/New_York",
  },

  // Project configurations
  projects: [
    // Setup project for authentication (runs first)
    {
      name: "setup",
      testMatch: /.*\.setup\.ts/,
      teardown: "cleanup",
    },

    // Cleanup project (runs after all tests)
    {
      name: "cleanup",
      testMatch: /.*\.teardown\.ts/,
    },

    // Chromium tests (depends on setup)
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
        // Use stored auth state for authenticated tests
        storageState: "playwright/.auth/user.json",
      },
      dependencies: ["setup"],
    },
  ],
  outputDir: "test-results",
});
