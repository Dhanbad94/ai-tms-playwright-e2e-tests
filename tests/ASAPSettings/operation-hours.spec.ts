import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { SettingsBasePage } from "../../pages/ASAP/settings-base.page";
import { OperationHoursPage } from "../../pages/ASAP/operation-hours.page";
import {
  getCredentials,
  getBaseUrl,
  OPERATION_HOURS_DEFAULTS,
  TIMEOUTS,
} from "./fixtures/test-data";

test.describe("ASAP Operation Hours Tests @asap @settings", () => {
  let loginPage: LoginPage;
  let settingsPage: SettingsBasePage;
  let operationHoursPage: OperationHoursPage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  // Clear auth state since these tests perform their own login
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);
    operationHoursPage = new OperationHoursPage(page);

    // Login as Manager
    await page.goto(`${baseUrl}/login`);
    await loginPage.login(managerCreds.email, managerCreds.password);
    await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });

    // Navigate to Settings > Operation Hours
    await settingsPage.navigateToSettings(baseUrl);
    await settingsPage.clickTab("Operation Hours");
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("OH-001: Verify Operation Hours page loads @smoke @manager", async () => {
    await operationHoursPage.verifyPageLoaded();
  });

  test("OH-002: Verify Run 24/7 option visible @smoke @manager", async () => {
    await expect(operationHoursPage.run24x7Radio).toBeVisible({ timeout: TIMEOUTS.short });
  });

  test("OH-003: Verify Custom Hours option visible @smoke @manager", async () => {
    await expect(operationHoursPage.customHoursRadio).toBeVisible({ timeout: TIMEOUTS.short });
  });

  test("OH-004: Verify Run 24/7 is default for ASAP @smoke @manager", async () => {
    await operationHoursPage.verifyRun24x7Selected();

    const setting = await operationHoursPage.getOperationHoursSetting();
    expect(setting).toBe(OPERATION_HOURS_DEFAULTS.mode);
  });

  test("OH-005: Verify option descriptions @regression @manager", async () => {
    // Verify Run 24/7 description
    await expect(operationHoursPage.run24x7Description).toBeVisible({ timeout: TIMEOUTS.short });
    await expect(operationHoursPage.run24x7Description).toHaveText("Guests get shuttled 24hrs Everyday.");

    // Verify Custom Hours description
    await expect(operationHoursPage.customHoursDescription).toBeVisible({ timeout: TIMEOUTS.short });
    await expect(operationHoursPage.customHoursDescription).toHaveText(
      "Guests get shuttled only during specific hours/days."
    );
  });

  test("OH-006: Verify all options are visible @regression @manager", async () => {
    await operationHoursPage.verifyAllOptionsVisible();
  });

  test("OH-007: Verify Run 24/7 option is not disabled @regression @manager", async () => {
    const isDisabled = await operationHoursPage.isRun24x7Disabled();
    expect(isDisabled).toBe(false);
  });

  test("OH-008: Verify Custom Hours option is not disabled @regression @manager", async () => {
    const isDisabled = await operationHoursPage.isCustomHoursDisabled();
    expect(isDisabled).toBe(false);
  });
});
