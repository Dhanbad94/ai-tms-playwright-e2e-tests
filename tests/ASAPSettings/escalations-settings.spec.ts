import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { SettingsBasePage } from "../../pages/ASAP/settings-base.page";
import { EscalationsSettingsPage } from "../../pages/ASAP/escalations-settings.page";
import { getCredentials, getBaseUrl, ESCALATION_TYPES, TIMEOUTS } from "./fixtures/test-data";

test.describe("ASAP Escalations Settings Tests @asap @settings", () => {
  let loginPage: LoginPage;
  let settingsPage: SettingsBasePage;
  let escalationsPage: EscalationsSettingsPage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  // Clear auth state since these tests perform their own login
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);
    escalationsPage = new EscalationsSettingsPage(page);

    // Login as Manager
    await page.goto(`${baseUrl}/login`);
    await loginPage.login(managerCreds.email, managerCreds.password);
    await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });

    // Navigate to Settings > Escalations
    await settingsPage.navigateToSettings(baseUrl);
    await settingsPage.clickTab("Escalations");
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  // ==================== PAGE LOAD TESTS ====================

  test("ES-001: Verify Escalation Settings page loads @smoke @manager", async () => {
    await escalationsPage.verifyPageLoaded();
  });

  test("ES-002: Verify page content is visible @regression @manager", async () => {
    await escalationsPage.verifyPageContent();
  });

  // ==================== RIDE REQUEST ESCALATION ====================

  test.describe("Ride Request Escalation Section", () => {
    test("ES-003: Verify Ride Request escalation section @smoke @manager", async ({ page }) => {
      await expect(page.getByText(ESCALATION_TYPES.rideRequestNotAddressed)).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("ES-004: Verify Ride Request checkbox exists @regression @manager", async () => {
      await expect(escalationsPage.rideRequestNotAddressedLabel).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("ES-005: Verify Ride Request See Example link @regression @manager", async () => {
      await expect(escalationsPage.rideRequestSeeExampleLink).toBeVisible({ timeout: TIMEOUTS.short });
    });
  });

  // ==================== TRIP NOT STARTED ESCALATION ====================

  test.describe("Trip Not Started Escalation Section", () => {
    test("ES-006: Verify Trip Not Started section @smoke @manager", async ({ page }) => {
      await expect(page.getByText(ESCALATION_TYPES.tripNotStarted)).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("ES-007: Verify Trip Not Started checkbox exists @regression @manager", async () => {
      await expect(escalationsPage.tripNotStartedLabel).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("ES-008: Verify Trip Not Started See Example link @regression @manager", async () => {
      await expect(escalationsPage.tripNotStartedSeeExampleLink).toBeVisible({ timeout: TIMEOUTS.short });
    });
  });

  // ==================== ESCALATION CONFIGURATION ====================

  test.describe("Escalation Configuration", () => {
    test("ES-009: Verify escalation configuration UI elements @regression @manager", async () => {
      await escalationsPage.verifyEscalationConfigVisible();
    });

    test("ES-010: Verify Add More button exists @regression @manager", async ({ page }) => {
      await expect(page.getByText("+ Add More").first()).toBeVisible({ timeout: TIMEOUTS.short });
    });
  });
});
