import { Page, Locator, expect } from "@playwright/test";

/**
 * Rider App Settings Page Object
 * Settings Tab: Rider App
 * URL Hash: #guests
 */
export class RiderAppSettingsPage {
  readonly page: Page;

  // Page Heading
  readonly pageHeading: Locator;
  readonly pageDescription: Locator;

  // Enable Rider App Section
  readonly enableRiderAppTab: Locator;
  readonly enableRiderAppCheckbox: Locator;

  // Configure Cover Page Section
  readonly configureCoverPageTab: Locator;
  readonly coverPagePanel: Locator;
  readonly organizationLogo: Locator;
  readonly organizationNameDisplay: Locator;
  readonly showCustomNoteCheckbox: Locator;

  // Configure Contact Settings Section
  readonly configureContactSettingsTab: Locator;
  readonly contactSettingsPanel: Locator;
  readonly changeMapThemeHeading: Locator;
  readonly showCallOptionCheckbox: Locator;
  readonly phoneNumberInput: Locator;
  readonly updatePhoneButton: Locator;

  // How to Share Rider App Access Section
  readonly shareRiderAppTab: Locator;
  readonly shareRiderAppPanel: Locator;
  readonly shareTrackingCodeHeading: Locator;
  readonly shareLinkQrHeading: Locator;
  readonly trackingLink: Locator;
  readonly copyLinkButton: Locator;
  readonly qrCodeButton: Locator;
  readonly voicemailScriptHeading: Locator;
  readonly displayQrSignageHeading: Locator;
  readonly downloadPdf8x11: Locator;
  readonly downloadPdf4x6: Locator;

  // Ride Cancelation Options Section
  readonly rideCancelationTab: Locator;
  readonly rideCancelationPanel: Locator;

  constructor(page: Page) {
    this.page = page;

    // Headings
    this.pageHeading = page.getByRole("heading", { name: "Rider App Settings", level: 2 });
    this.pageDescription = page.getByText("Configure these settings to customize the Rider App experience");

    // Enable Rider App Section - this is a special tab with checkbox next to it
    this.enableRiderAppTab = page.getByRole("tab", { name: /Enable Rider App/i });
    // The checkbox for enable rider app is next to the tab, not inside it
    this.enableRiderAppCheckbox = page.getByRole("tab", { name: /Enable Rider App/i }).locator("..").getByRole("checkbox");

    // Configure Cover Page Section
    this.configureCoverPageTab = page.getByRole("tab", { name: /Configure Cover Page/i });
    this.coverPagePanel = page.getByRole("tabpanel", { name: /Configure Cover Page/i });
    this.organizationLogo = page.getByRole("img", { name: "hotel_logo" });
    this.organizationNameDisplay = page.locator("text=Automated OD ASAP").first();
    this.showCustomNoteCheckbox = page.getByRole("checkbox", { name: /SHOW CUSTOM NOTE/i });

    // Configure Contact Settings Section
    this.configureContactSettingsTab = page.getByRole("tab", { name: /Configure Contact Settings/i });
    this.contactSettingsPanel = page.getByRole("tabpanel", { name: /Configure Contact Settings/i });
    this.changeMapThemeHeading = page.getByRole("heading", { name: "CHANGE MAP THEME", level: 4 });
    this.showCallOptionCheckbox = page.getByRole("checkbox", { name: /SHOW CALL OPTION/i });
    this.phoneNumberInput = page.getByRole("textbox", { name: "User Phone No." });
    this.updatePhoneButton = page.getByRole("button", { name: "Update" });

    // Share Rider App Section
    this.shareRiderAppTab = page.getByRole("tab", { name: /How to Share Rider App Access/i });
    this.shareRiderAppPanel = page.getByRole("tabpanel").filter({ hasText: "Share Tracking Code" });
    this.shareTrackingCodeHeading = page.getByRole("heading", { name: "Share Tracking Code", level: 4 });
    this.shareLinkQrHeading = page.getByRole("heading", { name: "Share Link & QR Code", level: 4 });
    this.trackingLink = page.locator("text=/https:\\/\\/.*\\/a\\/ODASAP/");
    this.copyLinkButton = page.getByRole("link", { name: "Copy link" }).first();
    this.qrCodeButton = page.getByRole("link", { name: "QRCODE" });
    this.voicemailScriptHeading = page.getByRole("heading", { name: "Voicemail Script", level: 4 });
    this.displayQrSignageHeading = page.getByRole("heading", { name: "Display QR Signage", level: 4 });
    this.downloadPdf8x11 = page.locator("text=8.5 X 11").locator("..").getByText("Download PDF");
    this.downloadPdf4x6 = page.locator("text=4 X 6").locator("..").getByText("Download PDF");

    // Ride Cancelation Options Section
    this.rideCancelationTab = page.getByRole("tab", { name: /Ride Cancelation Options/i });
    this.rideCancelationPanel = page.getByRole("tabpanel").filter({ hasText: "Ride request was not accepted" });
  }

  /**
   * Verify rider app settings page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
    await expect(this.pageDescription).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify all accordion sections are visible
   */
  async verifyAllSectionsVisible(): Promise<void> {
    await expect(this.enableRiderAppTab).toBeVisible({ timeout: 5000 });
    await expect(this.configureCoverPageTab).toBeVisible({ timeout: 5000 });
    await expect(this.configureContactSettingsTab).toBeVisible({ timeout: 5000 });
    await expect(this.shareRiderAppTab).toBeVisible({ timeout: 5000 });
    await expect(this.rideCancelationTab).toBeVisible({ timeout: 5000 });
  }

  /**
   * Expand accordion section (scroll into view)
   * Note: All sections are expanded by default on Rider App page,
   * but we need to scroll to make the content visible
   */
  async expandSection(
    section: "coverPage" | "contactSettings" | "shareAccess" | "cancelation"
  ): Promise<void> {
    const tabMap: Record<string, Locator> = {
      coverPage: this.configureCoverPageTab,
      contactSettings: this.configureContactSettingsTab,
      shareAccess: this.shareRiderAppTab,
      cancelation: this.rideCancelationTab,
    };

    const tab = tabMap[section];
    if(!tab){
      throw new Error(`Invalid section name: ${section}`);
    }
    await tab.scrollIntoViewIfNeeded();
    // Animation wait removed - element changes are observable
  }

  // ========== Enable Rider App Methods ==========

  /**
   * Check if Rider App is enabled
   */
  async isRiderAppEnabled(): Promise<boolean> {
    return await this.enableRiderAppCheckbox.isChecked();
  }

  /**
   * Toggle Rider App enabled state
   */
  async toggleRiderApp(): Promise<void> {
    await this.enableRiderAppCheckbox.click();
    // Animation wait removed - element changes are observable
  }

  // ========== Cover Page Methods ==========

  /**
   * Check if custom note is shown
   */
  async isCustomNoteShown(): Promise<boolean> {
    return await this.showCustomNoteCheckbox.isChecked();
  }

  /**
   * Toggle custom note visibility
   */
  async toggleCustomNote(): Promise<void> {
    await this.showCustomNoteCheckbox.click();
    // Animation wait removed - element changes are observable
  }

  // ========== Contact Settings Methods ==========

  /**
   * Check if call option is shown
   */
  async isCallOptionShown(): Promise<boolean> {
    return await this.showCallOptionCheckbox.isChecked();
  }

  /**
   * Toggle call option visibility
   */
  async toggleCallOption(): Promise<void> {
    await this.showCallOptionCheckbox.click();
    // Animation wait removed - element changes are observable
  }

  /**
   * Get phone number value
   */
  async getPhoneNumber(): Promise<string> {
    return await this.phoneNumberInput.inputValue();
  }

  /**
   * Set phone number value
   */
  async setPhoneNumber(phoneNumber: string): Promise<void> {
    await this.phoneNumberInput.clear();
    await this.phoneNumberInput.fill(phoneNumber);
    // Animation wait removed - element changes are observable
  }

  // ========== Share Rider App Methods ==========

  /**
   * Get tracking link URL
   */
  async getTrackingLinkUrl(): Promise<string> {
    const text = await this.trackingLink.textContent();
    return text?.trim() || "";
  }

  /**
   * Click copy link button
   */
  async clickCopyLink(): Promise<void> {
    await this.copyLinkButton.click();
    // Animation wait removed - element changes are observable
  }

  /**
   * Click QR code button
   */
  async clickQrCode(): Promise<void> {
    await this.qrCodeButton.click();
    // Wait for QR modal or content to appear
    await this.page.waitForSelector('.modal, [role="dialog"], img[alt*="QR"]', { timeout: 5000 }).catch(() => {});
  }

  // ========== Ride Cancelation Methods ==========

  /**
   * Get cancelation reason checkbox by text
   */
  getCancelationReasonCheckbox(reasonText: string): Locator {
    return this.page.locator(`text="${reasonText}"`).locator("..").getByRole("checkbox");
  }

  /**
   * Verify cancelation reason exists
   */
  async verifyCancelationReasonExists(reasonText: string): Promise<void> {
    await expect(this.page.getByText(reasonText)).toBeVisible({ timeout: 5000 });
  }
}
