import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { SettingsBasePage } from "../../pages/ASAP/settings-base.page";
import {
  getCredentials,
  getBaseUrl,
  SETTINGS_TAB_NAMES,
  SETTINGS_TAB_HASHES,
  TIMEOUTS,
  PERFORMANCE_THRESHOLDS,
} from "./fixtures/test-data";

test.describe("ASAP Settings Navigation Tests @asap @settings", () => {
  let loginPage: LoginPage;
  let settingsPage: SettingsBasePage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  // Clear auth state since these tests perform their own login
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);

    // Login as Manager
    await page.goto(`${baseUrl}/login`);
    await loginPage.login(managerCreds.email, managerCreds.password);
    await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });

    // Navigate to Settings
    await settingsPage.navigateToSettings(baseUrl);
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("SN-001: Verify all 10 settings tabs are visible @smoke @manager", async () => {
    await settingsPage.verifyAllTabsVisible();

    // Verify tab count
    const tabCount = await settingsPage.getTabCount();
    expect(tabCount).toBe(10);
  });

  test("SN-005: Verify settings page loads within threshold @performance", async ({ page }) => {
    // Navigate away first
    await page.goto(`${baseUrl}/dashboard`);
    await page.waitForLoadState("domcontentloaded");

    // Measure settings page load time
    const startTime = Date.now();
    await settingsPage.navigateToSettings(baseUrl);
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(PERFORMANCE_THRESHOLDS.pageLoad);
  });

  test("SN-006: Verify URL hash persistence on page refresh @regression @manager", async ({ page }) => {
    // Navigate to User Management
    await settingsPage.clickTab("User Management");
    await expect(page).toHaveURL(/\/setting#members/);

    // Refresh page
    await page.reload();
    await settingsPage.waitForSettingsPageLoad();

    // Verify hash is preserved
    await expect(page).toHaveURL(/\/setting#members/);
  });
});
