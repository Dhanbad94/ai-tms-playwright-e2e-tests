import { Page, Locator, expect } from "@playwright/test";
import { SettingsBasePage } from "./settings-base.page";

/**
 * Escalations settings tab (#escaltionSettings).
 *
 * Two independent sections, each scoped under a `.escalation__card`:
 *   0) "Ride Request Not Addressed" — toggle id #escalationSettingsOperator
 *   1) "Trip Not Started"           — toggle id #escalationSettingsDriver
 *
 * Behaviour confirmed on staging:
 * - The toggles are CSS switches: `<input class="switch-toggle-input" id="X">`
 *   (display:none) + `<label for="X" class="switch-toggle-label">` as the
 *   visible, clickable track — a different sibling pattern from the WhatsApp
 *   tab's `+ .toggle-track` (here it's a `<label for=...>`, not a sibling
 *   span), so don't copy that selector across tabs without checking.
 * - Flipping a toggle on its own does NOT save anything — unlike WhatsApp
 *   Notification, which auto-saves each toggle. Verified on staging: no
 *   HTTP request or WebSocket frame is sent on toggle, and the value is gone
 *   after navigating away and back, or in a fresh browser context.
 *   ⚠️ Reloading the *same* URL with page.goto() made it look persisted —
 *   that was Chrome restoring form-control state, not a server save. The
 *   real save presumably needs a complete rule (threshold + recipient via
 *   Select2, then the hidden `.saveEscalationModel` "Yes" confirm), which is
 *   deliberately not automated: a complete rule enables live escalations
 *   that can call/SMS real phone numbers.
 * - "See Example" is a CSS **`:hover`**-reveal, not a click target — the
 *   `.escalation__tooltip--info` example sentence has `opacity:0;
 *   visibility:hidden` by default and only becomes visible on `:hover`
 *   (confirmed via computed style, not just `offsetParent`, which misses
 *   opacity/visibility-hidden elements). A `.click()` does nothing.
 * - "Select Action" is a static `<span class="text escalation_via">Call/SMS/Email</span>`,
 *   not a real dropdown, despite the column header implying a choice.
 * - "+ Add More" renders as `.escalation__addMore.disabled` by default; it did
 *   NOT become enabled after turning the section's toggle on in manual
 *   testing — the unlock condition is unconfirmed. Treat as a known
 *   coverage gap (see app-map.yaml) rather than assuming a specific trigger.
 * - The "To" field is a Select2 widget (`select.escalationUser`, hidden,
 *   `select2-hidden-accessible`) backed by a free-text combobox
 *   ("Driver/Operator/Manager") — not asserted here beyond presence; driving
 *   Select2 reliably needs its own helper if a future test needs to pick a user.
 */
export class EscalationsSettingsPage extends SettingsBasePage {
  readonly heading: Locator;
  readonly description: Locator;

  // Section containers (0 = Ride Request Not Addressed, 1 = Trip Not Started)
  readonly rideRequestCard: Locator;
  readonly tripNotStartedCard: Locator;

  // Toggles
  readonly rideRequestToggleInput: Locator;
  readonly rideRequestToggleLabel: Locator;
  readonly tripNotStartedToggleInput: Locator;
  readonly tripNotStartedToggleLabel: Locator;

  // Per-section static content
  readonly rideRequestText: Locator;
  readonly tripNotStartedText: Locator;
  readonly rideRequestSeeExample: Locator;
  readonly tripNotStartedSeeExample: Locator;
  readonly rideRequestExampleText: Locator;
  readonly tripNotStartedExampleText: Locator;
  readonly rideRequestAddMore: Locator;
  readonly tripNotStartedAddMore: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole("heading", { name: "Escalation Settings", level: 2 });
    this.description = page.getByText(
      "Set up sequence of notifications when ride requests remain open beyond acceptable wait time."
    );

    const panel = page.locator("#escaltionSettings");
    const cards = panel.locator(".escalation__card");
    this.rideRequestCard = cards.nth(0);
    this.tripNotStartedCard = cards.nth(1);

    this.rideRequestToggleInput = page.locator("#escalationSettingsOperator");
    this.rideRequestToggleLabel = page.locator('label[for="escalationSettingsOperator"]');
    this.tripNotStartedToggleInput = page.locator("#escalationSettingsDriver");
    this.tripNotStartedToggleLabel = page.locator('label[for="escalationSettingsDriver"]');

    this.rideRequestText = this.rideRequestCard.getByText("Notify when Ride Request is not addressed by Driver on time");
    this.tripNotStartedText = this.tripNotStartedCard.getByText("Notify when Trip not started by Driver");

    this.rideRequestSeeExample = this.rideRequestCard.getByText("See Example");
    this.tripNotStartedSeeExample = this.tripNotStartedCard.getByText("See Example");
    this.rideRequestExampleText = this.rideRequestCard.locator(".escalation__tooltip--info");
    this.tripNotStartedExampleText = this.tripNotStartedCard.locator(".escalation__tooltip--info");

    this.rideRequestAddMore = this.rideRequestCard.locator(".escalation__addMore");
    this.tripNotStartedAddMore = this.tripNotStartedCard.locator(".escalation__addMore");
  }

  /** Navigate to Settings and open the Escalations tab. */
  async open(baseUrl: string): Promise<void> {
    await this.navigateToSettings(baseUrl);
    await this.clickTab("Escalations");
    await this.heading.waitFor({ state: "visible", timeout: 10000 });
    await this.rideRequestToggleInput.waitFor({ state: "attached", timeout: 10000 });
  }

  async verifyPageLoaded(): Promise<void> {
    await expect(this.heading).toBeVisible({ timeout: 10000 });
    await expect(this.description).toBeVisible({ timeout: 5000 });
  }

  async isRideRequestEnabled(): Promise<boolean> {
    return this.rideRequestToggleInput.isChecked();
  }
  async isTripNotStartedEnabled(): Promise<boolean> {
    return this.tripNotStartedToggleInput.isChecked();
  }

  /**
   * Flip a styled toggle to the desired state via its visible `<label for=...>`
   * (the `<input>` itself is display:none). No-op when already in that state.
   */
  private async setToggle(input: Locator, label: Locator, on: boolean): Promise<void> {
    if ((await input.isChecked()) === on) return;
    await label.click();
    // Client-side state only — the toggle alone sends no save (see class doc).
    await expect(input).toBeChecked({ checked: on, timeout: 5000 });
  }

  async setRideRequestEnabled(on: boolean): Promise<void> {
    await this.setToggle(this.rideRequestToggleInput, this.rideRequestToggleLabel, on);
  }
  async setTripNotStartedEnabled(on: boolean): Promise<void> {
    await this.setToggle(this.tripNotStartedToggleInput, this.tripNotStartedToggleLabel, on);
  }

  /**
   * Restore both toggles to OFF (the default state observed on staging).
   * Currently a client-side no-op in effect (toggles don't save on their
   * own), kept so cleanup stays correct if the app starts auto-saving.
   */
  async restoreToOff(): Promise<void> {
    await this.setRideRequestEnabled(false);
    await this.setTripNotStartedEnabled(false);
  }

  /**
   * Hover "See Example" to CSS-reveal the example sentence — it is not a
   * click target (see class doc). Hovering the text also satisfies the
   * ancestor `.escalation__tooltip:hover` rule that controls visibility.
   */
  async hoverRideRequestSeeExample(): Promise<void> {
    await this.rideRequestSeeExample.hover();
  }
  async hoverTripNotStartedSeeExample(): Promise<void> {
    await this.tripNotStartedSeeExample.hover();
  }
}
