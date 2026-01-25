import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
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

  // Clear auth state since these tests perform their own login
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);
    orgSettingsPage = new OrganizationSettingsPage(page);

    // Login as Manager
    await page.goto(`${baseUrl}/login`);
    await loginPage.login(managerCreds.email, managerCreds.password);
    await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });

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
});
