import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/login_page';
import { DashboardPage } from '../pages/dashboard_page';
import { ProfilePage } from '../pages/profile_page';
import { SettingsPage } from '../pages/settings_page';
import { ActivateAccountPage } from '../pages/activate_account_page';
import { ForgotPasswordPage } from '../pages/forgot_password_page';
import { TEST_DATA } from '../utils/test-data';

/**
 * Custom test fixtures for TMS E2E tests
 * These fixtures automatically instantiate page objects and handle common setup
 */

// Define the types for our custom fixtures
export interface TMSFixtures {
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  profilePage: ProfilePage;
  settingsPage: SettingsPage;
  activateAccountPage: ActivateAccountPage;
  forgotPasswordPage: ForgotPasswordPage;
}

// Define the types for our custom worker fixtures (shared across tests in a worker)
export interface TMSWorkerFixtures {
  testData: typeof TEST_DATA;
}

/**
 * Extended test object with all TMS page object fixtures
 * Usage: import { test, expect } from '../fixtures/test-fixtures';
 */
export const test = base.extend<TMSFixtures, TMSWorkerFixtures>({
  // Page object fixtures - automatically instantiated for each test
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  dashboardPage: async ({ page }, use) => {
    const dashboardPage = new DashboardPage(page);
    await use(dashboardPage);
  },

  profilePage: async ({ page }, use) => {
    const profilePage = new ProfilePage(page);
    await use(profilePage);
  },

  settingsPage: async ({ page }, use) => {
    const settingsPage = new SettingsPage(page);
    await use(settingsPage);
  },

  activateAccountPage: async ({ page }, use) => {
    const activateAccountPage = new ActivateAccountPage(page);
    await use(activateAccountPage);
  },

  forgotPasswordPage: async ({ page }, use) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);
    await use(forgotPasswordPage);
  },

  // Worker-scoped fixture for test data (shared across tests in same worker)
  testData: [async ({}, use) => {
    await use(TEST_DATA);
  }, { scope: 'worker' }],
});

// Re-export expect for convenience
export { expect } from '@playwright/test';

/**
 * Fixture for authenticated tests - logs in before each test
 * Usage: import { authenticatedTest } from '../fixtures/test-fixtures';
 */
export const authenticatedTest = test.extend<{ authenticatedPage: Page }>({
  authenticatedPage: async ({ page, loginPage }, use) => {
    // Navigate to login page
    await page.goto(`${TEST_DATA.baseUrl}/login`);

    // Perform login
    await loginPage.login(TEST_DATA.loginEmail, TEST_DATA.loginPassword);

    // Wait for dashboard to load (indicating successful login)
    await page.waitForURL('**/dashboard', { timeout: 30000 });

    // Provide the authenticated page to the test
    await use(page);
  },
});
