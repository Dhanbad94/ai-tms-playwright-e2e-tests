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
  // Login runs once for the whole suite, so give it room for a slow staging:
  // server response, form render, login POST and dashboard can each take tens
  // of seconds there (2026-11-28), which overran the default 90s test budget.
  setup.setTimeout(180_000);

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

  // Navigate to the login page, but don't wait for the page's load events.
  // On a slow staging both `load` and `domcontentloaded` wait for the page's
  // blocking scripts and ran past 45s, while the form itself was already on
  // screen. Measured 2026-11-28: server responds at 18-24s, form visible at
  // 25-44s, domcontentloaded at 29-76s. So start once the server responds and
  // treat the visible form as the readiness signal.
  await page.goto(`${TEST_DATA.baseUrl}${PATHS.LOGIN}`, { waitUntil: 'commit' });
  await page.locator('#login_email').waitFor({ state: 'visible', timeout: TIMEOUTS.NAVIGATION });

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

  // Click login button. The click waits for the login navigation it starts, but
  // only within its own timeout (10s by default); staging's login POST alone
  // took ~10.5s, so give it the navigation budget.
  await page.getByRole('button', { name: 'GO' }).click({ timeout: TIMEOUTS.NAVIGATION });

  // Wait for successful login - should redirect to dashboard
  await expect(page).toHaveURL(/dashboard/, { timeout: TIMEOUTS.NAVIGATION });

  console.log('✅ Authentication successful');

  // Save the authentication state
  await page.context().storageState({ path: authFile });

  console.log(`💾 Auth state saved to: ${authFile}`);
});
