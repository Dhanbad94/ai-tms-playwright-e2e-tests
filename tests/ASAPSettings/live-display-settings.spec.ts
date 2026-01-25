import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { SettingsBasePage } from "../../pages/ASAP/settings-base.page";
import { LiveDisplaySettingsPage } from "../../pages/ASAP/live-display-settings.page";
import { getCredentials, getBaseUrl, TIMEOUTS } from "./fixtures/test-data";

test.describe("ASAP Live Display Settings Tests @asap @settings", () => {
  let loginPage: LoginPage;
  let settingsPage: SettingsBasePage;
  let liveDisplayPage: LiveDisplaySettingsPage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  // Clear auth state since these tests perform their own login
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);
    liveDisplayPage = new LiveDisplaySettingsPage(page);

    // Login as Manager
    await page.goto(`${baseUrl}/login`);
    await loginPage.login(managerCreds.email, managerCreds.password);
    await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });

    // Navigate to Settings > Live display
    await settingsPage.navigateToSettings(baseUrl);
    await settingsPage.clickTab("Live display");
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("LD-001: Verify Live Display Settings page loads @smoke @manager", async () => {
    await liveDisplayPage.verifyPageLoaded();
  });

  test("LD-002: Verify section heading @regression @manager", async () => {
    await expect(liveDisplayPage.sectionHeading).toBeVisible({ timeout: TIMEOUTS.short });
    await expect(liveDisplayPage.sectionHeading).toHaveText("Stop & Device Specific Live Displays");
  });

  test("LD-003: Verify section description @regression @manager", async () => {
    await expect(liveDisplayPage.sectionDescription).toBeVisible({ timeout: TIMEOUTS.short });
  });

  test("LD-004: Verify warning message @regression @manager", async () => {
    await liveDisplayPage.verifyWarningMessageVisible();

    const warningText = await liveDisplayPage.getWarningMessageText();
    expect(warningText).toContain("Live Display may not be compatible");
  });

  test("LD-005: Verify Create Live Display button @smoke @manager", async () => {
    await expect(liveDisplayPage.createLiveDisplayButton).toBeVisible({ timeout: TIMEOUTS.short });
  });

  test("LD-006: Verify Create Live Display button is enabled @regression @manager", async () => {
    const isEnabled = await liveDisplayPage.isCreateButtonEnabled();
    expect(isEnabled).toBe(true);
  });

  test("LD-007: Verify page content is complete @regression @manager", async () => {
    await liveDisplayPage.verifyPageContent();
  });
});
