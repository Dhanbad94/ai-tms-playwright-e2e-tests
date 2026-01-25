import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { SettingsBasePage } from "../../pages/ASAP/settings-base.page";
import { DriverAppSettingsPage } from "../../pages/ASAP/driver-app-settings.page";
import { getCredentials, getBaseUrl, TIMEOUTS } from "./fixtures/test-data";

test.describe("ASAP Driver App Settings Tests @asap @settings", () => {
  let loginPage: LoginPage;
  let settingsPage: SettingsBasePage;
  let driverAppPage: DriverAppSettingsPage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  // Clear auth state since these tests perform their own login
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);
    driverAppPage = new DriverAppSettingsPage(page);

    // Login as Manager
    await page.goto(`${baseUrl}/login`);
    await loginPage.login(managerCreds.email, managerCreds.password);
    await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });

    // Navigate to Settings > Driver App
    await settingsPage.navigateToSettings(baseUrl);
    await settingsPage.clickTab("Driver App");
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  // ==================== PAGE LOAD TESTS ====================

  test("DA-001: Verify Driver App page loads @smoke @manager", async () => {
    await driverAppPage.verifyPageLoaded();
  });

  test("DA-002: Verify all accordion sections visible @smoke @manager", async () => {
    await driverAppPage.verifyAllSectionsVisible();
  });

  // ==================== INTRODUCTION SECTION ====================

  test.describe("Introduction Section", () => {
    test("DA-003: Verify Introduction section content @regression @manager", async () => {
      await driverAppPage.expandSection("introduction");
      await driverAppPage.verifyIntroductionContent();
    });

    test("DA-004: Verify click here link for adding drivers @regression @manager", async () => {
      await driverAppPage.expandSection("introduction");
      await expect(driverAppPage.addDriversLink).toBeVisible({ timeout: TIMEOUTS.short });
    });
  });

  // ==================== SMART TABLET SECTION ====================

  test.describe("Smart Tablet Section", () => {
    test("DA-005: Verify Smart Tablet section @regression @manager", async () => {
      await expect(driverAppPage.smartTabletTab).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("DA-006: Verify Smart Tablet content @regression @manager", async () => {
      await driverAppPage.expandSection("smartTablet");
      await driverAppPage.verifySmartTabletContent();
    });
  });

  // ==================== DOWNLOAD APP SECTION ====================

  test.describe("Download App Section", () => {
    test("DA-007: Verify Download App section @smoke @manager", async () => {
      await expect(driverAppPage.downloadAppTab).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("DA-008: Verify Download App content @regression @manager", async () => {
      await driverAppPage.expandSection("downloadApp");
      await driverAppPage.verifyDownloadAppContent();
    });

    test("DA-009: Verify Google Play Store image @regression @manager", async () => {
      await driverAppPage.expandSection("downloadApp");
      await expect(driverAppPage.googlePlayStoreImage).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("DA-010: Verify Apple App Store image @regression @manager", async () => {
      await driverAppPage.expandSection("downloadApp");
      await expect(driverAppPage.appleAppStoreImage).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("DA-011: Verify Quick Start Guides available @regression @manager", async () => {
      await driverAppPage.expandSection("downloadApp");
      await driverAppPage.verifyQuickStartGuidesAvailable();
    });

    test("DA-012: Verify English Quick Start Guide link @regression @manager", async () => {
      await driverAppPage.expandSection("downloadApp");
      const url = await driverAppPage.getEnglishGuideUrl();
      expect(url).toContain("Quick_Start_Guide_English.pdf");
    });

    test("DA-013: Verify Spanish Quick Start Guide link @regression @manager", async () => {
      await driverAppPage.expandSection("downloadApp");
      const url = await driverAppPage.getSpanishGuideUrl();
      expect(url).toContain("Quick_Start_Guide_Spanish.pdf");
    });
  });

  // ==================== NOTIFICATION SETTINGS SECTION ====================

  test.describe("Notification Settings Section", () => {
    test("DA-014: Verify Notification Settings section @regression @manager", async () => {
      await expect(driverAppPage.notificationSettingsTab).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("DA-015: Verify Notification Settings content @regression @manager", async () => {
      await driverAppPage.expandSection("notificationSettings");
      await driverAppPage.verifyNotificationSettingsContent();
    });

    test("DA-016: Verify SMS notification option exists @regression @manager", async ({ page }) => {
      await driverAppPage.expandSection("notificationSettings");
      await expect(page.getByText("Enable dispatch notifications via SMS")).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });
  });
});
