import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { SettingsBasePage } from "../../pages/ASAP/settings-base.page";
import { PricingSetupPage } from "../../pages/ASAP/pricing-setup.page";
import { getCredentials, getBaseUrl, TIMEOUTS } from "./fixtures/test-data";

test.describe("ASAP Pricing Setup Tests @asap @settings", () => {
  let loginPage: LoginPage;
  let settingsPage: SettingsBasePage;
  let pricingPage: PricingSetupPage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  // Clear auth state since these tests perform their own login
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);
    pricingPage = new PricingSetupPage(page);

    // Login as Manager
    await page.goto(`${baseUrl}/login`);
    await loginPage.login(managerCreds.email, managerCreds.password);
    await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });

    // Navigate to Settings > Pricing Setup
    await settingsPage.navigateToSettings(baseUrl);
    await settingsPage.clickTab("Pricing Setup");
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  // ==================== PAGE LOAD TESTS ====================

  test("PS-002: Verify page content is visible @regression @manager", async () => {
    await pricingPage.verifyPageContent();
  });

  // ==================== PAYOUT ACCOUNT SETUP SECTION ====================

  test.describe("Payout Account Setup Section", () => {
    test("PS-003: Verify Payout Account Setup section @smoke @manager", async () => {
      await pricingPage.verifyPayoutAccountSectionVisible();
    });

    test("PS-004: Verify Start Setup button @regression @manager", async () => {
      await expect(pricingPage.startSetupButton).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("PS-005: Verify Start Setup button is enabled @regression @manager", async () => {
      const isEnabled = await pricingPage.isStartSetupEnabled();
      expect(isEnabled).toBe(true);
    });
  });

  // ==================== ENABLE PAYMENT SECTION ====================

  test.describe("Enable Payment Section", () => {
    test("PS-006: Verify Enable Payment section @regression @manager", async () => {
      await expect(pricingPage.enablePaymentHeading).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("PS-007: Verify payment checkbox is disabled (Stripe not setup) @regression @manager", async () => {
      const isDisabled = await pricingPage.isPaymentCheckboxDisabled();
      expect(isDisabled).toBe(true);
    });
  });

  // ==================== CONFIGURE PRICING SECTION ====================

  test.describe("Configure Pricing Section", () => {
    test("PS-008: Verify Configure Pricing section @regression @manager", async () => {
      await pricingPage.verifyConfigurePricingSectionVisible();
    });

    test("PS-009: Verify currency display @regression @manager", async () => {
      const currency = await pricingPage.getCurrentCurrency();
      expect(currency).toBe("USD");
    });
  });

  // ==================== CANCELLATION & REFUND SECTION ====================

  test.describe("Cancellation & Refund Section", () => {
    test("PS-010: Verify Cancellation & Refund section @regression @manager", async () => {
      await pricingPage.verifyCancellationSectionVisible();
    });

    test("PS-011: Verify cancellation checkbox is disabled (Stripe not setup) @regression @manager", async () => {
      const isDisabled = await pricingPage.isCancellationCheckboxDisabled();
      expect(isDisabled).toBe(true);
    });
  });

});
