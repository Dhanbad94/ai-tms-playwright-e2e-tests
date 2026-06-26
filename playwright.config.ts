import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { defineConfig, devices } from "@playwright/test";
import { TIMEOUTS, VIEWPORTS } from "./constants";
import { getBaseUrl } from "./tests/ASAPSettings/fixtures/test-data";

// Active environment (staging | preproduction | production), defaults to staging
const ENV = (process.env.ENV || "staging").toLowerCase();

// Per-environment auth state so switching ENV never reuses another env's session
const authStateFile = `playwright/.auth/${ENV}.json`;

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
  retries: isCI ? 1 : 1,

  // Worker configuration - more workers locally, fewer in CI for stability
  workers: isCI ? 4 : 4,

  // Per-test timeout. Kept ABOVE navigationTimeout (NAVIGATION) so a single
  // slow navigation under full-suite parallel load on staging leaves headroom
  // for the rest of the test/hook instead of dying mid-navigation at 30s.
  timeout: TIMEOUTS.TEST_TIMEOUT,

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
    // Base URL derived from ENV (overridable via BASE_URL for CI)
    baseURL: process.env.BASE_URL || getBaseUrl(),

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
        // Use stored auth state for authenticated tests (namespaced per env)
        storageState: authStateFile,
      },
      dependencies: ["setup"],
    },
  ],
  outputDir: "test-results",
});
