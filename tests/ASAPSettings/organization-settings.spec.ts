import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
// import { DispatchPage } from "../../pages/ASAP/dispatch.page";
import { SettingsBasePage } from "../../pages/ASAP/settings-base.page";
import { OrganizationSettingsPage } from "../../pages/ASAP/organization-settings.page";
import {
  getCredentials,
  getBaseUrl,
  ASAP_ORG_CONFIG,
  TIMEOUTS,
} from "./fixtures/test-data";

test.describe("ASAP Organization Settings Tests @asap @settings", () => {
  let loginPage: LoginPage;
  let settingsPage: SettingsBasePage;
  let orgSettingsPage: OrganizationSettingsPage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");


  test.beforeEach(async ({ page }) => {
    test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);
    orgSettingsPage = new OrganizationSettingsPage(page);


    // Navigate to Settings - Organization tab is default
    await settingsPage.navigateToSettings(baseUrl);
    await settingsPage.clickTab("Organization");
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  test("OS-001: Verify Organization Settings page loads @smoke @manager", async () => {
    await orgSettingsPage.verifyPageLoaded();
  });

  test("OS-002: Verify organization name display @smoke @manager", async ({ page }) => {
    const orgInfo = await orgSettingsPage.getOrganizationInfo();
    expect(orgInfo.name).toContain(ASAP_ORG_CONFIG.name);
  });

  test("OS-004: Verify tracking ID display @smoke @manager", async ({ page }) => {
    const orgInfo = await orgSettingsPage.getOrganizationInfo();
    expect(orgInfo.trackingId).toBe(ASAP_ORG_CONFIG.trackingId);
  });

  test("OS-005: Verify timezone display @regression @manager", async ({ page }) => {
    // Verify timezone text contains expected pattern
    await expect(page.getByText(/Time Zone\s?:/)).toBeVisible({ timeout: TIMEOUTS.short });
    await expect(page.getByText(/America.*Chicago/)).toBeVisible({ timeout: TIMEOUTS.short });
  });

  test("OS-007: Verify map is visible @smoke @manager", async () => {
    await orgSettingsPage.verifyMapIsVisible();
  });

  test("OS-008: Verify map zoom controls @regression @manager", async () => {
    await orgSettingsPage.verifyMapControlsVisible();

    // Test zoom in
    await orgSettingsPage.zoomInMap();

    // Test zoom out
    await orgSettingsPage.zoomOutMap();
  });

  test("OS-009: Verify map type switch (Map/Satellite) @regression @manager", async () => {
    // Switch to Satellite
    await orgSettingsPage.switchMapType("Satellite");
    await orgSettingsPage.verifyMapTypeSelected("Satellite");

    // Switch back to Map
    await orgSettingsPage.switchMapType("Map");
    await orgSettingsPage.verifyMapTypeSelected("Map");
  });

  test("OS-010: Verify edit organization button exists @regression @manager", async ({ page }) => {
    // Edit button should be visible (icon button)
    const editButton = page.getByRole("button", { name: "icon" }).first();
    await expect(editButton).toBeVisible({ timeout: TIMEOUTS.short });
  });

  // ---------- Organization Edit / Update (Org Name round-trip) ----------

  test("ORG-EDIT-001: Edit opens the Edit Organization modal pre-filled @smoke @manager", async () => {
    await orgSettingsPage.openEditModal();
    await expect(orgSettingsPage.editModalTitle).toBeVisible();
    await expect(orgSettingsPage.orgNameInput).not.toHaveValue("");
    await expect(orgSettingsPage.updateButton).toBeVisible();
    await orgSettingsPage.cancelEdit();
  });

  test("ORG-EDIT-002: Edit & update Organization Name succeeds and persists @crud @manager", async () => {
    const original = await orgSettingsPage.getDisplayedOrgName();
    const edited = `${original} QA`;
    try {
      // Edit -> Update -> success (modal closes)
      await orgSettingsPage.openEditModal();
      await orgSettingsPage.setOrgName(edited);
      await orgSettingsPage.clickUpdate();
      await orgSettingsPage.expectUpdateSuccess();

      // Persisted: reload the Organization settings and verify the new name
      await settingsPage.navigateToSettings(baseUrl);
      await settingsPage.clickTab("Organization");
      expect(await orgSettingsPage.getDisplayedOrgName()).toBe(edited);
    } finally {
      // Always restore the original organization name
      await orgSettingsPage.openEditModal();
      await orgSettingsPage.setOrgName(original);
      await orgSettingsPage.clickUpdate();
      await settingsPage.navigateToSettings(baseUrl);
      await settingsPage.clickTab("Organization");
      expect(await orgSettingsPage.getDisplayedOrgName()).toBe(original);
    }
  });

  test("ORG-EDIT-003: Clearing the required Organization Name does not save @negative @manager", async () => {
    const original = await orgSettingsPage.getDisplayedOrgName();
    await orgSettingsPage.openEditModal();
    await orgSettingsPage.orgNameInput.fill("");
    await orgSettingsPage.orgNameInput.dispatchEvent("keyup");
    await orgSettingsPage.orgNameInput.dispatchEvent("change");

    // The required name must not persist empty: either Update stays disabled,
    // or submitting keeps the modal open (validation) — nothing should save.
    if (await orgSettingsPage.updateButton.isEnabled()) {
      await orgSettingsPage.updateButton.click();
      await orgSettingsPage.page.waitForTimeout(1000);
    }
    if (await orgSettingsPage.editModal.isVisible()) {
      await orgSettingsPage.cancelEdit();
    }

    // The displayed name is unchanged after a reload
    await settingsPage.navigateToSettings(baseUrl);
    await settingsPage.clickTab("Organization");
    expect(await orgSettingsPage.getDisplayedOrgName()).toBe(original);
  });

  test("ORG-EDIT-004: Cancel closes the edit modal without saving @regression @manager", async () => {
    const original = await orgSettingsPage.getDisplayedOrgName();
    await orgSettingsPage.openEditModal();
    await orgSettingsPage.setOrgName(`${original} TEMP`);
    await orgSettingsPage.cancelEdit();
    await expect(orgSettingsPage.editModal).toBeHidden();
    expect(await orgSettingsPage.getDisplayedOrgName()).toBe(original);
  });

  // ---------- Manage CTA navigation ----------

  test("NAV-MANAGE-001: Manage CTA opens Settings with Organization active @smoke @manager", async ({ page }) => {
    await page.goto(`${baseUrl}/dashboard`, { waitUntil: "domcontentloaded" });
    await orgSettingsPage.clickManageCTA(baseUrl);
    await expect(page).toHaveURL(/\/setting/);
    // Organization is the default tab: its settings content is shown.
    await expect(
      page.getByRole("heading", { name: "Organization Settings" })
    ).toBeVisible({ timeout: 10000 });
  });
});

/**
 * End-to-end journey mirroring the documented flow:
 * Login -> Dispatch -> Manage -> Organization -> edit & update name -> success.
 * Logs in explicitly (own session), so it clears the shared storageState.
 */
test.describe("ASAP Organization Edit - End to End @asap @settings @e2e", () => {
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  test.use({ storageState: { cookies: [], origins: [] } });

  test.skip(
    !managerCreds.email || !managerCreds.password,
    "Manager credentials not provided"
  );

  test("ORG-E2E-001: Login -> Dispatch -> Manage -> edit Organization name -> Update -> success @e2e @crud @manager", async ({
    page,
  }) => {
    const loginPage = new LoginPage(page);
    // const dispatchPage = new DispatchPage(page);
    const settingsPage = new SettingsBasePage(page);
    const orgPage = new OrganizationSettingsPage(page);

    // 1. Login as Manager
    await page.goto(`${baseUrl}/login`, { waitUntil: "domcontentloaded" });
    await loginPage.login(managerCreds.email, managerCreds.password);
    await expect(page).toHaveURL(/dashboard/, { timeout: TIMEOUTS.navigation });

    // 2. Open the Dispatch sidebar
    // await dispatchPage.clickDispatchNavLink();

    // 3. Click the Manage CTA -> Settings
    await orgPage.clickManageCTA(baseUrl);
    await expect(page).toHaveURL(/\/setting/);

    // 4. Organization tab (default)
    await settingsPage.clickTab("Organization");
    await orgPage.verifyPageLoaded();

    // 5 & 6. Edit + Update Organization Name -> capture success
    const original = await orgPage.getDisplayedOrgName();
    const edited = `${original} QA`;
    try {
      await orgPage.openEditModal();
      await orgPage.setOrgName(edited);
      await orgPage.clickUpdate();
      await orgPage.expectUpdateSuccess();
    } finally {
      // Restore the original organization name
      await orgPage.openEditModal();
      await orgPage.setOrgName(original);
      await orgPage.clickUpdate();
    }
  });
});
