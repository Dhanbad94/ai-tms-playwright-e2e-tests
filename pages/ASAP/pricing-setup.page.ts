import { Page, Locator, expect } from "@playwright/test";

/**
 * Pricing Setup Page Object
 * Settings Tab: Pricing Setup
 * URL Hash: #stripe
 */
export class PricingSetupPage {
  readonly page: Page;

  // Page Heading
  readonly pageHeading: Locator;
  readonly pageDescription: Locator;

  // Payout Account Setup Section
  readonly payoutAccountHeading: Locator;
  readonly payoutAccountDescription: Locator;
  readonly startSetupButton: Locator;

  // Enable Payment Section
  readonly enablePaymentHeading: Locator;
  readonly enablePaymentDescription: Locator;
  readonly enablePaymentCheckbox: Locator;

  // Configure Pricing Section
  readonly configurePricingTab: Locator;
  readonly configurePricingHeading: Locator;
  readonly configurePricingDescription: Locator;
  readonly currencyHeading: Locator;

  // Cancellation & Refund Section
  readonly cancellationRefundHeading: Locator;
  readonly cancellationRefundDescription: Locator;
  readonly cancellationRefundCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page Heading
    this.pageHeading = page.getByRole("heading", { name: "Pricing Setup", level: 2 });
    this.pageDescription = page.getByText("Set different rates for different distance ranges");

    // Payout Account Setup Section
    this.payoutAccountHeading = page.getByRole("heading", { name: "Payout Account Setup", level: 3 });
    this.payoutAccountDescription = page.getByText("Complete your Stripe KYC account setup to enable paid rides.");
    this.startSetupButton = page.getByRole("button", { name: "Start Setup" });

    // Enable Payment Section
    this.enablePaymentHeading = page.getByRole("heading", { name: "Enable Payment in Rider App", level: 3 });
    this.enablePaymentDescription = page.getByText(/Once enabled riders will be able to make payments in the Rider App/);
    // The checkbox is in a sibling container to the heading section
    this.enablePaymentCheckbox = page.getByRole("heading", { name: "Enable Payment in Rider App" }).locator("..").locator("..").locator("..").getByRole("checkbox");

    // Configure Pricing Section - using regex since tab has complex name with icon
    this.configurePricingTab = page.getByRole("tab", { name: /Configure.*Standard Pricing Model/i });
    this.configurePricingHeading = page.getByRole("heading", { name: /Configure.*Standard Pricing Model/i, level: 4 });
    this.configurePricingDescription = page.getByText("Set different rates for different distance ranges Please complete Payout Account Setup to configure pricing.");
    this.currencyHeading = page.getByRole("heading", { name: "USD", level: 5 });

    // Cancellation & Refund Section
    this.cancellationRefundHeading = page.getByRole("heading", { name: "Cancellation & Refund", level: 3 });
    this.cancellationRefundDescription = page.getByText("Enable cancellation and refund rules for bookings Please complete Payout Account Setup to enable.");
    // The checkbox is in a sibling container to the heading section
    this.cancellationRefundCheckbox = page.getByRole("heading", { name: "Cancellation & Refund" }).locator("..").locator("..").locator("..").getByRole("checkbox");
  }

  /**
   * Verify pricing setup page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
    await expect(this.pageDescription).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify page content is visible
   */
  async verifyPageContent(): Promise<void> {
    await expect(this.payoutAccountHeading).toBeVisible({ timeout: 5000 });
    await expect(this.enablePaymentHeading).toBeVisible({ timeout: 5000 });
    await expect(this.cancellationRefundHeading).toBeVisible({ timeout: 5000 });
  }

  // ========== Payout Account Setup Methods ==========

  /**
   * Verify payout account setup section is visible
   */
  async verifyPayoutAccountSectionVisible(): Promise<void> {
    await expect(this.payoutAccountHeading).toBeVisible({ timeout: 5000 });
    await expect(this.payoutAccountDescription).toBeVisible({ timeout: 5000 });
    await expect(this.startSetupButton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click start setup button
   */
  async clickStartSetup(): Promise<void> {
    await this.startSetupButton.click();
    // Wait for setup modal or redirect
    await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
  }

  /**
   * Check if start setup button is enabled
   */
  async isStartSetupEnabled(): Promise<boolean> {
    return await this.startSetupButton.isEnabled();
  }

  // ========== Enable Payment Methods ==========

  /**
   * Check if payment is enabled
   */
  async isPaymentEnabled(): Promise<boolean> {
    return await this.enablePaymentCheckbox.isChecked();
  }

  /**
   * Check if payment checkbox is disabled
   */
  async isPaymentCheckboxDisabled(): Promise<boolean> {
    return await this.enablePaymentCheckbox.isDisabled();
  }

  /**
   * Toggle payment enabled state
   */
  async togglePayment(): Promise<void> {
    await this.enablePaymentCheckbox.click();
    // Playwright auto-waits for click actions
  }

  // ========== Configure Pricing Methods ==========

  /**
   * Verify configure pricing section is visible
   */
  async verifyConfigurePricingSectionVisible(): Promise<void> {
    await expect(this.configurePricingHeading).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click configure pricing tab
   */
  async clickConfigurePricing(): Promise<void> {
    await this.configurePricingTab.click();
    // Wait for pricing configuration panel to be visible
    await this.page.waitForSelector('.tab-pane.active', { timeout: 5000 }).catch(() => {});
  }

  /**
   * Get current currency
   */
  async getCurrentCurrency(): Promise<string> {
    const text = await this.currencyHeading.textContent();
    return text?.trim() || "";
  }

  // ========== Cancellation & Refund Methods ==========

  /**
   * Check if cancellation and refund is enabled
   */
  async isCancellationRefundEnabled(): Promise<boolean> {
    return await this.cancellationRefundCheckbox.isChecked();
  }

  /**
   * Check if cancellation checkbox is disabled
   */
  async isCancellationCheckboxDisabled(): Promise<boolean> {
    return await this.cancellationRefundCheckbox.isDisabled();
  }

  /**
   * Toggle cancellation and refund enabled state
   */
  async toggleCancellationRefund(): Promise<void> {
    await this.cancellationRefundCheckbox.click();
    // Animation wait removed - element changes are observable
  }

  /**
   * Verify cancellation section is visible
   */
  async verifyCancellationSectionVisible(): Promise<void> {
    await expect(this.cancellationRefundHeading).toBeVisible({ timeout: 5000 });
    await expect(this.cancellationRefundDescription).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify all sections require payout setup message is shown
   */
  async verifyPayoutSetupRequiredMessages(): Promise<void> {
    await expect(this.page.getByText(/Please complete Payout Account Setup/)).toBeVisible({ timeout: 5000 });
  }
}
