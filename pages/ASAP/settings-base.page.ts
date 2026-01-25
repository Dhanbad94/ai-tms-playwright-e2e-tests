import { Page, Locator, expect } from "@playwright/test";

/**
 * Base Settings Page Object
 * Contains common functionality for all Settings tabs
 * URL: /setting
 */
export class SettingsBasePage {
  readonly page: Page;

  // Tab Navigation - Using getByRole for accessibility
  readonly tabList: Locator;
  readonly organizationTab: Locator;
  readonly userManagementTab: Locator;
  readonly operationSettingsTab: Locator;
  readonly operationHoursTab: Locator;
  readonly riderAppTab: Locator;
  readonly driverAppTab: Locator;
  readonly liveDisplayTab: Locator;
  readonly alertsTab: Locator;
  readonly escalationsTab: Locator;
  readonly pricingSetupTab: Locator;

  // Tab Panel Content
  readonly tabPanel: Locator;

  // Common Elements
  readonly pageHeading: Locator;

  constructor(page: Page) {
    this.page = page;

    // Tab list container
    this.tabList = page.getByRole("tablist");

    // Individual tabs using getByRole with exact name matching
    this.organizationTab = page.getByRole("tab", { name: "Organization" });
    this.userManagementTab = page.getByRole("tab", { name: "User Management" });
    this.operationSettingsTab = page.getByRole("tab", { name: "Operation Settings" });
    this.operationHoursTab = page.getByRole("tab", { name: "Operation Hours" });
    this.riderAppTab = page.getByRole("tab", { name: "Rider App" });
    this.driverAppTab = page.getByRole("tab", { name: "Driver App" });
    this.liveDisplayTab = page.getByRole("tab", { name: "Live display" });
    this.alertsTab = page.getByRole("tab", { name: "Alerts" });
    this.escalationsTab = page.getByRole("tab", { name: "Escalations" });
    this.pricingSetupTab = page.getByRole("tab", { name: "Pricing Setup" });

    // Tab panel (content area) - use first() as there may be nested tabpanels
    // The main content panel has class "tab-pane" and is the direct child of the content area
    this.tabPanel = page.locator('.tab-pane.active').first();

    // Page heading (changes based on active tab)
    this.pageHeading = page.getByRole("heading", { level: 2 }).first();
  }

  /**
   * Wait for settings page to fully load
   */
  async waitForSettingsPageLoad(): Promise<void> {
    await this.page.waitForURL("**/setting**", { timeout: 15000 });
    await this.tabList.waitFor({ state: "visible", timeout: 10000 });
    await this.organizationTab.waitFor({ state: "visible", timeout: 10000 });
  }

  /**
   * Verify all 10 settings tabs are visible
   */
  async verifyAllTabsVisible(): Promise<void> {
    const tabs = [
      { locator: this.organizationTab, name: "Organization" },
      { locator: this.userManagementTab, name: "User Management" },
      { locator: this.operationSettingsTab, name: "Operation Settings" },
      { locator: this.operationHoursTab, name: "Operation Hours" },
      { locator: this.riderAppTab, name: "Rider App" },
      { locator: this.driverAppTab, name: "Driver App" },
      { locator: this.liveDisplayTab, name: "Live display" },
      { locator: this.alertsTab, name: "Alerts" },
      { locator: this.escalationsTab, name: "Escalations" },
      { locator: this.pricingSetupTab, name: "Pricing Setup" },
    ];

    for (const tab of tabs) {
      await expect(tab.locator).toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Click on a specific tab by name
   */
  async clickTab(
    tabName:
      | "Organization"
      | "User Management"
      | "Operation Settings"
      | "Operation Hours"
      | "Rider App"
      | "Driver App"
      | "Live display"
      | "Alerts"
      | "Escalations"
      | "Pricing Setup"
  ): Promise<void> {
    const tabMap: Record<string, Locator> = {
      Organization: this.organizationTab,
      "User Management": this.userManagementTab,
      "Operation Settings": this.operationSettingsTab,
      "Operation Hours": this.operationHoursTab,
      "Rider App": this.riderAppTab,
      "Driver App": this.driverAppTab,
      "Live display": this.liveDisplayTab,
      Alerts: this.alertsTab,
      Escalations: this.escalationsTab,
      "Pricing Setup": this.pricingSetupTab,
    };

    const tab = tabMap[tabName];
    if (!tab) {
      throw new Error(`Unknown tab: ${tabName}`);
    }

    await tab.click();
    // Wait for tab content to load by checking for active tab panel
    await this.page.waitForSelector('.tab-pane.active', { timeout: 5000 }).catch(() => {});
  }

  /**
   * Verify a specific tab is active/expanded
   * Note: The main settings tabs use aria-expanded="true" when active
   */
  async verifyTabIsActive(tabName: string): Promise<void> {
    const tab = this.page.getByRole("tab", { name: tabName });
    // Check for aria-expanded attribute - some tabs use this to indicate active state
    // If that doesn't work, check for the "active" class or aria-selected
    const isExpanded = await tab.getAttribute("aria-expanded");
    if (isExpanded !== null) {
      await expect(tab).toHaveAttribute("aria-expanded", "true", { timeout: 5000 });
    } else {
      // Fallback: check if tab has aria-selected or is in an active state via class
      await expect(tab).toHaveClass(/active/, { timeout: 5000 });
    }
  }

  /**
   * Get the current page heading text
   */
  async getPageHeadingText(): Promise<string> {
    return (await this.pageHeading.textContent()) || "";
  }

  /**
   * Verify the page heading matches expected text
   */
  async verifyPageHeading(expectedHeading: string): Promise<void> {
    await expect(this.pageHeading).toHaveText(expectedHeading, { timeout: 5000 });
  }

  /**
   * Get count of visible tabs
   */
  async getTabCount(): Promise<number> {
    const tabs = await this.page.getByRole("tab").all();
    let visibleCount = 0;
    for (const tab of tabs) {
      if (await tab.isVisible()) {
        visibleCount++;
      }
    }
    return visibleCount;
  }

  /**
   * Navigate to settings page directly
   */
  async navigateToSettings(baseUrl: string): Promise<void> {
    await this.page.goto(`${baseUrl}/setting`, { waitUntil: "domcontentloaded" });
    await this.waitForSettingsPageLoad();
  }

  /**
   * Get the current URL hash (indicates active tab)
   */
  async getCurrentTabHash(): Promise<string> {
    const url = this.page.url();
    const hash = url.split("#")[1] || "";
    return hash;
  }

  /**
   * Verify URL hash matches expected value for tab
   */
  async verifyTabUrlHash(expectedHash: string): Promise<void> {
    const currentHash = await this.getCurrentTabHash();
    expect(currentHash).toBe(expectedHash);
  }
}
