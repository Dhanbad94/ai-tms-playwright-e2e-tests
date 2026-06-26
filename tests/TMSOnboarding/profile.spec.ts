import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { ProfilePage } from "../../pages/profile_page";
import { TEST_DATA } from "../../utils/test-data";
import { TIMEOUTS } from "../../constants";
import { autoDismissCookieBanner } from "../../helpers/dismissCookieBanner";

/**
 * Profile Page - Complete Test Suite
 *
 * The Profile page lives at /profile.
 * Accessed via: user dropdown (top nav) → "View Profile"
 *
 * Layout:
 *   - Two tabs: "Profile Details" (#home) and "Change Password" (#menu1)
 *   - Profile Details: displays Name and Email (read-only)
 *   - Change Password: Old/New/Confirm password fields + Update button
 *
 * Test Tags:
 * @smoke       - Critical path tests
 * @regression  - Full regression coverage
 * @manager     - Tests requiring manager role
 * @profile     - Profile-related tests
 * @negative    - Negative / validation tests
 * @prod        - Read-only tests safe to run in production
 */

test.describe("Profile Page Tests @profile", () => {
  let loginPage: LoginPage;
  let profilePage: ProfilePage;

  const baseUrl = TEST_DATA.baseUrl;
  const managerEmail = TEST_DATA.loginEmail;
  const managerPassword = TEST_DATA.loginPassword;

  test.skip(
    !managerEmail || !managerPassword || managerEmail.includes("example.com"),
    "Test credentials not configured. Set STAGING_MANAGER_EMAIL and STAGING_MANAGER_PASSWORD in .env.local"
  );

  test.beforeEach(async ({ page, context }) => {
    loginPage = new LoginPage(page);
    profilePage = new ProfilePage(page);
    await autoDismissCookieBanner(page);

    // Authenticated via storageState (auth.setup). Navigate directly to the
    // /profile route instead of the org-specific user dropdown (robust across
    // environments and not dependent on the org name shown in the dropdown).
    await page.goto(`${baseUrl}/profile`, { waitUntil: "domcontentloaded" });
    // The shared storageState session can lapse during a long run, redirecting
    // protected routes to /login. If that happened, re-authenticate and retry.
    if (/\/login(\b|\/|$)/.test(page.url())) {
      await loginPage.login(managerEmail, managerPassword);
      await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.NAVIGATION }).catch(() => {});
      await page.goto(`${baseUrl}/profile`, { waitUntil: "domcontentloaded" });
    }
    await page.waitForURL("**/profile", { timeout: TIMEOUTS.NAVIGATION });
  });

  test.afterEach(async ({ context }) => {
    await context.clearCookies();
  });

  // ========== PROF-NAV: Navigation to Profile ==========

  test.describe("PROF-NAV: Profile Navigation", () => {

    test("PROF-NAV-001: Profile page loads at /profile @smoke @manager @prod", async ({ page }) => {
      expect(page.url()).toContain("/profile");
    });

    test("PROF-NAV-002: Profile page displays the Profile heading @smoke @manager @prod", async ({ page }) => {
      const heading = page.getByRole("heading", { name: "Profile", level: 3 });
      await expect(heading).toBeVisible({ timeout: TIMEOUTS.ACTION });
    });

    test("PROF-NAV-003: Profile page has Profile Details and Change Password tabs @smoke @manager @prod", async () => {
      await expect(profilePage.profileDetailsTab).toBeVisible({ timeout: TIMEOUTS.ACTION });
      await expect(profilePage.changePasswordTab).toBeVisible({ timeout: TIMEOUTS.ACTION });
    });

  });

  // ========== PROF-VIEW: Profile Details Tab ==========

  test.describe("PROF-VIEW: Profile Details Display", () => {

    test("PROF-VIEW-001: Profile Details tab is active by default @smoke @manager @prod", async () => {
      await expect(profilePage.profileDetailsContent).toBeVisible({ timeout: TIMEOUTS.ACTION });
    });

    test("PROF-VIEW-002: Profile Details shows a non-empty Name @smoke @manager @prod", async () => {
      const name = await profilePage.getProfileName();
      expect(name.trim().length).toBeGreaterThan(0);
    });

    test("PROF-VIEW-003: Profile Details shows a valid email address @smoke @manager @prod", async () => {
      const email = await profilePage.getProfileEmail();
      expect(email).toMatch(/\S+@\S+\.\S+/);
    });

    test("PROF-VIEW-004: Profile Details email matches the logged-in manager email @regression @manager @prod", async () => {
      const email = await profilePage.getProfileEmail();
      expect(email.trim().toLowerCase()).toBe(managerEmail.toLowerCase());
    });

    test("PROF-VIEW-005: Profile Details name contains 'manager' for the manager role @regression @manager @prod", async () => {
      const name = await profilePage.getProfileName();
      expect(name.toLowerCase()).toContain("manager");
    });

  });

  // ========== PROF-TABS: Tab Navigation ==========

  test.describe("PROF-TABS: Tab Navigation", () => {

    test("PROF-TABS-001: Clicking Change Password tab shows the password form @smoke @manager @prod", async () => {
      await profilePage.changePasswordTab.click();
      await expect(profilePage.changePasswordContent).toBeVisible({ timeout: TIMEOUTS.ACTION });
    });

    test("PROF-TABS-002: Clicking Profile Details tab shows the profile info @regression @manager @prod", async () => {
      // Switch to Change Password first
      await profilePage.changePasswordTab.click();
      await expect(profilePage.changePasswordContent).toBeVisible({ timeout: TIMEOUTS.ACTION });

      // Then switch back to Profile Details
      await profilePage.profileDetailsTab.click();
      await expect(profilePage.profileDetailsContent).toBeVisible({ timeout: TIMEOUTS.ACTION });
    });

    test("PROF-TABS-003: Only one tab content is active at a time @regression @manager @prod", async () => {
      await profilePage.changePasswordTab.click();
      await expect(profilePage.changePasswordContent).toBeVisible({ timeout: TIMEOUTS.ACTION });
      await expect(profilePage.profileDetailsContent).not.toBeVisible({ timeout: TIMEOUTS.SHORT });
    });

  });

  // ========== PROF-PWD: Change Password Tab ==========

  test.describe("PROF-PWD: Change Password Form", () => {

    test.beforeEach(async () => {
      await profilePage.openChangePasswordTab();
    });

    test("PROF-PWD-001: Change Password tab shows all three password fields @smoke @manager @prod", async () => {
      await expect(profilePage.oldPasswordInput).toBeVisible({ timeout: TIMEOUTS.ACTION });
      await expect(profilePage.newPasswordInput).toBeVisible({ timeout: TIMEOUTS.ACTION });
      await expect(profilePage.confirmPasswordInput).toBeVisible({ timeout: TIMEOUTS.ACTION });
    });

    test("PROF-PWD-002: Change Password tab shows the Update button @smoke @manager @prod", async () => {
      await expect(profilePage.updatePasswordButton).toBeVisible({ timeout: TIMEOUTS.ACTION });
    });

    test("PROF-PWD-003: Password fields accept text input @regression @manager", async () => {
      await profilePage.oldPasswordInput.fill("TestOld123");
      await profilePage.newPasswordInput.fill("TestNew456");
      await profilePage.confirmPasswordInput.fill("TestNew456");

      await expect(profilePage.oldPasswordInput).not.toHaveValue("");
      await expect(profilePage.newPasswordInput).not.toHaveValue("");
      await expect(profilePage.confirmPasswordInput).not.toHaveValue("");

      // Cleanup
      await profilePage.clearPasswordFields();
    });

    test("PROF-PWD-004: Password fields can be cleared @regression @manager", async () => {
      await profilePage.fillChangePasswordForm("TestOld123", "TestNew456", "TestNew456");
      await profilePage.clearPasswordFields();
      await profilePage.verifyPasswordFieldsAreEmpty();
    });

    test("PROF-PWD-005: Password visibility toggle buttons are present @regression @manager @prod", async () => {
      const toggleCount = await profilePage.passwordVisibilityToggles.count();
      expect(toggleCount).toBeGreaterThanOrEqual(1);
    });

  });

  // ========== PROF-VAL: Validation ==========

  test.describe("PROF-VAL: Change Password Validation", () => {

    test.beforeEach(async () => {
      await profilePage.openChangePasswordTab();
    });

    test("PROF-VAL-001: Submitting empty password form shows error indicators @negative @manager", async ({ page }) => {
      await profilePage.updatePasswordButton.click();
      await page.waitForTimeout(TIMEOUTS.SHORT);

      // At least one error indicator must be visible (input-error or toast)
      const hasErrors =
        (await profilePage.passwordErrors.count()) > 0 ||
        (await page.locator(".toaster.notification_error").isVisible());
      expect(hasErrors).toBe(true);
    });

    test("PROF-VAL-002: Mismatched new and confirm passwords shows an error @negative @manager", async ({ page }) => {
      await profilePage.fillChangePasswordForm("OldPass123", "NewPass456", "DifferentPass789");
      await profilePage.updatePasswordButton.click();
      await page.waitForTimeout(TIMEOUTS.SHORT);

      const hasErrors =
        (await profilePage.passwordErrors.count()) > 0 ||
        (await page.locator(".toaster.notification_error").isVisible());
      expect(hasErrors).toBe(true);

      // Cleanup
      await profilePage.clearPasswordFields();
    });

  });

});
