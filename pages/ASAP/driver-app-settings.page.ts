import { Page, Locator, expect } from "@playwright/test";

/**
 * Driver App Settings Page Object
 * Settings Tab: Driver App
 * URL Hash: #driver-setting
 */
export class DriverAppSettingsPage {
  readonly page: Page;

  // Page Heading
  readonly pageHeading: Locator;

  // Accordion Tabs
  readonly introductionTab: Locator;
  readonly smartTabletTab: Locator;
  readonly downloadAppTab: Locator;
  readonly notificationSettingsTab: Locator;

  // Introduction Section
  readonly introductionPanel: Locator;
  readonly introductionText: Locator;
  readonly addDriversLink: Locator;

  // Smart Tablet Section
  readonly smartTabletPanel: Locator;
  readonly smartTabletDescription: Locator;

  // Download App Section
  readonly downloadAppPanel: Locator;
  readonly androidAppImage: Locator;
  readonly googlePlayStoreImage: Locator;
  readonly appleAppStoreImage: Locator;
  readonly iosQrScannerImage: Locator;
  readonly quickStartGuideEnglishLink: Locator;
  readonly quickStartGuideSpanishLink: Locator;

  // Notification Settings Section
  readonly notificationSettingsPanel: Locator;
  readonly smsNotificationCheckbox: Locator;

  constructor(page: Page) {
    this.page = page;

    // Page Heading
    this.pageHeading = page.getByRole("heading", { name: "Driver App", level: 2 });

    // Accordion Tabs - Using regex to match tab names (tabs have complex names with icons and descriptions)
    this.introductionTab = page.getByRole("tab", { name: /Introduction/i });
    this.smartTabletTab = page.getByRole("tab", { name: /Get a Smart Tablet/i });
    this.downloadAppTab = page.getByRole("tab", { name: /Download TrackMyShuttle Driver App/i });
    this.notificationSettingsTab = page.getByRole("tab", { name: /Driver Notification Settings/i });

    // Introduction Section
    this.introductionPanel = page.getByRole("tabpanel").filter({ hasText: "Introduction" });
    this.introductionText = page.getByText(/The TrackMyShuttle Driver App simplifies driver tasks/);
    this.addDriversLink = page.getByRole("link", { name: "click here" });

    // Smart Tablet Section
    this.smartTabletPanel = page.getByRole("tabpanel").filter({ hasText: "Get a Smart Tablet" });
    this.smartTabletDescription = page.getByText(/For your drivers, please procure Android or iOS tablets/);

    // Download App Section
    this.downloadAppPanel = page.getByRole("tabpanel", { name: /Download TrackMyShuttle Driver App/i });
    this.androidAppImage = page.getByRole("img", { name: "Android" });
    this.googlePlayStoreImage = page.getByRole("img", { name: "Google Play Store" });
    this.appleAppStoreImage = page.getByRole("img", { name: "Apple App Store" });
    this.iosQrScannerImage = page.getByRole("img", { name: "iOS QR Scanner" });
    // Links contain "Download PDF" text with guide type in heading
    this.quickStartGuideEnglishLink = page.getByRole("heading", { name: "Quick Start Guide (English)" }).locator("..").getByRole("link");
    this.quickStartGuideSpanishLink = page.getByRole("heading", { name: "Quick Start Guide (Spanish)" }).locator("..").getByRole("link");

    // Notification Settings Section
    this.notificationSettingsPanel = page.getByRole("tabpanel").filter({ hasText: "Driver Notification Settings" });
    this.smsNotificationCheckbox = page.getByRole("checkbox").filter({ hasText: /Enable dispatch notifications via SMS/i }).or(
      page.locator("text=Enable dispatch notifications via SMS").locator("..").getByRole("checkbox")
    );
  }

  /**
   * Verify driver app settings page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify all accordion sections are visible
   */
  async verifyAllSectionsVisible(): Promise<void> {
    await expect(this.introductionTab).toBeVisible({ timeout: 5000 });
    await expect(this.smartTabletTab).toBeVisible({ timeout: 5000 });
    await expect(this.downloadAppTab).toBeVisible({ timeout: 5000 });
    await expect(this.notificationSettingsTab).toBeVisible({ timeout: 5000 });
  }

  /**
   * Expand accordion section (scroll into view)
   * Note: All sections are expanded by default on Driver App page,
   * but we need to scroll to make the content visible
   */
  async expandSection(
    section: "introduction" | "smartTablet" | "downloadApp" | "notificationSettings"
  ): Promise<void> {
    const tabMap: Record<string, Locator> = {
      introduction: this.introductionTab,
      smartTablet: this.smartTabletTab,
      downloadApp: this.downloadAppTab,
      notificationSettings: this.notificationSettingsTab,
    };

    const tab = tabMap[section];
    if(!tab){
      throw new Error(`Invalid section name: ${section}`);
    }
    await tab.scrollIntoViewIfNeeded();
    // Playwright auto-waits for scroll action
  }

  // ========== Introduction Methods ==========

  /**
   * Verify introduction section content
   */
  async verifyIntroductionContent(): Promise<void> {
    await expect(this.introductionText).toBeVisible({ timeout: 5000 });
    await expect(this.addDriversLink).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click add drivers link
   */
  async clickAddDriversLink(): Promise<void> {
    await this.addDriversLink.click();
    // Wait for navigation or dialog to appear
    await this.page.waitForLoadState('domcontentloaded', { timeout: 5000 }).catch(() => {});
  }

  // ========== Smart Tablet Methods ==========

  /**
   * Verify smart tablet section content
   */
  async verifySmartTabletContent(): Promise<void> {
    await expect(this.smartTabletDescription).toBeVisible({ timeout: 5000 });
  }

  // ========== Download App Methods ==========

  /**
   * Verify download app section content
   */
  async verifyDownloadAppContent(): Promise<void> {
    await expect(this.googlePlayStoreImage).toBeVisible({ timeout: 5000 });
    await expect(this.appleAppStoreImage).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify quick start guides are available
   */
  async verifyQuickStartGuidesAvailable(): Promise<void> {
    await expect(this.quickStartGuideEnglishLink).toBeVisible({ timeout: 5000 });
    await expect(this.quickStartGuideSpanishLink).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get English quick start guide URL
   */
  async getEnglishGuideUrl(): Promise<string | null> {
    return await this.quickStartGuideEnglishLink.getAttribute("href");
  }

  /**
   * Get Spanish quick start guide URL
   */
  async getSpanishGuideUrl(): Promise<string | null> {
    return await this.quickStartGuideSpanishLink.getAttribute("href");
  }

  // ========== Notification Settings Methods ==========

  /**
   * Check if SMS notifications are enabled
   */
  async isSmsNotificationEnabled(): Promise<boolean> {
    const checkbox = this.page.locator("text=Enable dispatch notifications via SMS").locator("..").locator("..").getByRole("checkbox");
    return await checkbox.isChecked();
  }

  /**
   * Toggle SMS notification setting
   */
  async toggleSmsNotification(): Promise<void> {
    const checkbox = this.page.locator("text=Enable dispatch notifications via SMS").locator("..").locator("..").getByRole("checkbox");
    await checkbox.click();
    // Playwright auto-waits for click actions
  }

  /**
   * Verify notification settings panel content
   */
  async verifyNotificationSettingsContent(): Promise<void> {
    await expect(this.page.getByText("Enable dispatch notifications via SMS")).toBeVisible({ timeout: 5000 });
  }
}
