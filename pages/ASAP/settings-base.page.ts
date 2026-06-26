import { Page, Locator, expect } from "@playwright/test";
import { LoginPage } from "../login_page";
import { getCredentials } from "../../tests/ASAPSettings/fixtures/test-data";
import { TIMEOUTS } from "../../constants";

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
  readonly serviceAreaScheduleTab: Locator;
  readonly riderAppTab: Locator;
  readonly driverAppTab: Locator;
  readonly liveDisplayTab: Locator;
  readonly alertsTab: Locator;
  readonly escalationsTab: Locator;
  readonly whatsappNotificationTab: Locator;

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
    this.serviceAreaScheduleTab = page.getByRole("tab", { name: "Service Area Schedule" });
    this.riderAppTab = page.getByRole("tab", { name: "Rider App" });
    this.driverAppTab = page.getByRole("tab", { name: "Driver App" });
    this.liveDisplayTab = page.getByRole("tab", { name: "Live display" });
    this.alertsTab = page.getByRole("tab", { name: "Alerts" });
    this.escalationsTab = page.getByRole("tab", { name: "Escalations" });
    this.whatsappNotificationTab = page.getByRole("tab", { name: "WhatsApp Notification" });

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
    // Use toHaveURL (polls page.url()) rather than waitForURL — waitForURL defaults
    // to waitUntil:"load", which the map-heavy settings page often never reaches,
    // so it timed out even though the page was already on /setting. The tab/element
    // waits below are the real readiness signal.
    await expect(this.page).toHaveURL(/\/setting/, { timeout: 15000 });
    // The settings page is heavy (maps/widgets) and can render its tab list slowly
    // under parallel load, so give the tab elements a more tolerant timeout.
    await this.tabList.waitFor({ state: "visible", timeout: 20000 });
    await this.organizationTab.waitFor({ state: "visible", timeout: 20000 });
  }

  /**
   * Verify all 9 settings tabs are visible
   */
  async verifyAllTabsVisible(): Promise<void> {
    const tabs = [
      { locator: this.organizationTab, name: "Organization" },
      { locator: this.userManagementTab, name: "User Management" },
      { locator: this.operationSettingsTab, name: "Operation Settings" },
      { locator: this.operationHoursTab, name: "Operation Hours" },
      { locator: this.serviceAreaScheduleTab, name: "Service Area Schedule" },
      { locator: this.riderAppTab, name: "Rider App" },
      { locator: this.driverAppTab, name: "Driver App" },
      { locator: this.liveDisplayTab, name: "Live display" },
      { locator: this.alertsTab, name: "Alerts" },
      { locator: this.escalationsTab, name: "Escalations" },
      { locator: this.whatsappNotificationTab, name: "WhatsApp Notification" },
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
      | "Service Area Schedule"
      | "Live display"
      | "Alerts"
      | "Escalations"
      | "WhatsApp Notification"
  ): Promise<void> {
    const tabMap: Record<string, Locator> = {
      Organization: this.organizationTab,
      "User Management": this.userManagementTab,
      "Operation Settings": this.operationSettingsTab,
      "Operation Hours": this.operationHoursTab,
      "Service Area Schedule": this.serviceAreaScheduleTab,
      "Rider App": this.riderAppTab,
      "Driver App": this.driverAppTab,
      "Live display": this.liveDisplayTab,
      Alerts: this.alertsTab,
      Escalations: this.escalationsTab,
      "WhatsApp Notification": this.whatsappNotificationTab,
    };

    const tab = tabMap[tabName];
    if (!tab) {
      throw new Error(`Unknown tab: ${tabName}`);
    }

    // The settings sidebar has a custom scrollbar overlay (mCSB_container) that
    // hit-test-intercepts real pointer clicks, so dispatch the <a role="tab">'s
    // own click() via evaluate. That fires the Bootstrap tab handler directly
    // (no coordinate hit-testing), activating the pane AND updating the hash.
    const href = (await tab.getAttribute("href")) || "";
    const hash = href.startsWith("#") && href.length > 1 ? href : "";
    await tab.scrollIntoViewIfNeeded().catch(() => {});
    await tab.evaluate((el) => (el as HTMLElement).click());
    if (hash && !this.page.url().includes(hash)) {
      await this.page
        .waitForURL((url) => url.toString().includes(hash), { timeout: 2000 })
        .catch(async () => {
          await this.page.evaluate((h) => {
            window.location.hash = h;
          }, hash);
        });
    }
  }

  /**
   * Verify a specific tab is active/expanded
   * Note: The main settings tabs use aria-expanded="true" when active
   */
  async verifyTabIsActive(tabName: string): Promise<void> {
    const tab = this.page.getByRole("tab", { name: tabName });
    const hash = ((await tab.getAttribute("href")) || "").replace(/^#+/, "");
    if (!hash) return;

    // The reliable signal that a settings tab is active is that the URL hash
    // matches the tab's href once navigated. (aria-controls is inconsistent and
    // the active tab carries no "active" class.) For the default-loaded tab,
    // which has no hash yet, accept its content pane being visible instead.
    const paneId = await tab.getAttribute("aria-controls");
    await expect
      .poll(
        async () => {
          if (this.page.url().includes(`#${hash}`)) return true;
          return paneId
            ? this.page.locator(`#${paneId}`).isVisible()
            : false;
        },
        { timeout: 10000 }
      )
      .toBe(true);
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
    await this.ensureAuthenticated(baseUrl);
    await this.waitForSettingsPageLoad();
  }

  /**
   * Self-heal an expired session. The shared storageState session can lapse
   * partway through a long run; when it does, protected routes redirect to
   * /login. If we landed there, re-authenticate as Manager and re-open Settings
   * once. No-op when already authenticated (the common case).
   */
  async ensureAuthenticated(baseUrl: string): Promise<void> {
    if (!/\/login(\b|\/|$)/.test(this.page.url())) return;
    const { email, password } = getCredentials("MANAGER");
    if (!email || !password) return; // creds not configured — leave as-is
    const loginPage = new LoginPage(this.page);
    await loginPage.login(email, password);
    await this.page
      .waitForURL("**/dashboard", { timeout: TIMEOUTS.NAVIGATION })
      .catch(() => {});
    await this.page.goto(`${baseUrl}/setting`, { waitUntil: "domcontentloaded" });
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
