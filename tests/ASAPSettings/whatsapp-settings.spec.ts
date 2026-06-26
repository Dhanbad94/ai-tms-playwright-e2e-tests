import { test, expect } from "@playwright/test";
import { WhatsappSettingsPage } from "../../pages/ASAP/whatsapp-settings.page";
import { getBaseUrl, getCredentials } from "./fixtures/test-data";

/**
 * WhatsApp Notification settings (#settings_whatsapp).
 * Auth comes from the shared storageState (auth.setup) — no per-test login.
 * Mutating tests auto-restore the toggles to OFF (the default) in afterEach.
 */
test.describe("ASAP WhatsApp Notification Settings @asap @settings @whatsapp", () => {
  let wa: WhatsappSettingsPage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  test.skip(
    !managerCreds.email || !managerCreds.password,
    "Manager credentials not provided"
  );

  test.beforeEach(async ({ page }) => {
    wa = new WhatsappSettingsPage(page);
    await wa.open(baseUrl);
  });

  // Settings auto-save, so always leave staging in the default (all-off) state.
  test.afterEach(async () => {
    try {
      await wa.restoreToOff();
    } catch {
      /* page/context may already be closed */
    }
  });

  // ---------- Read ----------
  test("WA-NAV-001: WhatsApp tab loads with all three toggles @smoke @manager @prod", async () => {
    await expect(wa.heading).toBeVisible();
    // The toggles are styled switches whose <input> is visually hidden
    // (display:none), so assert they are present in the DOM, not "visible".
    await expect(wa.masterToggle).toBeAttached();
    await expect(wa.ridersToggle).toBeAttached();
    await expect(wa.driversToggle).toBeAttached();
  });

  test("WA-READ-001: Rider & Driver toggles are gated by the master toggle @regression @manager", async () => {
    if (await wa.isMasterEnabled()) await wa.setMaster(false);
    await expect(wa.ridersToggle).toBeDisabled();
    await expect(wa.driversToggle).toBeDisabled();
  });

  // ---------- Update / lifecycle (mutating, self-restoring) ----------
  test("WA-CRUD-001: Enabling WhatsApp enables the rider & driver toggles @crud @manager", async () => {
    await wa.setMaster(true);
    expect(await wa.isMasterEnabled()).toBe(true);
    await expect(wa.ridersToggle).toBeEnabled();
    await expect(wa.driversToggle).toBeEnabled();
  });

  test("WA-CRUD-002: Toggle rider & driver notifications on, then verify @crud @manager", async () => {
    await wa.setMaster(true);
    await wa.setRiders(true);
    await wa.setDrivers(true);
    expect(await wa.isRidersEnabled()).toBe(true);
    expect(await wa.isDriversEnabled()).toBe(true);
  });

  test("WA-CRUD-003: WhatsApp setting persists after a page reload @crud @regression @manager", async () => {
    await wa.setMaster(true);
    expect(await wa.isMasterEnabled()).toBe(true);
    await wa.open(baseUrl); // reload settings page
    expect(await wa.isMasterEnabled()).toBe(true);
  });

  test("WA-CRUD-004: Toggling WhatsApp ON and OFF each shows the success message @crud @manager", async () => {
    // Turn ON -> "Settings updated successfully." toast.
    await wa.setMaster(true);
    expect(await wa.isMasterEnabled()).toBe(true);
    await wa.expectSettingsSaved();

    // Let it auto-dismiss so the next save's toast is observed independently.
    await wa.expectToastDismissed();

    // Turn OFF -> the success toast appears again.
    await wa.setMaster(false);
    expect(await wa.isMasterEnabled()).toBe(false);
    await wa.expectSettingsSaved();
  });
});
