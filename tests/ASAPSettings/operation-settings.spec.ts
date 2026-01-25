import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { SettingsBasePage } from "../../pages/ASAP/settings-base.page";
import { OperationSettingsPage } from "../../pages/ASAP/operation-settings.page";
import {
  getCredentials,
  getBaseUrl,
  ASAP_OPERATION_DEFAULTS,
  TIMEOUTS,
} from "./fixtures/test-data";

test.describe("ASAP Operation Settings Tests @asap @settings", () => {
  let loginPage: LoginPage;
  let settingsPage: SettingsBasePage;
  let operationSettingsPage: OperationSettingsPage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  // Clear auth state since these tests perform their own login
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    test.skip(!managerCreds.email || !managerCreds.password, "Manager credentials not provided");

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);
    operationSettingsPage = new OperationSettingsPage(page);

    // Login as Manager
    await page.goto(`${baseUrl}/login`);
    await loginPage.login(managerCreds.email, managerCreds.password);
    await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });

    // Navigate to Settings > Operation Settings
    await settingsPage.navigateToSettings(baseUrl);
    await settingsPage.clickTab("Operation Settings");
  });

  test.afterEach(async ({ page }) => {
    await page.context().clearCookies();
  });

  // ==================== PAGE LOAD TESTS ====================

  test("OPS-001: Verify Operation Settings page loads @smoke @manager", async () => {
    await operationSettingsPage.verifyPageLoaded();
  });

  test("OPS-002: Verify all 5 accordion sections visible @smoke @manager", async () => {
    await operationSettingsPage.verifyAllSectionsVisible();
  });

  // ==================== PICK-UP TIME TESTS ====================

  test.describe("Pick-up Time Section", () => {
    test("OPS-003: Verify Pick-up Time section expands @regression @manager", async () => {
      await operationSettingsPage.expandSection("pickupTime");
      await expect(operationSettingsPage.asapPickupRadio).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("OPS-004: Verify ASAP Pickup is default selected @smoke @manager", async () => {
      await operationSettingsPage.expandSection("pickupTime");
      await operationSettingsPage.verifyAsapPickupSelected();
    });

    test("OPS-005: Verify Future Pickup option exists @regression @manager", async () => {
      await operationSettingsPage.expandSection("pickupTime");
      await expect(operationSettingsPage.futurePickupRadio).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("OPS-006: Verify Both ASAP & Future option exists @regression @manager", async () => {
      await operationSettingsPage.expandSection("pickupTime");
      await expect(operationSettingsPage.bothPickupRadio).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("OPS-007: Verify current pickup time setting matches ASAP default @regression @manager", async () => {
      await operationSettingsPage.expandSection("pickupTime");
      const setting = await operationSettingsPage.getPickupTimeSetting();
      expect(setting).toBe(ASAP_OPERATION_DEFAULTS.pickupTime);
    });
  });

  // ==================== PICK-UP STOPS TESTS ====================

  test.describe("Pick-up Stops Section", () => {
    test("OPS-008: Verify Pick-up Stops section expands @regression @manager", async () => {
      await operationSettingsPage.expandSection("pickupStops");
      await expect(operationSettingsPage.predefinedStopsOnlyRadio).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("OPS-009: Verify Pre-Defined Stops Only option @regression @manager", async () => {
      await operationSettingsPage.expandSection("pickupStops");
      await expect(operationSettingsPage.predefinedStopsOnlyRadio).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("OPS-010: Verify Pre-Defined + Service Area option @regression @manager", async () => {
      await operationSettingsPage.expandSection("pickupStops");
      await expect(operationSettingsPage.predefinedPlusServiceAreaRadio).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("OPS-011: Verify Add Service Area link exists @regression @manager", async () => {
      await operationSettingsPage.expandSection("pickupStops");
      await expect(operationSettingsPage.addServiceAreaLink).toBeVisible({ timeout: TIMEOUTS.short });
    });
  });

  // ==================== RIDE SHARING TESTS ====================

  test.describe("Ride Sharing Section", () => {
    test("OPS-012: Verify Ride Sharing section expands @regression @manager", async () => {
      await operationSettingsPage.expandSection("rideSharing");
      await expect(operationSettingsPage.sharedRidesRadio).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("OPS-013: Verify Shared Rides option selected (ASAP default) @smoke @manager", async () => {
      await operationSettingsPage.expandSection("rideSharing");
      await operationSettingsPage.verifySharedRidesSelected();
    });

    test("OPS-014: Verify Private Rides option exists @regression @manager", async () => {
      await operationSettingsPage.expandSection("rideSharing");
      await expect(operationSettingsPage.privateRidesRadio).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("OPS-015: Verify current ride sharing setting matches ASAP default @regression @manager", async () => {
      await operationSettingsPage.expandSection("rideSharing");
      const setting = await operationSettingsPage.getRideSharingSetting();
      expect(setting).toBe(ASAP_OPERATION_DEFAULTS.rideSharing);
    });
  });

  // ==================== DRIVER ASSIGNMENT TESTS ====================

  test.describe("Driver Assignment Section", () => {
    test("OPS-016: Verify Driver Assignment section expands @regression @manager", async () => {
      await operationSettingsPage.expandSection("driverAssignment");
      await expect(operationSettingsPage.operatorAssignmentRadio).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("OPS-017: Verify Operator Assignment option exists @regression @manager", async () => {
      await operationSettingsPage.expandSection("driverAssignment");
      await expect(operationSettingsPage.operatorAssignmentRadio).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("OPS-018: Verify Driver Self-Assignment option exists @regression @manager", async () => {
      await operationSettingsPage.expandSection("driverAssignment");
      await expect(operationSettingsPage.driverSelfAssignmentRadio).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("OPS-019: Verify current driver assignment setting @regression @manager", async () => {
      await operationSettingsPage.expandSection("driverAssignment");
      const setting = await operationSettingsPage.getDriverAssignmentSetting();
      expect(setting).toBe(ASAP_OPERATION_DEFAULTS.driverAssignment);
    });
  });

  // ==================== SHUTTLE CAPACITY TESTS ====================

  test.describe("Shuttle Capacity Section", () => {
    test("OPS-020: Verify Shuttle Capacity section expands @regression @manager", async () => {
      await operationSettingsPage.expandSection("shuttleCapacity");
      await expect(operationSettingsPage.staticCapacityRadio).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("OPS-021: Verify Static Capacity selected (ASAP default) @smoke @manager", async () => {
      await operationSettingsPage.expandSection("shuttleCapacity");
      await operationSettingsPage.verifyStaticCapacitySelected();
    });

    test("OPS-022: Verify Dynamic Capacity option exists @regression @manager", async () => {
      await operationSettingsPage.expandSection("shuttleCapacity");
      await expect(operationSettingsPage.dynamicCapacityRadio).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("OPS-023: Verify current shuttle capacity setting @regression @manager", async () => {
      await operationSettingsPage.expandSection("shuttleCapacity");
      const setting = await operationSettingsPage.getShuttleCapacitySetting();
      expect(setting).toBe(ASAP_OPERATION_DEFAULTS.shuttleCapacity);
    });

    test("OPS-024: Verify Max Riders input is visible @regression @manager", async ({ page }) => {
      await operationSettingsPage.expandSection("shuttleCapacity");
      // Verify Maximum Number of Riders text and input
      await expect(page.getByText("Maximum Number of Riders")).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("OPS-025: Verify Max Riders value can be retrieved @regression @manager", async () => {
      await operationSettingsPage.expandSection("shuttleCapacity");
      const maxRiders = await operationSettingsPage.getMaxRidersValue();
      expect(maxRiders).toBeTruthy();
    });
  });
});
