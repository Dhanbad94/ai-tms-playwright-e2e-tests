import { Page, Locator, expect } from "@playwright/test";

export class ActivateAccountPage {
  readonly page: Page;
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly activationCodeInput: Locator;
  readonly passwordInput: Locator;
  readonly activateButton: Locator;
  readonly termsCheckbox: Locator;
  readonly backToLoginLink: Locator;
  readonly activateHeading: Locator;
  readonly logo: Locator;
  readonly phoneNumber: Locator;
  readonly activateForm: Locator;
  readonly passwordToggle: Locator;
  readonly countrySelector: Locator;
  readonly privacyPolicyLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Direct ID-based locators
    this.firstNameInput = page.locator("#user_first_name");
    this.lastNameInput = page.locator("#user_last_name");
    this.emailInput = page.locator("#register_Email");
    this.phoneInput = page.locator("#org_phone");
    this.activationCodeInput = page.locator("#org_code");
    this.passwordInput = page.locator("#register_password");

    // Buttons and checkboxes
    this.activateButton = page.getByRole("button", {
      name: "Activate Account",
    });
    this.termsCheckbox = page.locator("#exampleCheck1");

    // Links
    this.backToLoginLink = page.getByRole("link", { name: /Back to Login/i });
    this.privacyPolicyLink = page.getByRole("link", {
      name: /Privacy Policy/i,
    });

    // Page elements
    this.activateHeading = page.getByRole("heading", {
      name: /Activate Account/i,
    });
    this.logo = page.locator(".logo img");
    this.phoneNumber = page.getByRole("link", { name: /\+1-888-574-8885/ });
    this.activateForm = page.locator("form#activate");
    this.passwordToggle = page.locator(".pass-show-hide");
    this.countrySelector = page.locator(".selected-flag");
  }

  async goto(): Promise<void> {
    await this.page.goto("https://staging.trackmyshuttle.com/activate");
    await this.waitForPageLoad();
  }

  async waitForPageLoad(): Promise<void> {
    await expect(this.page).toHaveURL(/\/activate/);
    await expect(this.activateHeading).toBeVisible({ timeout: 10000 });
    await expect(this.firstNameInput).toBeVisible({ timeout: 10000 });
    await expect(this.activateButton).toBeVisible({ timeout: 10000 });
  }

  async fillFirstName(firstName: string): Promise<void> {
    await this.firstNameInput.fill(firstName);
  }

  async fillLastName(lastName: string): Promise<void> {
    await this.lastNameInput.fill(lastName);
  }

  async fillEmail(email: string): Promise<void> {
    await this.emailInput.fill(email);
  }

  async fillPhone(phone: string): Promise<void> {
    await this.phoneInput.fill(phone);
  }

  async fillActivationCode(code: string): Promise<void> {
    await this.activationCodeInput.fill(code);
  }

  async fillPassword(password: string): Promise<void> {
    await this.passwordInput.fill(password);
  }

  async acceptTerms(accept: boolean = true): Promise<void> {
    if (accept) {
      await this.termsCheckbox.check();
    } else {
      await this.termsCheckbox.uncheck();
    }
  }

  async submitActivation(): Promise<void> {
    await this.activateButton.click();
  }

  async clickBackToLogin(): Promise<void> {
    await this.backToLoginLink.click();
  }

  async togglePasswordVisibility(): Promise<void> {
    await this.passwordToggle.click();
  }

  async verifyActivateAccountPageElements(): Promise<void> {
    await expect(this.logo).toBeVisible();
    await expect(this.phoneNumber).toBeVisible();
    await expect(this.activateHeading).toBeVisible();
    await expect(this.firstNameInput).toBeVisible();
    await expect(this.lastNameInput).toBeVisible();
    await expect(this.emailInput).toBeVisible();
    await expect(this.phoneInput).toBeVisible();
    await expect(this.activationCodeInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
    await expect(this.activateButton).toBeVisible();
    await expect(this.termsCheckbox).toBeVisible();
    await expect(this.backToLoginLink).toBeVisible();
    await expect(this.privacyPolicyLink).toBeVisible();
  }

  async isOnActivateAccountPage(): Promise<boolean> {
    return (
      this.page.url().includes("/activate") &&
      (await this.activateHeading.isVisible())
    );
  }

  async getErrorMessage(fieldName: string): Promise<string> {
    const errorSelectors = [
      `[data-error="${fieldName}"]`,
      `.error-message[data-field="${fieldName}"]`,
      `#${fieldName}_error`,
      `.field-error.${fieldName}`,
      `[data-testid="${fieldName}-error"]`,
    ];

    for (const selector of errorSelectors) {
      const errorElement = this.page.locator(selector);
      try {
        if (await errorElement.isVisible({ timeout: 1000 })) {
          const text = await errorElement.textContent();
          if (text && text.trim()) return text.trim();
        }
      } catch {
        continue;
      }
    }
    return "";
  }

  async isActivateButtonEnabled(): Promise<boolean> {
    return await this.activateButton.isEnabled();
  }

  async clearForm(): Promise<void> {
    await this.firstNameInput.fill("");
    await this.lastNameInput.fill("");
    await this.emailInput.fill("");
    await this.phoneInput.fill("");
    await this.activationCodeInput.fill("");
    await this.passwordInput.fill("");
    await this.termsCheckbox.uncheck();
  }
}
