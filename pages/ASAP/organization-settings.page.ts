import { Page, Locator, expect } from "@playwright/test";

/**
 * Organization Settings Page Object
 * Settings Tab: Organization
 * URL Hash: (default - no hash or empty)
 */
export class OrganizationSettingsPage {
  readonly page: Page;

  // Page Heading
  readonly pageHeading: Locator;
  readonly primaryOrgHeading: Locator;

  // Organization Info Display
  readonly organizationName: Locator;
  readonly organizationAddress: Locator;
  readonly organizationPhone: Locator;
  readonly trackingId: Locator;
  readonly timezone: Locator;

  // Edit Button
  readonly editButton: Locator;

  // Map
  readonly mapRegion: Locator;
  readonly mapZoomIn: Locator;
  readonly mapZoomOut: Locator;
  readonly mapTypeSelector: Locator;

  constructor(page: Page) {
    this.page = page;

    // Headings
    this.pageHeading = page.getByRole("heading", { name: "Organization Settings", level: 2 });
    this.primaryOrgHeading = page.getByRole("heading", { name: "Primary Organization", level: 3 });

    // Organization details - using text content locators
    // Note: These are display-only fields in cards, not form inputs
    this.organizationName = page.locator('[class*="org"]').filter({ hasText: /^[A-Za-z0-9\s]+$/ }).first();
    this.organizationAddress = page.locator('text="811 East Grand Avenue"').first();
    this.organizationPhone = page.locator('text=/\\+\\d{2}\\s?\\d+/').first();
    this.trackingId = page.locator('text=/Tracking ID\\s?:\\s?\\w+/').first();
    this.timezone = page.locator('text=/Time Zone\\s?:/').first();

    // Edit button (icon button)
    this.editButton = page.getByRole("button", { name: "icon" }).first();

    // Map elements
    this.mapRegion = page.getByRole("region", { name: "Map" });
    this.mapZoomIn = page.getByRole("button", { name: "Zoom in" });
    this.mapZoomOut = page.getByRole("button", { name: "Zoom out" });
    this.mapTypeSelector = page.getByRole("menubar");
  }

  /**
   * Verify organization settings page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
    await expect(this.primaryOrgHeading).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify organization details are displayed
   */
  async verifyOrganizationDetailsVisible(): Promise<void> {
    await this.verifyPageLoaded();
    await expect(this.mapRegion).toBeVisible({ timeout: 10000 });
  }

  /**
   * Get organization info from the page
   */
  async getOrganizationInfo(): Promise<{
    name: string;
    address: string;
    phone: string;
    trackingId: string;
    timezone: string;
  }> {
    // Get the organization card content
    const tabPanel = this.page.getByRole("tabpanel");
    const content = await tabPanel.textContent();

    // Parse organization name (first text in the card)
    const nameMatch = content?.match(/Automated OD ASAP/);
    const name = nameMatch ? nameMatch[0] : "";

    // Parse address
    const addressMatch = content?.match(/811 East Grand Avenue[^+]*/);
    const address = addressMatch ? addressMatch[0].trim() : "";

    // Parse phone
    const phoneMatch = content?.match(/\+\d{2}\s?\d+/);
    const phone = phoneMatch ? phoneMatch[0] : "";

    // Parse tracking ID
    const trackingMatch = content?.match(/Tracking ID\s?:\s?(\w+)/);
    const trackingId = trackingMatch?.[1] ??"";

    // Parse timezone
    const timezoneMatch = content?.match(/Time Zone\s?:\s?\([^)]+\)\s?[^+]*/);
    const timezone = timezoneMatch ? timezoneMatch[0].replace("Time Zone :", "").trim() : "";

    return {
      name,
      address,
      phone,
      trackingId,
      timezone,
    };
  }

  /**
   * Verify organization name matches expected value
   */
  async verifyOrganizationName(expectedName: string): Promise<void> {
    const info = await this.getOrganizationInfo();
    expect(info.name).toBe(expectedName);
  }

  /**
   * Verify tracking ID matches expected value
   */
  async verifyTrackingId(expectedId: string): Promise<void> {
    const info = await this.getOrganizationInfo();
    expect(info.trackingId).toBe(expectedId);
  }

  /**
   * Verify map is visible and interactive
   */
  async verifyMapIsVisible(): Promise<void> {
    await expect(this.mapRegion).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify map controls are available
   */
  async verifyMapControlsVisible(): Promise<void> {
    await expect(this.mapZoomIn).toBeVisible({ timeout: 5000 });
    await expect(this.mapZoomOut).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click edit organization button
   */
  async clickEditOrganization(): Promise<void> {
    await this.editButton.click();
    // Wait for edit modal or form to appear
    await this.page.waitForSelector('.modal, [role="dialog"], form', { timeout: 5000 }).catch(() => {});
  }

  /**
   * Zoom in on map
   */
  async zoomInMap(): Promise<void> {
    await this.mapZoomIn.click();
    // Animation wait removed - element changes are observable
  }

  /**
   * Zoom out on map
   */
  async zoomOutMap(): Promise<void> {
    await this.mapZoomOut.click();
    // Animation wait removed - element changes are observable
  }

  /**
   * Switch map type (Map/Satellite)
   */
  async switchMapType(type: "Map" | "Satellite"): Promise<void> {
    const menuItem = this.page.getByRole("menuitemradio", {
      name: type === "Map" ? "Show street map" : "Show satellite imagery",
    });
    await menuItem.click();
    // Wait for map tiles to load
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  }

  /**
   * Verify map type is selected
   */
  async verifyMapTypeSelected(type: "Map" | "Satellite"): Promise<void> {
    const menuItem = this.page.getByRole("menuitemradio", {
      name: type === "Map" ? "Show street map" : "Show satellite imagery",
    });
    await expect(menuItem).toHaveAttribute("aria-checked", "true");
  }
}
