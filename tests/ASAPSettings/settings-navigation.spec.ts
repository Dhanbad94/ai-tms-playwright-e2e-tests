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


  test.beforeEach(async ({ page }) => {
    test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);


    // Navigate to Settings
    await settingsPage.navigateToSettings(baseUrl);
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("SN-001: Verify all 11 settings left-panel tabs are visible @smoke @manager", async () => {
    await settingsPage.verifyAllTabsVisible();

    // Verify tab count
    const tabCount = await settingsPage.getTabCount();
    expect(tabCount).toBe(11);
  });

  test("SET-NAV-002: Organization is the active tab by default @regression @manager", async ({ page }) => {
    // Organization is the default tab: its settings content is shown on load.
    await expect(
      page.getByRole("heading", { name: "Organization Settings" })
    ).toBeVisible({ timeout: 10000 });
  });

  // SET-NAV-003..013: click each left-panel tab and verify it becomes active.
  for (const tabName of SETTINGS_TAB_NAMES) {
    test(`SET-NAV: Navigate to "${tabName}" tab @navigation @manager`, async () => {
      await settingsPage.clickTab(tabName);
      await settingsPage.verifyTabIsActive(tabName);
    });
  }

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
