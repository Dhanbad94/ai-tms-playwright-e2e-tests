import { Page, Locator, expect } from "@playwright/test";

/**
 * Live Display Settings Page Object
 * Settings Tab: Live display
 * URL Hash: #live_display
 */
export class LiveDisplaySettingsPage {
  readonly page: Page;

  // Page Heading
  readonly pageHeading: Locator;

  // Section Heading
  readonly sectionHeading: Locator;
  readonly sectionDescription: Locator;

  // Warning Message
  readonly warningIcon: Locator;
  readonly warningMessage: Locator;

  // Create Button
  readonly createLiveDisplayButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page Heading
    this.pageHeading = page.getByRole("heading", { name: "Live Display Settings", level: 2 });

    // Section Content
    this.sectionHeading = page.getByRole("heading", { name: "Stop & Device Specific Live Displays", level: 3 });
    this.sectionDescription = page.getByText("Create live display links that can be used on screens at specific stops.");

    // Warning Message
    this.warningIcon = page.getByRole("img", { name: "Warning:" });
    this.warningMessage = page.getByText(/Live Display may not be compatible with select internet browsers/);

    // Create Button
    this.createLiveDisplayButton = page.getByRole("button", { name: "+ Create Live Display Links" });
  }

  /**
   * Verify live display settings page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify page content is visible
   */
  async verifyPageContent(): Promise<void> {
    await expect(this.sectionHeading).toBeVisible({ timeout: 5000 });
    await expect(this.sectionDescription).toBeVisible({ timeout: 5000 });
    await expect(this.createLiveDisplayButton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify warning message is displayed
   */
  async verifyWarningMessageVisible(): Promise<void> {
    await expect(this.warningIcon).toBeVisible({ timeout: 5000 });
    await expect(this.warningMessage).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click create live display links button
   */
  async clickCreateLiveDisplayLinks(): Promise<void> {
    await this.createLiveDisplayButton.click();
    // Wait for dialog or form to appear
    await this.page.waitForSelector('.modal, [role="dialog"], form', { timeout: 5000 }).catch(() => {});
  }

  /**
   * Check if create button is enabled
   */
  async isCreateButtonEnabled(): Promise<boolean> {
    return await this.createLiveDisplayButton.isEnabled();
  }

  /**
   * Get warning message text
   */
  async getWarningMessageText(): Promise<string> {
    const text = await this.warningMessage.textContent();
    return text?.trim() || "";
  }
}
