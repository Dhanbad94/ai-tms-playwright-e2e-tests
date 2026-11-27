import { test, expect } from "@playwright/test";
import { EscalationsSettingsPage } from "../../pages/ASAP/escalations-settings.page";
import { getBaseUrl, getCredentials } from "./fixtures/test-data";

/**
 * Escalations settings (#escaltionSettings).
 * Auth comes from the shared storageState (auth.setup) — no per-test login.
 * afterEach restores both toggles to OFF (the default observed on staging),
 * the same pattern as whatsapp-settings.spec.ts.
 *
 * Not yet covered (see app-map.yaml coverage_gaps / CONVENTIONS.md):
 * - Saving an escalation rule (out of scope by agreement: escalations fire
 *   in real time). A toggle alone doesn't save on staging; no request is
 *   sent and the value is lost after navigating away.
 * - "+ Add More" renders disabled by default and its unlock condition wasn't
 *   confirmed during exploration — only its disabled presence is asserted.
 * - The "To" field (Select2, free-text combobox) isn't driven by any test —
 *   picking a specific user needs its own Select2 helper.
 * - "Select Action" is a static label ("Call/SMS/Email"), not a real control
 *   — nothing to test there beyond the display check below.
 */
test.describe("ASAP Escalations Settings @asap @settings", () => {
  let esc: EscalationsSettingsPage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  test.skip(
    !managerCreds.email || !managerCreds.password,
    "Manager credentials not provided"
  );

  test.beforeEach(async ({ page }) => {
    esc = new EscalationsSettingsPage(page);
    await esc.open(baseUrl);
  });

  // Toggles auto-save with no success toast; always leave staging in the
  // default (both-off) state regardless of which test ran.
  test.afterEach(async () => {
    try {
      await esc.restoreToOff();
    } catch {
      /* page/context may already be closed */
    }
  });

  // ---------- Read ----------

  test("ESC-NAV-001: Escalations tab loads with both notification sections @smoke @manager @prod", async () => {
    await esc.verifyPageLoaded();
    await expect(esc.rideRequestText).toBeVisible();
    await expect(esc.tripNotStartedText).toBeVisible();
    // The toggles are styled switches whose <input> is visually hidden
    // (display:none) — assert presence, not visibility.
    await expect(esc.rideRequestToggleInput).toBeAttached();
    await expect(esc.tripNotStartedToggleInput).toBeAttached();
  });

  test("ESC-READ-001: Hovering 'See Example' reveals the example text @regression @manager @prod", async () => {
    // Confirmed on staging: the example sentence is a CSS :hover reveal
    // (opacity:0/visibility:hidden by default) — "See Example" is not a
    // click target despite its pointer cursor.
    await expect(esc.rideRequestExampleText).toBeHidden();
    await esc.hoverRideRequestSeeExample();
    await expect(esc.rideRequestExampleText).toBeVisible();
    await expect(esc.rideRequestExampleText).toContainText(/after/i);
    await expect(esc.rideRequestExampleText).toContainText(/operator/i);

    await expect(esc.tripNotStartedExampleText).toBeHidden();
    await esc.hoverTripNotStartedSeeExample();
    await expect(esc.tripNotStartedExampleText).toBeVisible();
    await expect(esc.tripNotStartedExampleText).toContainText(/after/i);
    await expect(esc.tripNotStartedExampleText).toContainText(/driver/i);
  });

  test("ESC-READ-002: Escalation config columns (After / Select Action / To) are visible @regression @manager @prod", async () => {
    for (const card of [esc.rideRequestCard, esc.tripNotStartedCard]) {
      await expect(card.getByText("After", { exact: true })).toBeVisible();
      await expect(card.getByText("Select Action", { exact: true })).toBeVisible();
      await expect(card.getByText("To", { exact: true })).toBeVisible();
    }
  });

  test("ESC-READ-003: '+ Add More' is present but disabled by default @regression @manager @prod", async () => {
    await expect(esc.rideRequestAddMore).toBeVisible();
    await expect(esc.rideRequestAddMore).toHaveClass(/disabled/);
    await expect(esc.tripNotStartedAddMore).toBeVisible();
    await expect(esc.tripNotStartedAddMore).toHaveClass(/disabled/);
  });

  // ---------- Enable / disable ----------
  // Scope agreed with the owner: escalations fire in real time, so only the
  // enable/disable controls are automated, not saving a full rule. Toggles
  // alone don't save on staging (no request sent), so this checks the
  // control's behaviour, not persistence.

  test("ESC-CRUD-001: Both escalation toggles can be enabled and disabled @regression @manager", async () => {
    await esc.setRideRequestEnabled(true);
    await esc.setTripNotStartedEnabled(true);
    expect(await esc.isRideRequestEnabled()).toBe(true);
    expect(await esc.isTripNotStartedEnabled()).toBe(true);

    await esc.setRideRequestEnabled(false);
    await esc.setTripNotStartedEnabled(false);
    expect(await esc.isRideRequestEnabled()).toBe(false);
    expect(await esc.isTripNotStartedEnabled()).toBe(false);
  });
});
