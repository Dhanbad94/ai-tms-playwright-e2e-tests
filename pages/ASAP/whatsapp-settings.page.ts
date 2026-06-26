import { Page, Locator, expect } from "@playwright/test";
import { SettingsBasePage } from "./settings-base.page";

/**
 * WhatsApp Notification settings tab (#settings_whatsapp).
 *
 * Behaviour confirmed on staging:
 * - The master toggle (#toggle-whatsapp) gates the rider/driver toggles, which
 *   are disabled until the master is enabled.
 * - There is no Save button: each toggle auto-saves and persists across reloads.
 */
export class WhatsappSettingsPage extends SettingsBasePage {
  readonly heading: Locator;
  readonly masterToggle: Locator;
  readonly ridersToggle: Locator;
  readonly driversToggle: Locator;
  // The visible, clickable part of each styled switch (the <input> is hidden).
  readonly masterTrack: Locator;
  readonly ridersTrack: Locator;
  readonly driversTrack: Locator;
  // Auto-save confirmation toast (shared across settings) shown on every toggle.
  readonly successToast: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByText(/Whatsapp Notification Settings/i);
    this.masterToggle = page.locator("#toggle-whatsapp");
    this.ridersToggle = page.locator("#toggle-riders");
    this.driversToggle = page.locator("#toggle-drivers");
    // Each switch is <label class="toggle-switch"><input><span class="toggle-track">.
    // The track is the input's adjacent sibling and is the visible click target.
    this.masterTrack = page.locator("#toggle-whatsapp + .toggle-track");
    this.ridersTrack = page.locator("#toggle-riders + .toggle-track");
    this.driversTrack = page.locator("#toggle-drivers + .toggle-track");
    // On save the persistent `.toaster` gains `active notification_success`
    // and shows "Settings updated successfully."; it auto-dismisses after a few
    // seconds. Keying on `.active` makes it match only while it is shown.
    this.successToast = page.locator(".toaster.active.notification_success");
  }

  /** Navigate to Settings and open the WhatsApp Notification tab. */
  async open(baseUrl: string): Promise<void> {
    await this.navigateToSettings(baseUrl);
    // Use the base clickTab(): on this heavy page a direct .click() is
    // intercepted by the sidebar scrollbar overlay (mCSB_container/myTab).
    // clickTab scrolls in, force-clicks and falls back to href-hash navigation.
    await this.clickTab("WhatsApp Notification");
    // The master toggle is a styled switch whose <input> is visually hidden
    // (display:none), so wait for the visible heading to confirm the pane is
    // rendered, then for the toggle input to be attached.
    await this.heading.waitFor({ state: "visible", timeout: 10000 });
    await this.masterToggle.waitFor({ state: "attached", timeout: 10000 });
  }

  async isMasterEnabled(): Promise<boolean> {
    return this.masterToggle.isChecked();
  }
  async isRidersEnabled(): Promise<boolean> {
    return this.ridersToggle.isChecked();
  }
  async isDriversEnabled(): Promise<boolean> {
    return this.driversToggle.isChecked();
  }

  /**
   * Flip a styled toggle to the desired state.
   *
   * The <input> is display:none (a CSS switch), so setChecked/click on it fails
   * with "Element is not visible". Instead click the visible .toggle-track,
   * which toggles the wrapped input and fires change → auto-save. No-op when the
   * input already holds the desired state.
   */
  private async setToggle(
    input: Locator,
    track: Locator,
    on: boolean
  ): Promise<void> {
    if ((await input.isChecked()) === on) return;
    await track.click();
    await expect(input).toBeChecked({ checked: on, timeout: 5000 });
    await this.page.waitForTimeout(400); // let the auto-save settle
  }

  async setMaster(on: boolean): Promise<void> {
    await this.setToggle(this.masterToggle, this.masterTrack, on);
  }
  async setRiders(on: boolean): Promise<void> {
    await this.setToggle(this.ridersToggle, this.ridersTrack, on);
  }
  async setDrivers(on: boolean): Promise<void> {
    await this.setToggle(this.driversToggle, this.driversTrack, on);
  }

  /** Assert the "Settings updated successfully." toast appeared after a save. */
  async expectSettingsSaved(): Promise<void> {
    await expect(this.successToast).toBeVisible({ timeout: 5000 });
    await expect(this.successToast).toContainText(/updated successfully/i);
  }

  /** Wait for the success toast to auto-dismiss (so the next save can be seen). */
  async expectToastDismissed(): Promise<void> {
    await expect(this.successToast).toBeHidden({ timeout: 6000 });
  }

  /** Restore all WhatsApp toggles to OFF (the default state). */
  async restoreToOff(): Promise<void> {
    if (await this.isMasterEnabled()) {
      if (await this.isRidersEnabled()) await this.setRiders(false);
      if (await this.isDriversEnabled()) await this.setDrivers(false);
      await this.setMaster(false);
    }
  }
}
