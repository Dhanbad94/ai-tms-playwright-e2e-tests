import { Page, Locator, expect } from "@playwright/test";

/**
 * Escalations Settings Page Object
 * Settings Tab: Escalations
 * URL Hash: #escaltionSettings
 */
export class EscalationsSettingsPage {
  readonly page: Page;

  // Page Heading
  readonly pageHeading: Locator;
  readonly pageDescription: Locator;

  // Ride Request Not Addressed Section
  readonly rideRequestNotAddressedCheckbox: Locator;
  readonly rideRequestNotAddressedLabel: Locator;
  readonly rideRequestSeeExampleLink: Locator;

  // Trip Not Started Section
  readonly tripNotStartedCheckbox: Locator;
  readonly tripNotStartedLabel: Locator;
  readonly tripNotStartedSeeExampleLink: Locator;

  // Escalation Configuration Elements
  readonly addMoreButtons: Locator;
  readonly afterMinutesInputs: Locator;
  readonly selectActionDropdowns: Locator;
  readonly toUserDropdowns: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page Heading
    this.pageHeading = page.getByRole("heading", { name: "Escalation Settings", level: 2 });
    this.pageDescription = page.getByText("Set up sequence of notifications when ride requests remain open beyond acceptable wait time.");

    // Ride Request Not Addressed Section - paragraph text next to checkbox
    this.rideRequestNotAddressedLabel = page.getByText("Notify when Ride Request is not addressed by Driver on time");
    // The checkbox is a sibling to the paragraph, both in the same container
    this.rideRequestNotAddressedCheckbox = page.locator("p:has-text('Notify when Ride Request is not addressed')").locator("..").getByRole("checkbox");
    this.rideRequestSeeExampleLink = page.getByText("See Example").first();

    // Trip Not Started Section
    this.tripNotStartedLabel = page.getByText("Notify when Trip not started by Driver");
    this.tripNotStartedCheckbox = page.locator("p:has-text('Notify when Trip not started')").locator("..").getByRole("checkbox");
    this.tripNotStartedSeeExampleLink = page.getByText("See Example").nth(1);

    // Escalation Configuration Elements
    this.addMoreButtons = page.getByText("+ Add More");
    this.afterMinutesInputs = page.getByRole("textbox").filter({ has: page.locator("..").filter({ hasText: "mins" }) });
    this.selectActionDropdowns = page.locator("text=Call/SMS/Email");
    this.toUserDropdowns = page.getByRole("listbox");
  }

  /**
   * Verify escalations settings page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
    await expect(this.pageDescription).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify page content is visible
   */
  async verifyPageContent(): Promise<void> {
    await expect(this.rideRequestNotAddressedLabel).toBeVisible({ timeout: 5000 });
    await expect(this.tripNotStartedLabel).toBeVisible({ timeout: 5000 });
  }

  // ========== Ride Request Not Addressed Methods ==========

  /**
   * Check if ride request not addressed notification is enabled
   */
  async isRideRequestNotAddressedEnabled(): Promise<boolean> {
    const section = this.page.locator("text=Notify when Ride Request is not addressed by Driver on time").locator("..");
    const checkbox = section.getByRole("checkbox");
    return await checkbox.isChecked();
  }

  /**
   * Toggle ride request not addressed notification
   */
  async toggleRideRequestNotAddressed(): Promise<void> {
    const section = this.page.locator("text=Notify when Ride Request is not addressed by Driver on time").locator("..");
    const checkbox = section.getByRole("checkbox");
    await checkbox.click();
  }

  /**
   * Click see example for ride request escalation
   */
  async clickRideRequestSeeExample(): Promise<void> {
    await this.rideRequestSeeExampleLink.click();
    // Wait for element update
  }

  // ========== Trip Not Started Methods ==========

  /**
   * Check if trip not started notification is enabled
   */
  async isTripNotStartedEnabled(): Promise<boolean> {
    const section = this.page.locator("text=Notify when Trip not started by Driver").locator("..");
    const checkbox = section.getByRole("checkbox");
    return await checkbox.isChecked();
  }

  /**
   * Toggle trip not started notification
   */
  async toggleTripNotStarted(): Promise<void> {
    const section = this.page.locator("text=Notify when Trip not started by Driver").locator("..");
    const checkbox = section.getByRole("checkbox");
    await checkbox.click();
    // Animation wait removed - element changes are observable
  }

  /**
   * Click see example for trip not started escalation
   */
  async clickTripNotStartedSeeExample(): Promise<void> {
    await this.tripNotStartedSeeExampleLink.click();
    // Wait for element update
  }

  // ========== Escalation Configuration Methods ==========

  /**
   * Get escalation rule configuration
   * @param ruleIndex - Index of the rule (0-based)
   * @param sectionType - Type of escalation section
   */
  async getEscalationRuleConfig(
    ruleIndex: number,
    sectionType: "rideRequest" | "tripNotStarted"
  ): Promise<{ minutes: string; action: string; toUser: string }> {
    const sectionText = sectionType === "rideRequest"
      ? "Notify when Ride Request is not addressed by Driver on time"
      : "Notify when Trip not started by Driver";

    const section = this.page.locator(`text="${sectionText}"`).locator("..").locator("..");
    const ruleRow = section.locator("text=After").nth(ruleIndex).locator("..");

    const minutesInput = ruleRow.getByRole("textbox");
    const minutes = await minutesInput.inputValue();

    // These would need more specific selectors based on actual DOM structure
    return {
      minutes,
      action: "Call/SMS/Email", // Default action
      toUser: "",
    };
  }

  /**
   * Click Add More button for escalation section
   * @param sectionType - Type of escalation section
   */
  async clickAddMoreRule(sectionType: "rideRequest" | "tripNotStarted"): Promise<void> {
    const sectionText = sectionType === "rideRequest"
      ? "Notify when Ride Request is not addressed by Driver on time"
      : "Notify when Trip not started by Driver";

    const section = this.page.locator(`text="${sectionText}"`).locator("..").locator("..").locator("..");
    const addMoreButton = section.getByText("+ Add More");
    await addMoreButton.click();
    // Animation wait removed - element changes are observable
  }

  /**
   * Get available users in dropdown
   */
  async getAvailableUsers(): Promise<string[]> {
    const options = await this.page.getByRole("option").all();
    const users: string[] = [];
    for (const option of options) {
      const text = await option.textContent();
      if (text) {
        users.push(text.trim());
      }
    }
    return users;
  }

  /**
   * Verify escalation configuration UI elements are visible
   * The escalation config has columns: After, Select Action, To
   * Using locator that targets visible elements in the configuration section
   */
  async verifyEscalationConfigVisible(): Promise<void> {
    // Look for "After" text that's visible (not hidden tooltip)
    const afterLabel = this.page.locator("div").filter({ hasText: /^After$/ }).first();
    await expect(afterLabel).toBeVisible({ timeout: 5000 });

    const selectActionLabel = this.page.locator("div").filter({ hasText: /^Select Action$/ }).first();
    await expect(selectActionLabel).toBeVisible({ timeout: 5000 });

    // "To" appears multiple times, use specific filter
    const toLabel = this.page.locator("div").filter({ hasText: /^To$/ }).first();
    await expect(toLabel).toBeVisible({ timeout: 5000 });
  }
}
