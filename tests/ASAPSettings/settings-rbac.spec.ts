import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { SettingsBasePage } from "../../pages/ASAP/settings-base.page";
import { UserManagementPage } from "../../pages/ASAP/user-management.page";
import {
  getCredentials,
  getBaseUrl,
  SETTINGS_TAB_NAMES,
  EXISTING_USERS,
  TIMEOUTS,
} from "./fixtures/test-data";

test.describe("ASAP Settings RBAC Tests @asap @settings @rbac", () => {
  const baseUrl = getBaseUrl();

  // Clear auth state since these tests perform their own login
  test.use({ storageState: { cookies: [], origins: [] } });

  // ==================== MANAGER ACCESS TESTS ====================

  test.describe("Manager Role Access @manager", () => {
    let loginPage: LoginPage;
    let settingsPage: SettingsBasePage;
    let userManagementPage: UserManagementPage;
    const managerCreds = getCredentials("MANAGER");

    test.beforeEach(async ({ page }) => {
      test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

      loginPage = new LoginPage(page);
      settingsPage = new SettingsBasePage(page);
      userManagementPage = new UserManagementPage(page);

      // Login as Manager
      await page.goto(`${baseUrl}/login`);
      await loginPage.login(managerCreds.email, managerCreds.password);
      await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });
    });

    test.afterEach(async ({ page }) => {
      await page.context().clearCookies();
    });

    test("RBAC-002: Manager can access User Management tab @regression", async () => {
      await settingsPage.navigateToSettings(baseUrl);
      await settingsPage.clickTab("User Management");

      // Verify User Management page loads
      await userManagementPage.verifyPageLoaded();
      await userManagementPage.verifyUsersTableVisible();
    });

    test("RBAC-003: Manager can see Add User button @regression", async () => {
      await settingsPage.navigateToSettings(baseUrl);
      await settingsPage.clickTab("User Management");

      // Verify Add User button is visible and enabled
      await userManagementPage.verifyAddUserButtonEnabled();
    });

    test("RBAC-004: Manager can open Edit User dialog @regression", async () => {
      await settingsPage.navigateToSettings(baseUrl);
      await settingsPage.clickTab("User Management");

      // Open Edit dialog for Operator user
      await userManagementPage.clickEditUser(EXISTING_USERS.operator.email);
      await userManagementPage.verifyEditUserDialogVisible();

      // Close dialog
      await userManagementPage.closeEditUserDialog();
    });

    test("RBAC-005: Manager can see Delete option @regression", async () => {
      await settingsPage.navigateToSettings(baseUrl);
      await settingsPage.clickTab("User Management");

      // Open action menu
      await userManagementPage.openUserActionMenu(EXISTING_USERS.operator.email);

      // Verify Delete option is visible
      await expect(userManagementPage.actionMenuDeleteLink).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("RBAC-006: Manager sees Manage link in sidebar @smoke", async ({ page }) => {
      // Verify Manage link is visible in navigation
      await expect(page.getByRole("link", { name: "Manage" })).toBeVisible({ timeout: TIMEOUTS.short });
    });
  });

  // ==================== OPERATOR ACCESS TESTS ====================

  test.describe("Operator Role Access @operator @negative", () => {
    let loginPage: LoginPage;
    const operatorCreds = getCredentials("OPERATOR");

    test.beforeEach(async ({ page }) => {
      test.skip(!operatorCreds.email || !operatorCreds.password, "Operator credentials not provided");

      loginPage = new LoginPage(page);

      // Login as Operator
      await page.goto(`${baseUrl}/login`);
      await loginPage.login(operatorCreds.email, operatorCreds.password);
      await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });
    });

    test.afterEach(async ({ page }) => {
      await page.context().clearCookies();
    });

    test("RBAC-008: Operator cannot see Stops menu @regression", async ({ page }) => {
      // Stops should not be visible for Operator
      await expect(page.getByRole("link", { name: "Stops" })).not.toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("RBAC-009: Operator cannot see Analytics menu @regression", async ({ page }) => {
      // Analytics should not be visible for Operator
      await expect(page.getByRole("link", { name: "Analytics" })).not.toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("RBAC-010: Operator cannot see Manage/Settings link @smoke", async ({ page }) => {
      // Manage link should not be visible for Operator
      await expect(page.getByRole("link", { name: "Manage" })).not.toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("RBAC-011: Operator direct navigation to settings redirects @regression", async ({ page }) => {
      // Try to navigate directly to settings
      await page.goto(`${baseUrl}/setting`);

      // Should be redirected away from settings (to dashboard or access denied)
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
      const currentUrl = page.url();

      // Verify not on settings page
      expect(currentUrl).not.toContain("/setting");
    });
  });
});
