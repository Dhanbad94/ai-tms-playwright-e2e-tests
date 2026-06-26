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

// Namespace auth state per environment so a staging session is never reused
// against preproduction/production (and vice versa).
const ENV = (process.env.ENV || 'staging').toLowerCase();
const authFile = `playwright/.auth/${ENV}.json`;

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

  // Enable "Remember me" so the saved session is long-lived rather than
  // session-only. This keeps the reused storageState valid across long test
  // runs (otherwise the session expires mid-run and later tests get redirected
  // to /login). Best-effort: don't fail setup if the control isn't present.
  try {
    const rememberMe = page.getByRole('checkbox', { name: /remember me/i });
    await rememberMe.check({ timeout: 5000 });
  } catch {
    await page.locator('#remember_me').check({ force: true }).catch(() => {});
  }

  // Click login button
  await page.getByRole('button', { name: 'GO' }).click();

  // Wait for successful login - should redirect to dashboard
  await expect(page).toHaveURL(/dashboard/, { timeout: TIMEOUTS.PAGE_LOAD });

  console.log('✅ Authentication successful');

  // Save the authentication state
  await page.context().storageState({ path: authFile });

  console.log(`💾 Auth state saved to: ${authFile}`);
});
