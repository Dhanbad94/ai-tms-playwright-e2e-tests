import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { SettingsBasePage } from "../../pages/ASAP/settings-base.page";
import { RiderAppSettingsPage } from "../../pages/ASAP/rider-app-settings.page";
import {
  getCredentials,
  getBaseUrl,
  ASAP_ORG_CONFIG,
  CANCELLATION_REASONS,
  TIMEOUTS,
} from "./fixtures/test-data";

test.describe("ASAP Rider App Settings Tests @asap @settings", () => {
  let loginPage: LoginPage;
  let settingsPage: SettingsBasePage;
  let riderAppPage: RiderAppSettingsPage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  // Clear auth state since these tests perform their own login
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);
    riderAppPage = new RiderAppSettingsPage(page);

    // Login as Manager
    await page.goto(`${baseUrl}/login`);
    await loginPage.login(managerCreds.email, managerCreds.password);
    await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });

    // Navigate to Settings > Rider App
    await settingsPage.navigateToSettings(baseUrl);
    await settingsPage.clickTab("Rider App");
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  // ==================== PAGE LOAD TESTS ====================

  test("RA-001: Verify Rider App Settings page loads @smoke @manager", async () => {
    await riderAppPage.verifyPageLoaded();
  });

  test("RA-002: Verify all accordion sections visible @smoke @manager", async () => {
    await riderAppPage.verifyAllSectionsVisible();
  });

  // ==================== ENABLE RIDER APP SECTION ====================

  test("RA-003: Verify Enable Rider App checkbox exists @smoke @manager", async ({ page }) => {
    await expect(page.getByText("Enable Rider App")).toBeVisible({ timeout: TIMEOUTS.short });
  });

  // ==================== CONFIGURE COVER PAGE SECTION ====================

  test.describe("Configure Cover Page Section", () => {
    test("RA-004: Verify Configure Cover Page section @regression @manager", async () => {
      await expect(riderAppPage.configureCoverPageTab).toBeVisible({ timeout: TIMEOUTS.short });
    });

  });

  // ==================== CONTACT SETTINGS SECTION ====================

  test.describe("Configure Contact Settings Section", () => {
    test("RA-006: Verify Contact Settings section @regression @manager", async () => {
      await expect(riderAppPage.configureContactSettingsTab).toBeVisible({ timeout: TIMEOUTS.short });
    });

  });

  // ==================== SHARE RIDER APP ACCESS SECTION ====================

  test.describe("Share Rider App Access Section", () => {
    test("RA-009: Verify Share Rider App Access section @smoke @manager", async () => {
      await expect(riderAppPage.shareRiderAppTab).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("RA-011: Verify Share Tracking Code heading @regression @manager", async () => {
      await riderAppPage.expandSection("shareAccess");
      await expect(riderAppPage.shareTrackingCodeHeading).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("RA-012: Verify Share Link & QR Code heading @regression @manager", async () => {
      await riderAppPage.expandSection("shareAccess");
      await expect(riderAppPage.shareLinkQrHeading).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("RA-013: Verify tracking link URL format @regression @manager", async ({ page }) => {
      await riderAppPage.expandSection("shareAccess");
      // Verify link contains tracking ID
      await expect(page.getByText(new RegExp(`/a/${ASAP_ORG_CONFIG.trackingId}`))).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("RA-014: Verify Copy Link button exists @regression @manager", async () => {
      await riderAppPage.expandSection("shareAccess");
      await expect(riderAppPage.copyLinkButton).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("RA-015: Verify QR Code button exists @regression @manager", async () => {
      await riderAppPage.expandSection("shareAccess");
      await expect(riderAppPage.qrCodeButton).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("RA-016: Verify Voicemail Script heading @regression @manager", async () => {
      await riderAppPage.expandSection("shareAccess");
      await expect(riderAppPage.voicemailScriptHeading).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("RA-017: Verify Display QR Signage heading @regression @manager", async () => {
      await riderAppPage.expandSection("shareAccess");
      await expect(riderAppPage.displayQrSignageHeading).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("RA-018: Verify PDF download options @regression @manager", async ({ page }) => {
      await riderAppPage.expandSection("shareAccess");
      // Verify 8.5 X 11 option
      await expect(page.getByText("8.5 X 11")).toBeVisible({ timeout: TIMEOUTS.short });
      // Verify 4 X 6 option
      await expect(page.getByText("4 X 6")).toBeVisible({ timeout: TIMEOUTS.short });
    });
  });

  // ==================== RIDE CANCELLATION OPTIONS SECTION ====================

  test.describe("Ride Cancellation Options Section", () => {
    test("RA-019: Verify Ride Cancellation section @regression @manager", async () => {
      await expect(riderAppPage.rideCancelationTab).toBeVisible({ timeout: TIMEOUTS.short });
    });

  });
});
