import { Page, Locator, expect } from "@playwright/test";

export class LoginPage {
  readonly page: Page;
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly rememberMeCheckbox: Locator;
  readonly activateAccountLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly logo: Locator;
  readonly phoneNumber: Locator;
  readonly loginHeading: Locator;
  readonly passwordToggle: Locator;
  readonly loginForm: Locator;

  constructor(page: Page) {
    this.page = page;

    // Playwright Best Practice Locators - Prioritizing user-facing attributes

    // 1. Use getByRole for semantic elements (BEST)
    this.loginButton = page.getByRole("button", { name: "GO" });
    this.rememberMeCheckbox = page.getByRole("checkbox", {
      name: "Remember me",
    });
    this.activateAccountLink = page.getByRole("link", {
      name: "Activate Account",
    });
    this.forgotPasswordLink = page.getByRole("link", {
      name: "Forgot Password?",
    });
    this.phoneNumber = page.getByRole("link", { name: "+1-888-574-8885" });

    // 2. Use robust CSS selectors for form inputs
    this.emailInput = page.locator("#login_email");
    this.passwordInput = page.locator("#login_pass");
    this.loginForm = page.locator("#frm_login");

    // 3. Fix the heading locator - use multiple strategies
    // Try different approaches to locate the heading
    this.loginHeading = page.locator('h3:has-text("Login")').first();
    // Alternative selectors if needed:
    // this.loginHeading = page.locator('.heading h3');
    // this.loginHeading = page.getByText('Login', { exact: true });

    // 4. Use getByAltText for images (improved with better selector)
    this.logo = page.locator("img").first(); // More specific than getByAltText('')

    // 5. Fallback to CSS selectors only when necessary
    this.passwordToggle = page.locator(".pass-show-hide");
  }

  /**
   * Navigate to the login page
   */
  async goto() {
    const response = await this.page.goto(
      "https://staging.trackmyshuttle.com/login",
      {
        waitUntil: "domcontentloaded", // Don't wait for all network requests
        timeout: 30000,
      }
    );

    // Check if we got redirected
    // navigation details intentionally suppressed to reduce noise

    // Wait for critical elements instead of network idle
    await this.waitForPageLoad();
  }

  /**
   * Wait for login page elements to be visible with timeout
   */
  async waitForPageLoad() {
    try {
      // Wait for the page to be in a stable state
      await this.page.waitForLoadState("domcontentloaded");

      // Debug: Check what's on the page
      const pageContent = await this.page.content();
      const hasLoginForm = pageContent.includes("frm_login");

      // Try multiple selectors for the form
      const formSelectors = [
        "#frm_login",
        'form[name="email-form"]',
        'form[action*="login"]',
        ".loginForm form",
        "form",
      ];

      let formFound = false;
      for (const selector of formSelectors) {
        try {
          const form = this.page.locator(selector).first();
          await form.waitFor({ state: "attached", timeout: 2000 });
          formFound = true;
          break;
          } catch (e) {
          // form selector not found — suppressed informational output
        }
      }

      if (!formFound) {
        throw new Error("Login form not found with any selector");
      }

      // Then wait for critical elements to be visible
      await Promise.all([
        this.emailInput.waitFor({ state: "visible", timeout: 10000 }),
        this.passwordInput.waitFor({ state: "visible", timeout: 10000 }),
        this.loginButton.waitFor({ state: "visible", timeout: 10000 }),
      ]);

      // Small delay to ensure page is stable
      await this.page.waitForTimeout(500);

      // Wait for page to be stable by checking network idle
      await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {
        // Network idle timeout is acceptable, continue with element checks
      });

      // Check if heading is visible (but don't fail if it's not immediately visible)
      try {
        await this.loginHeading.waitFor({ state: "visible", timeout: 2000 });
      } catch (e) {
        // Login heading not immediately visible — continue silently
      }
    } catch (error) {
      console.error("Error waiting for page load:", error);
      // Take a screenshot for debugging
      await this.page.screenshot({ path: "login-page-error.png" });
      throw error;
    }
  }

  /**
   * Perform login with email and password
   * @param email - User email or organization ID
   * @param password - User password
   * @param rememberMe - Whether to check remember me checkbox
   */
  async login(email: string, password: string, rememberMe: boolean = false) {
    // Ensure we are on the login page before interacting
    if (!(await this.isOnLoginPage())) {
      await this.goto();
    }

    // Wait for email and password inputs to be visible
    await this.emailInput.waitFor({ state: "visible", timeout: 10000 });
    await this.passwordInput.waitFor({ state: "visible", timeout: 10000 });

    // Clear and fill email
    await this.emailInput.clear();
    await this.emailInput.fill(email ?? "");

    // Clear and fill password
    await this.passwordInput.clear();
    await this.passwordInput.fill(password ?? "");

    // Handle remember me checkbox
    if (rememberMe) {
      await this.rememberMeCheckbox.check();
    } else {
      await this.rememberMeCheckbox.uncheck();
    }

    // Click login button
    await this.loginButton.click();
  }

  /**
   * Click on activate account link
   */
  async clickActivateAccount() {
    await this.activateAccountLink.click();
  }

  /**
   * Click on forgot password link
   */
  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility() {
    await this.passwordToggle.click();
  }

  /**
   * Get the current email input value
   */
  async getEmailValue(): Promise<string> {
    return await this.emailInput.inputValue();
  }

  /**
   * Get the current password input value
   */
  async getPasswordValue(): Promise<string> {
    return await this.passwordInput.inputValue();
  }

  /**
   * Check if remember me checkbox is checked
   */
  async isRememberMeChecked(): Promise<boolean> {
    return await this.rememberMeCheckbox.isChecked();
  }

  /**
   * Verify login page elements are displayed
   */
  async verifyLoginPageElements() {
    // Wait for the form to be present first
    await this.loginForm.waitFor({ state: "visible", timeout: 10000 });

    // Check each element individually with proper error handling
    const elementsToCheck = [
      { element: this.logo, name: "Logo" },
      { element: this.phoneNumber, name: "Phone Number" },
      { element: this.loginHeading, name: "Login Heading" },
      { element: this.emailInput, name: "Email Input" },
      { element: this.passwordInput, name: "Password Input" },
      { element: this.loginButton, name: "Login Button" },
      { element: this.rememberMeCheckbox, name: "Remember Me Checkbox" },
      { element: this.activateAccountLink, name: "Activate Account Link" },
      { element: this.forgotPasswordLink, name: "Forgot Password Link" },
    ];

    for (const { element, name } of elementsToCheck) {
      try {
        await expect(element).toBeVisible({ timeout: 5000 });
      } catch (error) {
        console.error(`Element ${name} is not visible:`, error);
        throw new Error(`${name} is not visible on the login page`);
      }
    }
  }

  /**
   * Wait for login button to be enabled
   */
  async waitForLoginButtonEnabled() {
    await expect(this.loginButton).toBeEnabled({ timeout: 5000 });
  }

  /**
   * Get error message for a specific field
   * @param fieldName - The field name (login_email or login_pass)
   */
  async getErrorMessage(fieldName: string): Promise<string> {
    try {
      // Multiple possible error selectors - using traditional for loop
      const errorSelectors: string[] = [
        `[data-error="${fieldName}"]`,
        `.error-message[data-field="${fieldName}"]`,
        `#${fieldName}_error`,
        `.field-error.${fieldName}`,
        `[data-testid="${fieldName}-error"]`,
        `.input-error`, // Based on the HTML structure
      ];

      // Using traditional for loop instead of for...of for Jenkins compatibility
      for (let i = 0; i < errorSelectors.length; i++) {
        const selector = errorSelectors[i];

        // Type guard to ensure selector is defined
        if (selector && typeof selector === "string") {
          const errorElement = this.page.locator(selector);

          try {
            const isVisible = await errorElement.isVisible({ timeout: 1000 });
            if (isVisible) {
              const text = await errorElement.textContent();
              if (text && text.trim()) {
                return text.trim();
              }
            }
          } catch (selectorError) {
            // Continue to next selector if this one fails
            continue;
          }
        }
      }

      return "";
    } catch (error) {
      console.warn(
        "Could not find error message for field: " + fieldName,
        error
      );
      return "";
    }
  }

  /**
   * Check if login form is submitted (form action occurs)
   */
  async isFormSubmitted(): Promise<boolean> {
    try {
      // Wait for either navigation or form submission
      await Promise.race([
        this.page.waitForNavigation({ timeout: 5000 }),
        this.page.waitForResponse(
          function (response) {
            return (
              response.url().includes("/login") &&
              response.request().method() === "POST"
            );
          },
          { timeout: 5000 }
        ),
      ]);
      return true;
    } catch (submitError) {
      return false;
    }
  }

  /**
   * Clear all form fields
   */
  async clearForm() {
    await this.emailInput.clear();
    await this.passwordInput.clear();
    await this.rememberMeCheckbox.uncheck();
  }

  /**
   * Check if currently on login page
   */
  async isOnLoginPage(): Promise<boolean> {
    try {
      const url = this.page.url();
      // Check URL and try to find any form element
      if (!url.includes("/login")) {
        return false;
      }

      // Try multiple ways to detect the login form
      const formSelectors = [
        "#frm_login",
        'form[name="email-form"]',
        "#login_email",
        '[name="submit_login"]',
      ];

      for (const selector of formSelectors) {
        const element = this.page.locator(selector).first();
        if (await element.isVisible({ timeout: 1000 }).catch(() => false)) {
          return true;
        }
      }

      return false;
    } catch (error) {
      console.error("Error checking if on login page:", error);
      return false;
    }
  }
}
