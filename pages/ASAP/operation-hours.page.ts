import { Page, Locator, expect } from "@playwright/test";

/**
 * Operation Hours Page Object
 * Settings Tab: Operation Hours
 * URL Hash: #hours-of-operation
 */
export class OperationHoursPage {
  readonly page: Page;

  // Page Heading
  readonly pageHeading: Locator;

  // Operation Hours Options (Radio buttons)
  readonly run24x7Radio: Locator;
  readonly customHoursRadio: Locator;

  // Option Descriptions
  readonly run24x7Description: Locator;
  readonly customHoursDescription: Locator;

  constructor(page: Page) {
    this.page = page;

    // Heading
    this.pageHeading = page.getByRole("heading", { name: "Operation Hours", level: 2 });

    // Radio Buttons
    this.run24x7Radio = page.getByRole("radio", { name: "Run 24/7" });
    this.customHoursRadio = page.getByRole("radio", { name: "Custom Hours" });

    // Descriptions
    this.run24x7Description = page.getByText("Guests get shuttled 24hrs Everyday.");
    this.customHoursDescription = page.getByText("Guests get shuttled only during specific hours/days.");
  }

  /**
   * Verify operation hours page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify all options are visible
   */
  async verifyAllOptionsVisible(): Promise<void> {
    await expect(this.run24x7Radio).toBeVisible({ timeout: 5000 });
    await expect(this.customHoursRadio).toBeVisible({ timeout: 5000 });
    await expect(this.run24x7Description).toBeVisible({ timeout: 5000 });
    await expect(this.customHoursDescription).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get current operation hours setting
   */
  async getOperationHoursSetting(): Promise<"24x7" | "custom" | null> {
    if (await this.run24x7Radio.isChecked()) return "24x7";
    if (await this.customHoursRadio.isChecked()) return "custom";
    return null;
  }

  /**
   * Verify Run 24/7 is selected
   */
  async verifyRun24x7Selected(): Promise<void> {
    await expect(this.run24x7Radio).toBeChecked();
  }

  /**
   * Verify Custom Hours is selected
   */
  async verifyCustomHoursSelected(): Promise<void> {
    await expect(this.customHoursRadio).toBeChecked();
  }

  /**
   * Select Run 24/7 option
   */
  async selectRun24x7(): Promise<void> {
    await this.run24x7Radio.click();
    // Playwright auto-waits for click actions
  }

  /**
   * Select Custom Hours option
   */
  async selectCustomHours(): Promise<void> {
    await this.customHoursRadio.click();
    // Playwright auto-waits for click actions
  }

  /**
   * Check if Run 24/7 option is disabled
   */
  async isRun24x7Disabled(): Promise<boolean> {
    return await this.run24x7Radio.isDisabled();
  }

  /**
   * Check if Custom Hours option is disabled
   */
  async isCustomHoursDisabled(): Promise<boolean> {
    return await this.customHoursRadio.isDisabled();
  }
}
