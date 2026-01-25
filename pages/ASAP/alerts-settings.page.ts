import { Page, Locator, expect } from "@playwright/test";

/**
 * Alerts Settings Page Object
 * Settings Tab: Alerts
 * URL Hash: #alerts
 */
export class AlertsSettingsPage {
  readonly page: Page;

  // Page Heading
  readonly pageHeading: Locator;

  // User Selection Section
  readonly userSectionHeading: Locator;
  readonly userSearchInput: Locator;
  readonly alreadyAddedLabel: Locator;

  // Alerts Table
  readonly alertsTable: Locator;
  readonly notificationsHeader: Locator;
  readonly getEmailHeader: Locator;
  readonly getSmsHeader: Locator;

  // Geolocation Alert Section
  readonly geolocationHeading: Locator;
  readonly geofenceAlertHeading: Locator;
  readonly geofenceRadiusInput: Locator;
  readonly geofenceEmailCheckbox: Locator;
  readonly geofenceSmsCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page Heading
    this.pageHeading = page.getByRole("heading", { name: "Alert Settings", level: 2 });

    // User Selection Section
    this.userSectionHeading = page.getByRole("heading", { name: "User(s) to be notified", level: 3 });
    this.userSearchInput = page.getByRole("textbox", { name: "Search and Select User" });
    this.alreadyAddedLabel = page.getByText("Already added");

    // Alerts Table
    // Note: Table headers are rendered as cells, not columnheaders in this UI
    this.alertsTable = page.getByRole("table");
    this.notificationsHeader = page.getByRole("cell", { name: "Notifications" });
    this.getEmailHeader = page.getByRole("cell", { name: "Get Email" });
    this.getSmsHeader = page.getByRole("cell", { name: "Get SMS" });

    // Geolocation Alert Section
    this.geolocationHeading = page.getByRole("heading", { name: "Geolocation", level: 3 });
    this.geofenceAlertHeading = page.getByRole("heading", { name: "Geofence Alert", level: 4 });
    this.geofenceRadiusInput = page.getByRole("textbox").filter({ hasText: /\d+/ }).first();
    this.geofenceEmailCheckbox = page.getByRole("row", { name: /Geolocation/ }).getByRole("checkbox").first();
    this.geofenceSmsCheckbox = page.getByRole("row", { name: /Geolocation/ }).getByRole("checkbox").nth(1);
  }

  /**
   * Verify alerts settings page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify page content is visible
   */
  async verifyPageContent(): Promise<void> {
    await expect(this.userSectionHeading).toBeVisible({ timeout: 5000 });
    await expect(this.alertsTable).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify table headers are visible
   */
  async verifyTableHeaders(): Promise<void> {
    // Scroll the table into view first to ensure headers are visible
    await this.alertsTable.scrollIntoViewIfNeeded();

    await expect(this.notificationsHeader).toBeVisible({ timeout: 5000 });
    await expect(this.getEmailHeader).toBeVisible({ timeout: 5000 });
    await expect(this.getSmsHeader).toBeVisible({ timeout: 5000 });
  }

  // ========== User Management Methods ==========

  /**
   * Search and select user to be notified
   */
  async searchUser(userName: string): Promise<void> {
    await this.userSearchInput.fill(userName);
    // Wait for search results to appear
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  }

  /**
   * Get list of already added users
   */
  async getAddedUsers(): Promise<string[]> {
    const addedSection = this.page.locator("text=Already added").locator("..");
    const userElements = await addedSection.locator("text").all();
    const users: string[] = [];
    for (const element of userElements) {
      const text = await element.textContent();
      if (text && text !== "Already added") {
        users.push(text.trim());
      }
    }
    return users;
  }

  /**
   * Remove user from notification list
   */
  async removeUser(userName: string): Promise<void> {
    const userItem = this.page.locator(`text="${userName}"`).locator("..");
    const removeButton = userItem.getByRole("img", { name: "cross" });
    await removeButton.click();
    // Wait for the user item to be removed from DOM
    await this.page.locator(`text="${userName}"`).waitFor({ state: 'hidden', timeout: 5000 }).catch(() => {});
  }

  // ========== Geofence Alert Methods ==========

  /**
   * Get geofence radius value
   */
  async getGeofenceRadius(): Promise<string> {
    const cell = this.page.getByRole("cell").filter({ hasText: "Geofence Alert" });
    const input = cell.getByRole("textbox");
    return await input.inputValue();
  }

  /**
   * Set geofence radius value
   */
  async setGeofenceRadius(radius: string): Promise<void> {
    const cell = this.page.getByRole("cell").filter({ hasText: "Geofence Alert" });
    const input = cell.getByRole("textbox");
    await input.clear();
    await input.fill(radius);
    // Playwright auto-waits for input actions
  }

  /**
   * Check if geofence email alert is enabled
   */
  async isGeofenceEmailEnabled(): Promise<boolean> {
    const row = this.page.getByRole("row").filter({ hasText: "Geolocation" });
    const emailCell = row.getByRole("cell").nth(1);
    const checkbox = emailCell.getByRole("checkbox");
    return await checkbox.isChecked();
  }

  /**
   * Check if geofence SMS alert is enabled
   */
  async isGeofenceSmsEnabled(): Promise<boolean> {
    const row = this.page.getByRole("row").filter({ hasText: "Geolocation" });
    const smsCell = row.getByRole("cell").nth(2);
    const checkbox = smsCell.getByRole("checkbox");
    return await checkbox.isChecked();
  }

  /**
   * Toggle geofence email alert
   */
  async toggleGeofenceEmail(): Promise<void> {
    const row = this.page.getByRole("row").filter({ hasText: "Geolocation" });
    const emailCell = row.getByRole("cell").nth(1);
    const checkbox = emailCell.getByRole("checkbox");
    await checkbox.click();
    // Playwright auto-waits for click actions
  }

  /**
   * Toggle geofence SMS alert
   */
  async toggleGeofenceSms(): Promise<void> {
    const row = this.page.getByRole("row").filter({ hasText: "Geolocation" });
    const smsCell = row.getByRole("cell").nth(2);
    const checkbox = smsCell.getByRole("checkbox");
    await checkbox.click();
    // Playwright auto-waits for click actions
  }

  /**
   * Verify geolocation section is visible
   */
  async verifyGeolocationSectionVisible(): Promise<void> {
    await expect(this.geolocationHeading).toBeVisible({ timeout: 5000 });
    await expect(this.geofenceAlertHeading).toBeVisible({ timeout: 5000 });
  }
}
