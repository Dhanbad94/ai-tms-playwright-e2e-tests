/**
 * Example Test File - Demonstrates Improved Testing Patterns
 *
 * This file shows how to use the new fixtures, constants, types,
 * and utilities for cleaner, more maintainable tests.
 */

import { test, expect } from '../../fixtures/test-fixtures';
import { TIMEOUTS, PATHS, TAGS, ERROR_MESSAGES } from '../../constants';
import { TEST_DATA } from '../../utils/test-data';

// Clear auth state since these tests navigate to login page directly
test.use({ storageState: { cookies: [], origins: [] } });

/**
 * Example 1: Using Custom Fixtures
 *
 * Instead of creating page objects manually, they're injected via fixtures.
 * This reduces boilerplate and ensures consistent setup.
 */
test.describe('Login Tests with Fixtures @smoke @critical', () => {
  // The loginPage is automatically available via fixtures
  test('should display login form elements', async ({ page, loginPage }) => {
    await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);

    // Use the page object methods
    await loginPage.verifyLoginPageElements();
  });

  test('should show error for invalid credentials @regression', async ({ page, loginPage }) => {
    await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);

    await loginPage.login('invalid@email.com', 'wrongpassword');

    // Wait for response
    await page.waitForLoadState('networkidle', { timeout: TIMEOUTS.MEDIUM }).catch(() => {});

    // Verify still on login page
    await expect(page).toHaveURL(/login/);
  });
});

/**
 * Example 2: Using Constants
 *
 * Constants centralize magic strings and numbers, making tests
 * more maintainable and self-documenting.
 */
test.describe('Timeout and Path Constants @system', () => {
  test('should navigate using path constants', async ({ page }) => {
    // Use PATHS constant instead of hardcoded strings
    await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);
    await expect(page).toHaveURL(new RegExp(PATHS.LOGIN));

    // Navigate to forgot password
    await page.getByRole('link', { name: 'Forgot Password?' }).click();
    await expect(page).toHaveURL(new RegExp(PATHS.FORGOT_PASSWORD));
  });

  test('should use timeout constants', async ({ page }) => {
    await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`, {
      timeout: TIMEOUTS.NAVIGATION,
    });

    // Wait for element with consistent timeout
    await page.locator('#login_email').waitFor({
      state: 'visible',
      timeout: TIMEOUTS.EXPECT,
    });
  });
});

/**
 * Example 3: Test Tagging Strategy
 *
 * Tags help organize and filter tests for different scenarios.
 */
test.describe('Tagged Tests', () => {
  // Smoke test - quick sanity check
  test('quick login page check @smoke', async ({ page }) => {
    await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);
    await expect(page.locator('#login_email')).toBeVisible();
  });

  // Critical test - business-critical path
  test('login form submission @critical @smoke', async ({ page, loginPage }) => {
    await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);
    await expect(loginPage.loginButton).toBeEnabled();
  });

  // Regression test - thorough verification
  test('complete form validation @regression', async ({ page, loginPage }) => {
    await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);

    // Test empty submission
    await loginPage.login('', '');
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.SHORT }).catch(() => {});

    // Test invalid email
    await loginPage.login('not-an-email', 'password123');
    await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.SHORT }).catch(() => {});

    // Verify still on login page
    await expect(page).toHaveURL(/login/);
  });

  // Slow test - performance-intensive
  test('full page load performance @slow @performance', async ({ page }) => {
    const startTime = Date.now();

    await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);
    // Use domcontentloaded instead of networkidle to avoid timeout issues
    // networkidle can hang if there are long-polling connections or analytics
    await page.waitForLoadState('domcontentloaded');
    // Wait for the login form to be visible as a reliable indicator
    await page.locator('#login_email').waitFor({ state: 'visible' });

    const loadTime = Date.now() - startTime;

    // Assert reasonable load time
    expect(loadTime).toBeLessThan(10000);
    console.log(`Page loaded in ${loadTime}ms`);
  });

});

/**
 * Example 4: Parallel vs Serial Tests
 *
 * Tests can be configured to run in parallel or serially
 * depending on their dependencies.
 */
test.describe('Independent Tests (Parallel)', () => {
  // These tests don't depend on each other and can run in parallel
  test('email input accepts text', async ({ page }) => {
    await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);
    await page.locator('#login_email').fill('test@example.com');
    await expect(page.locator('#login_email')).toHaveValue('test@example.com');
  });

  test('password input accepts text', async ({ page }) => {
    await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);
    await page.locator('#login_pass').fill('password123');
    await expect(page.locator('#login_pass')).toHaveValue('password123');
  });

  test('remember me checkbox toggles', async ({ page, loginPage }) => {
    await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);

    const initial = await loginPage.isRememberMeChecked();
    await loginPage.rememberMeCheckbox.click();
    const toggled = await loginPage.isRememberMeChecked();

    expect(toggled).toBe(!initial);
  });
});

test.describe.serial('Dependent Tests (Serial)', () => {
  // These tests depend on each other and must run in order
  let testState = { emailEntered: false };

  test('step 1: enter email', async ({ page }) => {
    await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);
    await page.locator('#login_email').fill('test@example.com');
    testState.emailEntered = true;
    expect(testState.emailEntered).toBe(true);
  });

  test('step 2: verify email was entered', async ({ page }) => {
    // This test depends on step 1
    expect(testState.emailEntered).toBe(true);
  });
});

/**
 * Example 5: Using test.step for Better Reports
 *
 * test.step() creates nested steps in the report for better visibility.
 */
test.describe('Test Steps for Reporting', () => {
  test('complete login flow with steps @smoke', async ({ page, loginPage }) => {
    await test.step('Navigate to login page', async () => {
      await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);
      await expect(page).toHaveURL(/login/);
    });

    await test.step('Verify page elements', async () => {
      await expect(loginPage.emailInput).toBeVisible();
      await expect(loginPage.passwordInput).toBeVisible();
      await expect(loginPage.loginButton).toBeVisible();
    });

    await test.step('Enter credentials', async () => {
      await loginPage.emailInput.fill('test@example.com');
      await loginPage.passwordInput.fill('password123');
    });

    await test.step('Submit form', async () => {
      await loginPage.loginButton.click();
      await page.waitForLoadState('domcontentloaded', { timeout: TIMEOUTS.SHORT }).catch(() => {});
    });
  });
});
