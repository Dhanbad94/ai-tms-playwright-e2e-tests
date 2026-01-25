import { test as setup, expect } from '@playwright/test';
import { TEST_DATA } from '../utils/test-data';
import { PATHS, TIMEOUTS } from '../constants';
import path from 'path';
import fs from 'fs';

/**
 * Authentication Setup
 *
 * This file runs before all tests to establish an authenticated session.
 * The auth state is saved and reused across tests, eliminating the need
 * to log in before each test.
 *
 * Benefits:
 * - Faster test execution (login only happens once)
 * - More reliable tests (fewer network calls)
 * - Cleaner test code (no login boilerplate)
 */

const authFile = 'playwright/.auth/user.json';

setup('authenticate', async ({ page }) => {
  // Ensure the auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Skip if credentials are not configured
  if (!TEST_DATA.loginEmail || !TEST_DATA.loginPassword ||
      TEST_DATA.loginEmail.includes('example.com')) {
    console.log('⚠️  Skipping auth setup: credentials not configured');
    console.log('   Set STAGING_MANAGER_EMAIL and STAGING_MANAGER_PASSWORD in .env.local');

    // Create an empty auth state so tests can still run (without auth)
    await page.context().storageState({ path: authFile });
    return;
  }

  console.log(`🔐 Authenticating as: ${TEST_DATA.loginEmail}`);

  // Navigate to login page
  await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`);

  // Wait for the login form to be ready
  await page.waitForLoadState('domcontentloaded');

  // Fill in credentials
  await page.locator('#login_email').fill(TEST_DATA.loginEmail);
  await page.locator('#login_pass').fill(TEST_DATA.loginPassword);

  // Click login button
  await page.getByRole('button', { name: 'GO' }).click();

  // Wait for successful login - should redirect to dashboard
  await expect(page).toHaveURL(/dashboard/, { timeout: TIMEOUTS.PAGE_LOAD });

  console.log('✅ Authentication successful');

  // Save the authentication state
  await page.context().storageState({ path: authFile });

  console.log(`💾 Auth state saved to: ${authFile}`);
});
