import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { SettingsBasePage } from "../../pages/ASAP/settings-base.page";
import { AlertsSettingsPage } from "../../pages/ASAP/alerts-settings.page";
import { getCredentials, getBaseUrl, ALERT_TYPES, TIMEOUTS } from "./fixtures/test-data";

test.describe("ASAP Alerts Settings Tests @asap @settings", () => {
  let loginPage: LoginPage;
  let settingsPage: SettingsBasePage;
  let alertsPage: AlertsSettingsPage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  // Clear auth state since these tests perform their own login
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);
    alertsPage = new AlertsSettingsPage(page);

    // Login as Manager
    await page.goto(`${baseUrl}/login`);
    await loginPage.login(managerCreds.email, managerCreds.password);
    await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });

    // Navigate to Settings > Alerts
    await settingsPage.navigateToSettings(baseUrl);
    await settingsPage.clickTab("Alerts");
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  // ==================== PAGE LOAD TESTS ====================

  test("AL-001: Verify Alert Settings page loads @smoke @manager", async () => {
    await alertsPage.verifyPageLoaded();
  });

  test("AL-002: Verify User notification section @smoke @manager", async () => {
    await expect(alertsPage.userSectionHeading).toBeVisible({ timeout: TIMEOUTS.short });
  });

  // ==================== USER NOTIFICATION SECTION ====================

  test.describe("User Notification Section", () => {
    test("AL-003: Verify user search input @regression @manager", async () => {
      await expect(alertsPage.userSearchInput).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("AL-004: Verify already added users display @regression @manager", async () => {
      await expect(alertsPage.alreadyAddedLabel).toBeVisible({ timeout: TIMEOUTS.short });
    });
  });

  // ==================== ALERTS TABLE TESTS ====================

  test.describe("Alerts Table", () => {
    test("AL-005: Verify alerts table headers @regression @manager", async () => {
      await alertsPage.verifyTableHeaders();
    });

    test("AL-006: Verify page content is visible @regression @manager", async () => {
      await alertsPage.verifyPageContent();
    });
  });

  // ==================== GEOLOCATION SECTION ====================

  test.describe("Geolocation Section", () => {
    test("AL-007: Verify Geolocation section @smoke @manager", async () => {
      await alertsPage.verifyGeolocationSectionVisible();
    });

    test("AL-008: Verify Geofence Alert section @regression @manager", async () => {
      await expect(alertsPage.geofenceAlertHeading).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("AL-009: Verify default geofence radius @regression @manager", async () => {
      const radius = await alertsPage.getGeofenceRadius();
      expect(radius).toBe(ALERT_TYPES.geofence.defaultRadius);
    });

    test("AL-010: Verify Email notification checkbox @regression @manager", async () => {
      const isEnabled = await alertsPage.isGeofenceEmailEnabled();
      expect(typeof isEnabled).toBe("boolean");
    });

    test("AL-011: Verify SMS notification checkbox @regression @manager", async () => {
      const isEnabled = await alertsPage.isGeofenceSmsEnabled();
      expect(typeof isEnabled).toBe("boolean");
    });
  });
});
