import { Page, Locator, expect } from "@playwright/test";

/**
 * Operation Settings Page Object
 * Settings Tab: Operation Settings
 * URL Hash: #platformSetting
 */
export class OperationSettingsPage {
  readonly page: Page;

  // Page Heading
  readonly pageHeading: Locator;
  readonly pageDescription: Locator;

  // Accordion Tabs (nested tabs within Operation Settings)
  readonly pickupTimeTab: Locator;
  readonly pickupStopsTab: Locator;
  readonly rideSharingTab: Locator;
  readonly driverAssignmentTab: Locator;
  readonly shuttleCapacityTab: Locator;

  // Pick-up Time Options (Radio buttons)
  readonly asapPickupRadio: Locator;
  readonly futurePickupRadio: Locator;
  readonly bothPickupRadio: Locator;

  // Pick-up Stops Options
  readonly predefinedStopsOnlyRadio: Locator;
  readonly predefinedPlusServiceAreaRadio: Locator;
  readonly addServiceAreaLink: Locator;

  // Ride Sharing Options
  readonly sharedRidesRadio: Locator;
  readonly privateRidesRadio: Locator;

  // Driver Assignment Options
  readonly operatorAssignmentRadio: Locator;
  readonly driverSelfAssignmentRadio: Locator;

  // Shuttle Capacity Options
  readonly staticCapacityRadio: Locator;
  readonly dynamicCapacityRadio: Locator;
  readonly maxRidersInput: Locator;

  constructor(page: Page) {
    this.page = page;

    // Headings
    this.pageHeading = page.getByRole("heading", { name: "Operation Settings", level: 3 });
    this.pageDescription = page.getByText("Configure these settings to match your operations");

    // Accordion Tabs - tabs have complex names with icons and descriptions
    // Use regex to match the heading portion of the tab name
    this.pickupTimeTab = page.getByRole("tab", { name: /Pick-up Time/i });
    this.pickupStopsTab = page.getByRole("tab", { name: /Pick-up Stops/i });
    this.rideSharingTab = page.getByRole("tab", { name: /Ride Sharing Configuration/i });
    this.driverAssignmentTab = page.getByRole("tab", { name: /Driver Assignment/i }).first();
    this.shuttleCapacityTab = page.getByRole("tab", { name: /Shuttle Capacity Configuration/i });

    // Pick-up Time Radio Buttons - names include full description text
    this.asapPickupRadio = page.getByRole("radio", { name: /ASAP Pickup/i });
    this.futurePickupRadio = page.getByRole("radio", { name: /Future Pickup/i }).first();
    this.bothPickupRadio = page.getByRole("radio", { name: /Both ASAP & Future Pickup/i });

    // Pick-up Stops Radio Buttons
    this.predefinedStopsOnlyRadio = page.getByRole("radio", { name: /Pre-Defined Stops Only/i });
    this.predefinedPlusServiceAreaRadio = page.getByRole("radio", { name: /Pre-Defined Stops \+ Service Area/i });
    this.addServiceAreaLink = page.getByRole("link", { name: /Add Service Area/i });

    // Ride Sharing Radio Buttons
    this.sharedRidesRadio = page.getByRole("radio", { name: /Shared Rides/i });
    this.privateRidesRadio = page.getByRole("radio", { name: /Private Rides/i });

    // Driver Assignment Radio Buttons
    this.operatorAssignmentRadio = page.getByRole("radio", { name: /Operator Assignment Only/i });
    this.driverSelfAssignmentRadio = page.getByRole("radio", { name: /Driver Self-Assignment/i });

    // Shuttle Capacity
    this.staticCapacityRadio = page.getByRole("radio", { name: /Static Capacity/i }).first();
    this.dynamicCapacityRadio = page.getByRole("radio", { name: /Dynamic Fleet-Based Capacity/i });
    // Max riders input is in the Shuttle Capacity section
    this.maxRidersInput = page.getByRole("heading", { name: "Maximum Number of Riders per shuttle" }).locator("..").locator("..").getByRole("textbox");
  }

  /**
   * Verify operation settings page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
    await expect(this.pageDescription).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify all accordion sections are visible
   */
  async verifyAllSectionsVisible(): Promise<void> {
    await expect(this.pickupTimeTab).toBeVisible({ timeout: 5000 });
    await expect(this.pickupStopsTab).toBeVisible({ timeout: 5000 });
    await expect(this.rideSharingTab).toBeVisible({ timeout: 5000 });
    await expect(this.driverAssignmentTab).toBeVisible({ timeout: 5000 });
    await expect(this.shuttleCapacityTab).toBeVisible({ timeout: 5000 });
  }

  /**
   * Expand accordion section (scroll into view and click tab)
   * Note: All sections are expanded by default on this page,
   * but we need to scroll to make the content visible
   */
  async expandSection(
    section: "pickupTime" | "pickupStops" | "rideSharing" | "driverAssignment" | "shuttleCapacity"
  ): Promise<void> {
    const tabMap: Record<string, Locator> = {
      pickupTime: this.pickupTimeTab,
      pickupStops: this.pickupStopsTab,
      rideSharing: this.rideSharingTab,
      driverAssignment: this.driverAssignmentTab,
      shuttleCapacity: this.shuttleCapacityTab,
    };

    const tab = tabMap[section];
    // Scroll tab into view to ensure content is visible
    await tab.scrollIntoViewIfNeeded();
    // Playwright auto-waits for scroll action
  }

  // ========== Pick-up Time Methods ==========

  /**
   * Get current pickup time setting
   */
  async getPickupTimeSetting(): Promise<"asap" | "future" | "both" | null> {
    if (await this.asapPickupRadio.isChecked()) return "asap";
    if (await this.futurePickupRadio.isChecked()) return "future";
    if (await this.bothPickupRadio.isChecked()) return "both";
    return null;
  }

  /**
   * Verify ASAP pickup is selected
   */
  async verifyAsapPickupSelected(): Promise<void> {
    await expect(this.asapPickupRadio).toBeChecked();
  }

  /**
   * Check if Future Pickup option is disabled
   */
  async isFuturePickupDisabled(): Promise<boolean> {
    return await this.futurePickupRadio.isDisabled();
  }

  // ========== Pick-up Stops Methods ==========

  /**
   * Get current pickup stops setting
   */
  async getPickupStopsSetting(): Promise<"predefined" | "predefinedPlusServiceArea" | null> {
    if (await this.predefinedStopsOnlyRadio.isChecked()) return "predefined";
    if (await this.predefinedPlusServiceAreaRadio.isChecked()) return "predefinedPlusServiceArea";
    return null;
  }

  /**
   * Select predefined stops only option
   */
  async selectPredefinedStopsOnly(): Promise<void> {
    await this.predefinedStopsOnlyRadio.click();
    // Playwright auto-waits for click actions
  }

  /**
   * Select predefined stops + service area option
   */
  async selectPredefinedPlusServiceArea(): Promise<void> {
    await this.predefinedPlusServiceAreaRadio.click();
    // Playwright auto-waits for click actions
  }

  /**
   * Click Add Service Area link
   */
  async clickAddServiceArea(): Promise<void> {
    await this.addServiceAreaLink.click();
    await this.page.waitForURL("**/add-stop**", { timeout: 10000 });
  }

  // ========== Ride Sharing Methods ==========

  /**
   * Get current ride sharing setting
   */
  async getRideSharingSetting(): Promise<"shared" | "private" | null> {
    if (await this.sharedRidesRadio.isChecked()) return "shared";
    if (await this.privateRidesRadio.isChecked()) return "private";
    return null;
  }

  /**
   * Verify shared rides is selected
   */
  async verifySharedRidesSelected(): Promise<void> {
    await expect(this.sharedRidesRadio).toBeChecked();
  }

  /**
   * Check if Private Rides option is disabled
   */
  async isPrivateRidesDisabled(): Promise<boolean> {
    return await this.privateRidesRadio.isDisabled();
  }

  // ========== Driver Assignment Methods ==========

  /**
   * Get current driver assignment setting
   */
  async getDriverAssignmentSetting(): Promise<"operator" | "driverSelf" | null> {
    if (await this.operatorAssignmentRadio.isChecked()) return "operator";
    if (await this.driverSelfAssignmentRadio.isChecked()) return "driverSelf";
    return null;
  }

  /**
   * Select operator assignment only
   */
  async selectOperatorAssignment(): Promise<void> {
    await this.operatorAssignmentRadio.click();
    // Playwright auto-waits for click actions
  }

  /**
   * Select driver self-assignment
   */
  async selectDriverSelfAssignment(): Promise<void> {
    await this.driverSelfAssignmentRadio.click();
    // Playwright auto-waits for click actions
  }

  // ========== Shuttle Capacity Methods ==========

  /**
   * Get current shuttle capacity setting
   */
  async getShuttleCapacitySetting(): Promise<"static" | "dynamic" | null> {
    if (await this.staticCapacityRadio.isChecked()) return "static";
    if (await this.dynamicCapacityRadio.isChecked()) return "dynamic";
    return null;
  }

  /**
   * Verify static capacity is selected
   */
  async verifyStaticCapacitySelected(): Promise<void> {
    await expect(this.staticCapacityRadio).toBeChecked();
  }

  /**
   * Get max riders value
   */
  async getMaxRidersValue(): Promise<string> {
    return await this.maxRidersInput.inputValue();
  }

  /**
   * Set max riders value
   */
  async setMaxRidersValue(value: string): Promise<void> {
    await this.maxRidersInput.clear();
    await this.maxRidersInput.fill(value);
    // Playwright auto-waits for input actions
  }

  /**
   * Check if Dynamic Capacity option is disabled
   */
  async isDynamicCapacityDisabled(): Promise<boolean> {
    return await this.dynamicCapacityRadio.isDisabled();
  }
}
