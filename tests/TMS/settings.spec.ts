import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { DashboardPage } from "../../pages/dashboard_page";
import { SettingsPage } from "../../pages/settings_page";
import { TEST_DATA } from "../../utils/test-data";

// Helper function to get credentials
function getCredentials(role: "OPERATOR" | "MANAGER") {
  const currentEnv = process.env.ENV || "staging";
  const envPrefix =
    currentEnv.toUpperCase() === "PREPRODUCTION"
      ? "PREPRODUCTION"
      : currentEnv.toUpperCase() === "PRODUCTION"
      ? "PROD"
      : "STAGING";

  return {
    email: process.env[`${envPrefix}_${role}_EMAIL`] || "",
    password: process.env[`${envPrefix}_${role}_PASSWORD`] || "",
    environment: currentEnv,
  };
}

test.describe("Settings Page Tests", () => {
  let loginPage: LoginPage;
  let dashboardPage: DashboardPage;
  let settingsPage: SettingsPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    dashboardPage = new DashboardPage(page);
    settingsPage = new SettingsPage(page);
  });

  test("Manager: Settings access @smoke @manager @settings", async ({
    page,
  }) => {
    const managerCreds = getCredentials("MANAGER");

    test.skip(
      !managerCreds.email || !managerCreds.password,
      "Manager credentials not provided"
    );

    // Login
    await page.goto(`${TEST_DATA.baseUrl}/login`);
    await loginPage.emailInput.fill(managerCreds.email);
    await loginPage.passwordInput.fill(managerCreds.password);
    await loginPage.loginButton.click();
    await page.waitForURL("**/dashboard", { timeout: 15000 });

    // Test settings access
    await settingsPage.verifySettingsAccess();

    // Logout
    await dashboardPage.logout();
  });

  test("Performance: Settings load time @performance @settings", async ({
    page,
  }) => {
    const managerCreds = getCredentials("MANAGER");

    test.skip(
      !managerCreds.email || !managerCreds.password,
      "Manager credentials not provided"
    );

    // Login
    await page.goto(`${TEST_DATA.baseUrl}/login`);
    await loginPage.emailInput.fill(managerCreds.email);
    await loginPage.passwordInput.fill(managerCreds.password);
    await loginPage.loginButton.click();
    await page.waitForURL("**/dashboard", { timeout: 10000 });

    // Measure performance
    const startTime = Date.now();
    await settingsPage.navigateToSettings();
    const loadTime = Date.now() - startTime;

    expect(loadTime).toBeLessThan(20000); // 20 seconds max
  });
});
