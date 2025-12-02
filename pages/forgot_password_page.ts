import { Page, Locator, expect } from "@playwright/test";

export class ForgotPasswordPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly submitButton: Locator;
  readonly emailError: Locator;
  readonly backToLoginLink: Locator;
  readonly heading: Locator;
  readonly subText: Locator;
  readonly resetForm: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emailInput = page.locator("#rec_email");
    this.submitButton = page.locator("#submit-reset-password");
    this.emailError = page.locator('[data-error="rec_email"]');
    this.backToLoginLink = page.locator("a.back-to-login");
    this.heading = page.locator("h3.text-center.pt-4");
    this.subText = page.locator("p.sub-text");
    this.resetForm = page.locator("#frm_reset_password");
  }

  /**
   * Navigate to the forgot password page
   */
  async goto(baseUrl: string) {
    await this.page.goto(`${baseUrl}/recover-account`);
  }

  /**
   * Submit the forgot password form
   */
  async recoverAccount(email: string) {
    await this.emailInput.fill(email);
    await this.submitButton.click();
  }

  /**
   * Get error message for email field
   */
  async getEmailError(): Promise<string> {
    return (await this.emailError.textContent())?.trim() || "";
  }

  /**
   * Click "Back to Login" link
   */
  async clickBackToLogin() {
    await this.backToLoginLink.click();
  }

  /**
   * Verify forgot password page elements are displayed
   */
  async verifyForgotPasswordPageElements() {
    await Promise.all([
      expect(this.heading).toBeVisible(),
      expect(this.subText).toBeVisible(),
      expect(this.emailInput).toBeVisible(),
      expect(this.submitButton).toBeVisible(),
      expect(this.backToLoginLink).toBeVisible(),
      expect(this.resetForm).toBeVisible(),
    ]);
  }
}
