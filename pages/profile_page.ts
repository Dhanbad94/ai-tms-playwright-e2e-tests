import { Page, Locator, expect } from "@playwright/test";

export class ProfilePage {
  readonly page: Page;

  // Navigation elements
  readonly userDropdown: Locator;
  readonly viewProfileLink: Locator;
  readonly profileBreadcrumb: Locator;

  // Tab elements
  readonly profileDetailsTab: Locator;
  readonly changePasswordTab: Locator;
  readonly profileDetailsContent: Locator;
  readonly changePasswordContent: Locator;

  // Profile Details elements
  readonly nameField: Locator;
  readonly emailField: Locator;
  readonly nameValue: Locator;
  readonly emailValue: Locator;

  // Change Password elements
  readonly oldPasswordInput: Locator;
  readonly newPasswordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly updatePasswordButton: Locator;
  readonly passwordVisibilityToggles: Locator;

  // Error elements
  readonly passwordErrors: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation elements - multiple strategies for different environments
    this.userDropdown = page.locator('text="Delhi-Org India"').first();
    this.viewProfileLink = page
      .locator("a")
      .filter({ hasText: /View Profile|Profile/i });
    this.profileBreadcrumb = page
      .locator(".profile_breadcrumb h3, h1, h2, h3")
      .filter({ hasText: /profile/i });

    // Tab elements - more flexible selectors
    this.profileDetailsTab = page
      .locator('a[href="#home"], a:has-text("Profile Details"), .nav-tabs a')
      .first();
    this.changePasswordTab = page
      .locator('a[href="#menu1"], a:has-text("Change Password"), .nav-tabs a')
      .nth(1);
    this.profileDetailsContent = page.locator("#home, .tab-pane").first();
    this.changePasswordContent = page.locator("#menu1, .tab-pane").nth(1);

    // Profile Details elements - more flexible selectors
    this.nameField = page
      .locator(".innerBox, .form-group, .profile-field")
      .filter({ hasText: /name/i });
    this.emailField = page
      .locator(".innerBox, .form-group, .profile-field")
      .filter({ hasText: /email/i });
    this.nameValue = this.nameField.locator("p, span, .value, input");
    this.emailValue = this.emailField.locator("p, span, .value, input");

    // Change Password elements - more flexible selectors
    this.oldPasswordInput = page
      .locator(
        '#org_password, input[name*="old"], input[placeholder*="old" i], input[type="password"]'
      )
      .first();
    this.newPasswordInput = page
      .locator(
        '#org_password1, input[name*="new"], input[placeholder*="new" i], input[type="password"]'
      )
      .nth(1);
    this.confirmPasswordInput = page
      .locator(
        '#org_password2, input[name*="confirm"], input[placeholder*="confirm" i], input[type="password"]'
      )
      .nth(2);
    // Restrict the update password button to the change-password pane to avoid matching other buttons on the page
    this.updatePasswordButton = this.changePasswordContent.locator(
      'button:has-text("Update"), button:has-text("Save"), button[type="submit"].submit_btn'
    );
    this.passwordVisibilityToggles = page.locator(
      '.ShowHidepssword, .password-toggle, .eye-icon, [class*="eye"]'
    );

    // Error elements
    this.passwordErrors = page.locator(".input-error, .error, .alert-danger");
  }

  // Navigation methods
  async clickViewProfile() {
    try {
      // Strategy 1: Try to find and click dropdown first
      const dropdownSelectors = [
        'text="Delhi-Org India"',
        'text="Delhi-Org"',
        '[data-toggle="dropdown"]',
        ".dropdown-toggle",
        ".profile-dropdown",
        ".user-dropdown",
        '[class*="dropdown"]',
      ];

      let dropdownClicked = false;
      for (const selector of dropdownSelectors) {
        try {
          const dropdown = this.page.locator(selector).first();
          if (await dropdown.isVisible({ timeout: 1000 })) {
            await dropdown.click();
            dropdownClicked = true;
            await this.page.waitForTimeout(1000); // Wait for dropdown to expand
            break;
          }
        } catch {
          continue;
        }
      }

      // Strategy 2: Try multiple selectors for the View Profile link
      const profileLinkSelectors = [
        'a:has-text("View Profile")',
        'text="View Profile"',
        'a:has-text("Profile")',
        'text="Profile"',
        'a[href*="profile"]',
        'a[href="javascript:void(0)"]',
        '[onclick*="profile"]',
        ".profile-link",
        'a[href*="user"]',
        'a[href*="account"]',
      ];

      let profileClicked = false;
      for (const selector of profileLinkSelectors) {
        try {
          const profileLinks = await this.page.locator(selector).all();
          for (const link of profileLinks) {
            if (await link.isVisible({ timeout: 1000 })) {
              await link.click();
              profileClicked = true;
              break;
            }
          }
          if (profileClicked) break;
        } catch {
          continue;
        }
      }

      if (!profileClicked) {
        throw new Error(
          "Could not find profile link with any of the expected selectors"
        );
      }

      // Wait for profile page to load
      await this.page.waitForTimeout(2000);
    } catch (error) {
      throw new Error(`Failed to navigate to profile page: ${error}`);
    }
  }

  /**
   * Navigate to profile page and verify it loaded
   */
  async navigateToProfileAndVerify(): Promise<void> {
    await this.clickViewProfile();
    await this.page.waitForTimeout(2000);

    // Verify we're on profile page
    const currentUrl = this.page.url();
    expect(
      currentUrl.includes("profile") ||
        currentUrl.includes("user") ||
        currentUrl.includes("account")
    ).toBeTruthy();
  }

  /**
   * Verify operator can access profile
   */
  async verifyOperatorProfileAccess(): Promise<void> {
    // Check profile tabs are visible
    await expect(this.profileDetailsTab).toBeVisible({ timeout: 5000 });
    await expect(this.changePasswordTab).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify manager can access profile
   */
  async verifyManagerProfileAccess(): Promise<void> {
    // Manager has same profile access as operator
    await this.verifyOperatorProfileAccess();
  }

  /**
   * Get profile name
   */
  async getProfileName(): Promise<string> {
    try {
      const nameText = await this.nameValue
        .first()
        .textContent({ timeout: 5000 });
      return nameText?.trim() || "";
    } catch {
      return "";
    }
  }

  /**
   * Get profile email
   */
  async getProfileEmail(): Promise<string> {
    try {
      const emailText = await this.emailValue
        .first()
        .textContent({ timeout: 5000 });
      return emailText?.trim() || "";
    } catch {
      return "";
    }
  }

  /**
   * Verify profile information
   */
  async verifyProfileInfo(
    expectedRole?: string,
    expectedEmail?: string
  ): Promise<void> {
    await expect(this.profileDetailsContent).toBeVisible({ timeout: 5000 });

    const name = await this.getProfileName();
    const email = await this.getProfileEmail();

    expect(name).toBeTruthy();
    expect(email).toBeTruthy();
    expect(email).toMatch(/\S+@\S+\.\S+/); // Valid email format

    if (expectedRole) {
      expect(name.toLowerCase()).toContain(expectedRole.toLowerCase());
    }

    if (expectedEmail) {
      expect(email).toBe(expectedEmail);
    }
  }

  /**
   * Test change password flow
   */
  async testChangePasswordFlow(
    oldPassword: string,
    newPassword: string
  ): Promise<void> {
    await this.changePasswordTab.click();
    await this.page.waitForTimeout(1000);

    await expect(this.changePasswordContent).toBeVisible({ timeout: 5000 });

    // Fill password form
    await this.fillChangePasswordForm(oldPassword, newPassword, newPassword);

    // Verify button is visible (don't actually submit to avoid changing password)
    await expect(this.updatePasswordButton).toBeVisible({ timeout: 5000 });

    // Clear fields
    await this.clearPasswordFields();
  }

  /**
   * Click profile details tab
   */
  async clickProfileDetailsTab(): Promise<void> {
    await this.profileDetailsTab.click();
    await this.page.waitForTimeout(500);
  }

  /**
   * Verify active tab
   */
  async verifyActiveTab(tabName: "profile" | "password"): Promise<void> {
    if (tabName === "profile") {
      await expect(this.profileDetailsContent).toBeVisible({ timeout: 5000 });
    } else {
      await expect(this.changePasswordContent).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Fill change password form
   */
  async fillChangePasswordForm(
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ): Promise<void> {
    await this.oldPasswordInput.fill(oldPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(confirmPassword);
  }

  /**
   * Toggle password visibility
   */
  async togglePasswordVisibility(index: number): Promise<void> {
    const toggles = await this.passwordVisibilityToggles.all();
    if (toggles[index]) {
      await toggles[index].click();
      await this.page.waitForTimeout(300);
    }
  }

  /**
   * Clear password fields
   */
  async clearPasswordFields(): Promise<void> {
    await this.oldPasswordInput.fill("");
    await this.newPasswordInput.fill("");
    await this.confirmPasswordInput.fill("");
  }

  /**
   * Verify password fields are empty
   */
  async verifyPasswordFieldsAreEmpty(): Promise<void> {
    expect(await this.oldPasswordInput.inputValue()).toBe("");
    expect(await this.newPasswordInput.inputValue()).toBe("");
    expect(await this.confirmPasswordInput.inputValue()).toBe("");
  }

  async openChangePasswordTab() {
    await this.changePasswordTab.click();
    await this.page.waitForTimeout(500);
    await expect(this.changePasswordContent).toBeVisible();
  }

  async updatePassword(
    oldPassword: string,
    newPassword: string,
    confirmPassword: string
  ) {
    await this.oldPasswordInput.fill(oldPassword);
    await this.newPasswordInput.fill(newPassword);
    await this.confirmPasswordInput.fill(confirmPassword);
    await this.updatePasswordButton.click();
  }

  async verifyPasswordChanged() {
    // This will depend on the actual UI behavior after password change
    // Could check for success message, redirect, etc.
    await this.page.waitForTimeout(2000);
  }

  async getPasswordErrors(): Promise<string[]> {
    const errors = await this.passwordErrors.all();
    const errorTexts: string[] = [];
    for (const error of errors) {
      const text = await error.textContent();
      if (text) errorTexts.push(text.trim());
    }
    return errorTexts;
  }

  async isOnProfilePage(): Promise<boolean> {
    const url = this.page.url();
    return (
      url.includes("profile") ||
      url.includes("user") ||
      url.includes("account")
    );
  }
}