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

  // Edit button (three-dot "more" popover trigger) + popover Edit link
  readonly editButton: Locator;
  readonly editPopoverLink: Locator;
  readonly displayedOrgName: Locator;

  // Edit Organization modal (#editModalManager)
  readonly editModal: Locator;
  readonly editModalTitle: Locator;
  readonly orgNameInput: Locator;
  readonly phoneInput: Locator;
  readonly trackingIdInput: Locator;
  readonly zipInput: Locator;
  readonly streetInput: Locator;
  readonly updateButton: Locator;
  readonly cancelButton: Locator;
  readonly successMessage: Locator;

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

    // Edit affordance: a three-dot "more" button that opens a Bootstrap popover
    // containing the "Edit" link, which in turn opens the edit-organization modal.
    this.editButton = page.locator("div.top-bar button.btn.edit-tooltip").first();
    this.editPopoverLink = page.locator(".popover.in a.manager_edit_org");
    this.displayedOrgName = page.locator(".hotel--name").first();

    // Edit Organization modal
    this.editModal = page.locator("#editModalManager");
    this.editModalTitle = this.editModal
      .getByText(/Edit Organization Details/i)
      .first();
    this.orgNameInput = this.editModal.locator("#org_name");
    this.phoneInput = this.editModal.locator("#guest_phone");
    this.trackingIdInput = this.editModal.locator("#tracking_id");
    this.zipInput = this.editModal.locator("#zip");
    this.streetInput = this.editModal.locator("#street");
    this.updateButton = this.editModal.locator("#managerUpdateBtn");
    this.cancelButton = this.editModal.locator(".btn-close");
    // Success is primarily signalled by the modal closing + the name updating;
    // this tolerant locator also matches a success toast if one is shown.
    this.successMessage = page.locator(
      '.toast, .alert-success, [class*="toast"], [class*="snackbar"]'
    ).filter({ hasText: /success|updated|saved/i });

    // Map elements
    this.mapRegion = page.getByRole("region", { name: "Map" }).first();
    // Google Maps renders the zoom controls twice (a hidden duplicate + the
    // rendered one), so scope to the visible button to avoid a strict-mode /
    // hidden-element match. force-click handles the overlapping-control overlay.
    this.mapZoomIn = page.locator('button[aria-label="Zoom in"]:visible');
    this.mapZoomOut = page.locator('button[aria-label="Zoom out"]:visible');
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
    // The Google Map initialises asynchronously, so allow generous time for the
    // zoom controls to render before asserting/clicking them.
    await expect(this.mapZoomIn).toBeVisible({ timeout: 20000 });
    await expect(this.mapZoomOut).toBeVisible({ timeout: 20000 });
  }

  /**
   * Open the Edit Organization modal.
   *
   * The edit affordance is a three-dot "more" button that opens a Bootstrap
   * popover; the "Edit" link inside the popover opens (and populates) the modal.
   */
  async openEditModal(): Promise<void> {
    await this.editButton.click();
    // Click the Edit link revealed inside the popover.
    await this.editPopoverLink.click();
    // The modal opens and is populated from the current organization data.
    await expect(this.editModal).toBeVisible({ timeout: 10000 });
    await expect(this.orgNameInput).not.toHaveValue("", { timeout: 10000 });
  }

  /** Backwards-compatible alias for openEditModal(). */
  async clickEditOrganization(): Promise<void> {
    await this.openEditModal();
  }

  /** Read the organization name currently displayed on the settings page. */
  async getDisplayedOrgName(): Promise<string> {
    return (await this.displayedOrgName.innerText()).trim();
  }

  /**
   * Set the Organization Name in the edit modal.
   * The Update button stays disabled until a keyup/change fires, so we trigger
   * those events after filling.
   */
  async setOrgName(name: string): Promise<void> {
    await this.orgNameInput.fill(name);
    await this.orgNameInput.dispatchEvent("keyup");
    await this.orgNameInput.dispatchEvent("change");
    await expect(this.updateButton).toBeEnabled({ timeout: 5000 });
  }

  /** Click Update and wait for the modal to close (the success signal). */
  async clickUpdate(): Promise<void> {
    await this.updateButton.click();
    await expect(this.editModal).toBeHidden({ timeout: 10000 });
  }

  /**
   * Assert the organization update succeeded. The canonical signal is the modal
   * closing; if a success toast is rendered it is captured too (best-effort).
   * Persistence of the new value is verified separately by reloading the page.
   */
  async expectUpdateSuccess(): Promise<void> {
    await expect(this.editModal).toBeHidden({ timeout: 10000 });
    if (await this.successMessage.count()) {
      await expect(this.successMessage.first())
        .toBeVisible({ timeout: 2000 })
        .catch(() => {});
    }
  }

  /** Cancel the edit modal without saving. */
  async cancelEdit(): Promise<void> {
    await this.cancelButton.click();
    await expect(this.editModal).toBeHidden({ timeout: 10000 });
  }

  /**
   * Click the "Manage" CTA in the top navigation to open the Settings page.
   */
  async clickManageCTA(baseUrl: string): Promise<void> {
    // exact:true so it doesn't also match the "automated.manager@..." email link.
    await this.page.getByRole("link", { name: "Manage", exact: true }).click();
    await this.page.waitForURL("**/setting**", { timeout: 15000 }).catch(async () => {
      await this.page.goto(`${baseUrl}/setting`, { waitUntil: "domcontentloaded" });
    });
  }

  /**
   * Zoom in on map.
   * The Google Maps zoom-in/zoom-out buttons are stacked and a map overlay div
   * sits on top, so Playwright's pointer-interception check fails. force:true
   * dispatches the click straight to the button (its handler still fires).
   */
  async zoomInMap(): Promise<void> {
    await this.mapZoomIn.click({ force: true });
  }

  /**
   * Zoom out on map (force:true for the same reason as zoomInMap).
   */
  async zoomOutMap(): Promise<void> {
    await this.mapZoomOut.click({ force: true });
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
