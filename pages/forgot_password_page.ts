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
    // Prefer user-facing locators (role/label/text) per Playwright best practices;
    // fall back to stable ids/data-attributes only where no accessible handle exists.
    this.emailInput = page.getByPlaceholder(/email address/i);
    this.submitButton = page.getByRole("button", { name: /recover account/i });
    this.emailError = page.locator('[data-error="rec_email"]');
    this.backToLoginLink = page.getByRole("link", { name: /back to login/i });
    this.heading = page.getByRole("heading", { name: /forgot password/i });
    this.subText = page.getByText(/enter email address for recovery instructions/i);
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
   * Get the inline validation error for the email field.
   * The error span starts empty/hidden and only becomes visible (class
   * `input-error active`) once client-side validation fails, so wait for it.
   * Only call this on the recover-account form itself — a valid submit
   * navigates to /reset-link-sent where this span does not exist.
   */
  async getEmailError(): Promise<string> {
    await this.emailError.waitFor({ state: "visible", timeout: 10000 });
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
