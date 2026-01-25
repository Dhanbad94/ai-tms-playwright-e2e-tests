import { test, expect } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { SettingsBasePage } from "../../pages/ASAP/settings-base.page";
import { UserManagementPage } from "../../pages/ASAP/user-management.page";
import {
  getCredentials,
  getBaseUrl,
  EXISTING_USERS,
  generateTestUser,
  TIMEOUTS,
} from "./fixtures/test-data";

test.describe("ASAP User Management Tests @asap @settings", () => {
  let loginPage: LoginPage;
  let settingsPage: SettingsBasePage;
  let userManagementPage: UserManagementPage;
  const baseUrl = getBaseUrl();
  const managerCreds = getCredentials("MANAGER");

  // Clear auth state since these tests perform their own login
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    test.skip(
      !managerCreds.email || !managerCreds.password,
      "Manager credentials not provided",
    );

    loginPage = new LoginPage(page);
    settingsPage = new SettingsBasePage(page);
    userManagementPage = new UserManagementPage(page);

    // Login as Manager
    await page.goto(`${baseUrl}/login`);
    await loginPage.login(managerCreds.email, managerCreds.password);
    await page.waitForURL("**/dashboard", { timeout: TIMEOUTS.navigation });

    // Navigate to Settings > User Management
    await settingsPage.navigateToSettings(baseUrl);
    await settingsPage.clickTab("User Management");
  });

  test.afterEach(async ({ page }) => {

    if (userManagementPage) {
      await userManagementPage.closeAnyOpenDialog().catch(() => {});
    }
    await page.context().clearCookies();
  });

  // ==================== READ OPERATIONS ====================

  test.describe("Read Operations @crud", () => {
    test("UM-R001: Verify User Management page loads @smoke @manager", async () => {
      await userManagementPage.verifyPageLoaded();
    });

    test("UM-R002: Verify users table headers @regression @manager", async () => {
      await userManagementPage.verifyUsersTableVisible();
    });

    test("UM-R003: Verify existing users displayed @smoke @manager", async () => {
      // Verify Manager user exists
      await userManagementPage.verifyUserExists(EXISTING_USERS.manager.email);

      // Verify Operator user exists
      await userManagementPage.verifyUserExists(EXISTING_USERS.operator.email);
    });

    test("UM-R004: Verify user search functionality @regression @manager", async () => {
      // Search for manager
      await userManagementPage.searchUser("manager");
      await userManagementPage.verifyUserExists(EXISTING_USERS.manager.email);

      // Clear search and verify all users visible
      await userManagementPage.clearSearch();
      await userManagementPage.verifyUsersExist();
    });

    test("UM-R005: Verify user role display @regression @manager", async () => {
      await userManagementPage.verifyUserRole(
        EXISTING_USERS.manager.email,
        "MANAGER",
      );
      await userManagementPage.verifyUserRole(
        EXISTING_USERS.operator.email,
        "OPERATOR",
      );
    });

    test("UM-R006: Verify user status display @regression @manager", async () => {
      await userManagementPage.verifyUserStatus(
        EXISTING_USERS.manager.email,
        "Active",
      );
      await userManagementPage.verifyUserStatus(
        EXISTING_USERS.operator.email,
        "Active",
      );
    });

    test("UM-R007: Verify table sorting by Name @regression @manager", async () => {
      await userManagementPage.sortByColumn("name");
      // Verify table is still visible after sorting
      await userManagementPage.verifyUsersTableVisible();
    });

    test("UM-R008: Verify table sorting by Role @regression @manager", async () => {
      await userManagementPage.sortByColumn("role");
      await userManagementPage.verifyUsersTableVisible();
    });

    test("UM-R009: Verify table sorting by Last Login @regression @manager", async () => {
      await userManagementPage.sortByColumn("lastLogin");
      await userManagementPage.verifyUsersTableVisible();
    });

    test("UM-R010: Verify table sorting by Status @regression @manager", async () => {
      await userManagementPage.sortByColumn("status");
      await userManagementPage.verifyUsersTableVisible();
    });

    test("UM-R011: Verify user data retrieval @regression @manager", async () => {
      const userData = await userManagementPage.getUserData(
        EXISTING_USERS.manager.email,
      );

      expect(userData.name).toContain("manager");
      expect(userData.email).toBe(EXISTING_USERS.manager.email);
      expect(userData.role).toBe("MANAGER");
      expect(userData.status).toContain("Active");
    });
  });

  // ==================== CREATE OPERATIONS ====================

  test.describe("Create Operations @crud", () => {
    test("UM-C001: Verify Add User button is visible @smoke @manager", async () => {
      await userManagementPage.verifyAddUserButtonEnabled();
    });

    test("UM-C002: Verify Add User dialog opens @smoke @manager", async () => {
      await userManagementPage.clickAddUser();
      await userManagementPage.verifyAddUserDialogVisible();
    });

    test("UM-C003: Verify role dropdown options @regression @manager", async ({
      page,
    }) => {
      await userManagementPage.clickAddUser();

      // Verify dropdown has Manager, Operator, Driver options
      const roleDropdown = page.getByRole("combobox", { name: "Select User" });
      await expect(roleDropdown).toBeVisible({ timeout: TIMEOUTS.short });

      // Check options exist
      await expect(
        page.getByRole("option", { name: "Manager" }),
      ).toBeAttached();
      await expect(
        page.getByRole("option", { name: "Operator" }),
      ).toBeAttached();
      await expect(page.getByRole("option", { name: "Driver" })).toBeAttached();
    });

    test("UM-C004: Verify Continue button disabled without email @regression @manager @negative", async ({
      page,
    }) => {
      await userManagementPage.clickAddUser();

      // Continue button should be disabled initially
      const continueButton = page.getByRole("button", { name: "Continue" });
      await expect(continueButton).toBeDisabled();
    });

    test("UM-C005: Verify Step 2 form fields @regression @manager", async ({
      page,
    }) => {
      await userManagementPage.clickAddUser();
      await userManagementPage.enterAddUserEmail("test@example.com");
      await userManagementPage.clickAddUserContinue();

      // Verify Step 2 fields are visible
      // Wait for the dialog to update to Step 2 (Save button appears)
      await expect(page.getByRole("button", { name: "Save" })).toBeVisible({
        timeout: TIMEOUTS.short,
      });

      // Verify the form contains the expected input fields
      // The dialog has a textbox for First Name and Last Name
      const dialog = page.getByRole("dialog");
      await expect(dialog.getByRole("textbox").nth(1)).toBeVisible({
        timeout: TIMEOUTS.short,
      }); // First Name input
      await expect(dialog.getByRole("textbox").nth(2)).toBeVisible({
        timeout: TIMEOUTS.short,
      }); // Last Name input
      await expect(
        dialog.getByRole("textbox", { name: "User Phone No." }),
      ).toBeVisible({ timeout: TIMEOUTS.short });
      await expect(
        dialog.getByRole("checkbox", { name: "Also add as Driver" }),
      ).toBeVisible({ timeout: TIMEOUTS.short });
    });

    test("UM-C006: Verify Cancel button closes dialog @regression @manager", async () => {
      await userManagementPage.clickAddUser();
      await userManagementPage.verifyAddUserDialogVisible();

      await userManagementPage.cancelAddUser();

      // Dialog should be closed
      await expect(userManagementPage.addUserDialog).not.toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    // Note: Actual user creation tests (UM-C007 to UM-C009) should be run carefully
    // as they modify data. Consider using test.skip for production environments.

    test.skip("UM-C007: Add new Operator user (Data Modification) @regression @manager", async () => {
      const testUser = generateTestUser("Operator");

      await userManagementPage.addUser(testUser);

      // Verify user was created
      await userManagementPage.waitForTableUpdate();
      await userManagementPage.verifyUserExists(testUser.email);

      // Cleanup: Delete the test user
      await userManagementPage.deleteUserViaActionMenu(testUser.email);
    });
  });

  // ==================== UPDATE OPERATIONS ====================

  test.describe("Update Operations @crud", () => {
    test("UM-U001: Verify action menu opens on click @smoke @manager", async () => {
      await userManagementPage.openUserActionMenu(
        EXISTING_USERS.operator.email,
      );

      // Verify menu options are visible
      await expect(userManagementPage.actionMenuEditLink).toBeVisible({
        timeout: TIMEOUTS.short,
      });
      await expect(userManagementPage.actionMenuDeleteLink).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("UM-U002: Verify Edit dialog opens @smoke @manager", async () => {
      await userManagementPage.clickEditUser(EXISTING_USERS.operator.email);
      await userManagementPage.verifyEditUserDialogVisible();
    });

    test("UM-U003: Verify Edit form displays current values @regression @manager", async ({
      page,
    }) => {
      await userManagementPage.clickEditUser(EXISTING_USERS.operator.email);

      // Verify pre-filled values
      const firstNameInput = page
        .locator("text=First Name")
        .locator("..")
        .getByRole("textbox");
      await expect(firstNameInput).toHaveValue("automation");

      const lastNameInput = page
        .locator("text=Last Name")
        .locator("..")
        .getByRole("textbox");
      await expect(lastNameInput).toHaveValue("operator");
    });

    test("UM-U004: Verify Update button is visible @regression @manager", async () => {
      await userManagementPage.clickEditUser(EXISTING_USERS.operator.email);

      await expect(userManagementPage.editUserUpdateButton).toBeVisible({
        timeout: TIMEOUTS.short,
      });
      await expect(userManagementPage.editUserUpdateButton).toBeEnabled();
    });

    test("UM-U005: Verify close button closes Edit dialog @regression @manager", async () => {
      await userManagementPage.clickEditUser(EXISTING_USERS.operator.email);
      await userManagementPage.verifyEditUserDialogVisible();

      await userManagementPage.closeEditUserDialog();

      await expect(userManagementPage.editUserDialog).not.toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("UM-U006: Verify Also add as Driver checkbox @regression @manager", async ({
      page,
    }) => {
      await userManagementPage.clickEditUser(EXISTING_USERS.operator.email);

      const checkbox = page.getByRole("checkbox", {
        name: "Also add as Driver",
      });
      await expect(checkbox).toBeVisible({ timeout: TIMEOUTS.short });
    });
  });

  // ==================== DELETE OPERATIONS ====================

  test.describe("Delete Operations @crud", () => {
    test("UM-D001: Verify Delete option in action menu @regression @manager", async () => {
      await userManagementPage.openUserActionMenu(
        EXISTING_USERS.operator.email,
      );

      await expect(userManagementPage.actionMenuDeleteLink).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    test("UM-D002: Verify Delete button in Edit dialog @regression @manager", async () => {
      await userManagementPage.clickEditUser(EXISTING_USERS.operator.email);

      await expect(userManagementPage.editUserDeleteButton).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });

    // Note: Actual delete tests should be skipped to avoid deleting important users
    test.skip("UM-D003: Delete user via action menu (Data Modification) @regression @manager", async () => {
      // This test should only run with test users that can be safely deleted
      const testUser = generateTestUser("Operator");

      // First create a test user
      await userManagementPage.addUser(testUser);
      await userManagementPage.waitForTableUpdate();

      // Then delete it
      await userManagementPage.deleteUserViaActionMenu(testUser.email);
      await userManagementPage.waitForTableUpdate();

      // Verify user is deleted
      await userManagementPage.verifyUserNotExists(testUser.email);
    });
  });

  // ==================== PASSWORD RESET ====================

  test.describe("Password Reset", () => {
    test("UM-P001: Verify Reset Password option in menu @regression @manager", async () => {
      await userManagementPage.openUserActionMenu(
        EXISTING_USERS.operator.email,
      );

      await expect(userManagementPage.actionMenuResetPasswordLink).toBeVisible({
        timeout: TIMEOUTS.short,
      });
    });
  });

  // ==================== CRUD LIFECYCLE TESTS (Create, Read, Update, Delete) ====================

  test.describe("CRUD Lifecycle Tests @crud @e2e", () => {
    // CRUD tests need longer timeout due to multiple operations
    test.setTimeout(90000);
    /**
     * Manager Role - Full CRUD Lifecycle Test
     * Creates a Manager user, reads data, edits user, and deletes user
     */
    test("UM-CRUD-001: Manager role - Create, Read, Update, Delete lifecycle @regression @manager", async ({
      page,
    }) => {
      const testUser = generateTestUser("Manager");
      const updatedFirstName = `Updated${Date.now()}`;
      const updatedLastName = `Manager${Date.now()}`;
      const updatedPhone = `555${String(Date.now()).slice(-7)}`;

      await test.step("CREATE: Add new Manager user", async () => {
        await userManagementPage.addUser(testUser);
        await userManagementPage.waitForTableUpdate();

        // Verify user was created and appears in table
        await userManagementPage.verifyUserExists(testUser.email);
      });

      await test.step("READ: Verify Manager user data in table", async () => {
        const userData = await userManagementPage.getUserData(testUser.email);

        expect(userData.email).toBe(testUser.email);
        expect(userData.name).toContain(testUser.firstName);
        expect(userData.name).toContain(testUser.lastName);
        expect(userData.role.toUpperCase()).toBe("MANAGER");
      });

      await test.step("UPDATE: Edit Manager user details", async () => {
        await userManagementPage.editUser(testUser.email, {
          firstName: updatedFirstName,
          lastName: updatedLastName,
          phone: updatedPhone,
        });
        await userManagementPage.waitForTableUpdate();

        // Refresh the page to ensure we get fresh data from server
        await page.reload();
        await userManagementPage.verifyPageLoaded();
        await userManagementPage.waitForTableUpdate();

        // Wait for the user row to be visible (ensures table is populated)
        await userManagementPage.verifyUserExists(testUser.email);

        // Verify updated data
        const updatedUserData = await userManagementPage.getUserData(
          testUser.email,
        );
        expect(updatedUserData.name).toContain(updatedFirstName);
        expect(updatedUserData.name).toContain(updatedLastName);
      });

      await test.step("DELETE: Remove Manager user", async () => {
        await userManagementPage.deleteUserViaActionMenu(testUser.email);
        await userManagementPage.waitForTableUpdate();

        // Verify user is deleted
        await userManagementPage.verifyUserNotExists(testUser.email);
      });
    });

    /**
     * Operator Role - Full CRUD Lifecycle Test with Reset Password
     * Creates an Operator user, reads data, edits user, resets password, and deletes user
     */
    test("UM-CRUD-002: Operator role - Create, Read, Update, Reset Password, Delete lifecycle @regression @manager", async ({
      page,
    }) => {
      const testUser = generateTestUser("Operator");
      const updatedFirstName = `Updated${Date.now()}`;
      const updatedLastName = `Operator${Date.now()}`;
      const updatedPhone = `555${String(Date.now()).slice(-7)}`;

      await test.step("CREATE: Add new Operator user", async () => {
        await userManagementPage.addUser(testUser);
        await userManagementPage.waitForTableUpdate();

        // Verify user was created and appears in table
        await userManagementPage.verifyUserExists(testUser.email);
      });

      await test.step("READ: Verify Operator user data in table", async () => {
        const userData = await userManagementPage.getUserData(testUser.email);

        expect(userData.email).toBe(testUser.email);
        expect(userData.name).toContain(testUser.firstName);
        expect(userData.name).toContain(testUser.lastName);
        expect(userData.role.toUpperCase()).toBe("OPERATOR");
      });

      await test.step("UPDATE: Edit Operator user details", async () => {
        await userManagementPage.editUser(testUser.email, {
          firstName: updatedFirstName,
          lastName: updatedLastName,
          phone: updatedPhone,
        });
        await userManagementPage.waitForTableUpdate();

        // Refresh the page to ensure we get fresh data from server
        await page.reload();
        await userManagementPage.verifyPageLoaded();
        await userManagementPage.waitForTableUpdate();

        // Wait for the user row to be visible (ensures table is populated)
        await userManagementPage.verifyUserExists(testUser.email);

        // Verify updated data
        const updatedUserData = await userManagementPage.getUserData(
          testUser.email,
        );
        expect(updatedUserData.name).toContain(updatedFirstName);
        expect(updatedUserData.name).toContain(updatedLastName);
      });

      await test.step("RESET PASSWORD: Reset Operator App Password", async () => {
        await userManagementPage.resetUserPassword(testUser.email);
        await userManagementPage.waitForTableUpdate();

        // Verify user still exists after password reset
        await userManagementPage.verifyUserExists(testUser.email);
      });

      await test.step("DELETE: Remove Operator user", async () => {
        await userManagementPage.deleteUserViaActionMenu(testUser.email);
        await userManagementPage.waitForTableUpdate();

        // Verify user is deleted
        await userManagementPage.verifyUserNotExists(testUser.email);
      });
    });

    /**
     * Driver Role - Full CRUD Lifecycle Test
     * Creates a Driver user, reads data, edits user, and deletes user
     */
    test("UM-CRUD-003: Driver role - Create, Read, Update, Delete lifecycle @regression @manager", async ({
      page,
    }) => {
      const testUser = generateTestUser("Driver");
      const updatedFirstName = `Updated${Date.now()}`;
      const updatedLastName = `Driver${Date.now()}`;
      const updatedPhone = `555${String(Date.now()).slice(-7)}`;
      // Driver role shows email as "N/A" in the table, so use name for identification
      const initialUserName = `${testUser.firstName} ${testUser.lastName}`;
      const updatedUserName = `${updatedFirstName} ${updatedLastName}`;

      await test.step("CREATE: Add new Driver user", async () => {
        await userManagementPage.addUser(testUser);
        await userManagementPage.waitForTableUpdate();

        // Driver role shows email as "N/A" in table, verify by name
        await userManagementPage.verifyUserExistsByName(initialUserName);
      });

      await test.step("READ: Verify Driver user data in table", async () => {
        const userData = await userManagementPage.getUserDataByName(
          initialUserName,
        );

        // Driver role shows email as "N/A" in table
        expect(userData.email).toBe("N/A");
        expect(userData.name).toContain(testUser.firstName);
        expect(userData.name).toContain(testUser.lastName);
        expect(userData.role.toUpperCase()).toBe("DRIVER");
      });

      await test.step("UPDATE: Edit Driver user details", async () => {
        await userManagementPage.editUserByName(initialUserName, {
          firstName: updatedFirstName,
          lastName: updatedLastName,
          phone: updatedPhone,
        });
        await userManagementPage.waitForTableUpdate();

        // Refresh the page to ensure we get fresh data from server
        await page.reload();
        await userManagementPage.verifyPageLoaded();
        await userManagementPage.waitForTableUpdate();

        // Verify updated name appears in table
        await userManagementPage.verifyUserExistsByName(updatedUserName);

        // Verify updated data
        const updatedUserData = await userManagementPage.getUserDataByName(
          updatedUserName,
        );
        expect(updatedUserData.name).toContain(updatedFirstName);
        expect(updatedUserData.name).toContain(updatedLastName);
      });

      await test.step("DELETE: Remove Driver user", async () => {
        await userManagementPage.deleteUserViaActionMenuByName(updatedUserName);
        await userManagementPage.waitForTableUpdate();

        // Verify user is deleted
        await userManagementPage.verifyUserNotExistsByName(updatedUserName);
      });
    });

    /**
     * Operator with "Also add as Driver" - Full CRUD Lifecycle Test
     * Creates an Operator user with Driver role, reads data, edits user, and deletes user
     */
    test("UM-CRUD-004: Operator with Also-Add-As-Driver - Create, Read, Update, Delete lifecycle @regression @manager", async ({
      page,
    }) => {
      const testUser = {
        ...generateTestUser("Operator"),
        alsoAddAsDriver: true,
      };
      const updatedFirstName = `Updated${Date.now()}`;
      const updatedLastName = `OpDriver${Date.now()}`;

      await test.step("CREATE: Add new Operator user with Also Add as Driver", async () => {
        await userManagementPage.addUser(testUser);
        await userManagementPage.waitForTableUpdate();

        // Verify user was created and appears in table
        await userManagementPage.verifyUserExists(testUser.email);
      });

      await test.step("READ: Verify Operator user data in table", async () => {
        const userData = await userManagementPage.getUserData(testUser.email);

        expect(userData.email).toBe(testUser.email);
        expect(userData.name).toContain(testUser.firstName);
        // With "Also add as Driver" enabled, role shows as "OPERATOR, DRIVER"
        expect(userData.role.toUpperCase()).toContain("OPERATOR");
        expect(userData.role.toUpperCase()).toContain("DRIVER");
      });

      await test.step("UPDATE: Edit Operator user details", async () => {
        await userManagementPage.editUser(testUser.email, {
          firstName: updatedFirstName,
          lastName: updatedLastName,
        });
        await userManagementPage.waitForTableUpdate();

        // Refresh the page to ensure we get fresh data from server
        await page.reload();
        await userManagementPage.verifyPageLoaded();
        await userManagementPage.waitForTableUpdate();

        // Wait for the user row to be visible (ensures table is populated)
        await userManagementPage.verifyUserExists(testUser.email);

        // Verify updated data
        const updatedUserData = await userManagementPage.getUserData(
          testUser.email,
        );
        expect(updatedUserData.name).toContain(updatedFirstName);
        expect(updatedUserData.name).toContain(updatedLastName);
      });

      await test.step("DELETE: Remove Operator user", async () => {
        await userManagementPage.deleteUserViaActionMenu(testUser.email);
        await userManagementPage.waitForTableUpdate();

        // Verify user is deleted
        await userManagementPage.verifyUserNotExists(testUser.email);
      });
    });

    /**
     * Role Change - Update user role from Operator to Manager
     */
    test("UM-CRUD-005: Role change - Create Operator, Update to Manager, Delete @regression @manager", async ({
      page,
    }) => {
      const testUser = generateTestUser("Operator");

      await test.step("CREATE: Add new Operator user", async () => {
        await userManagementPage.addUser(testUser);
        await userManagementPage.waitForTableUpdate();

        // Verify user was created as Operator
        await userManagementPage.verifyUserExists(testUser.email);
        const userData = await userManagementPage.getUserData(testUser.email);
        expect(userData.role.toUpperCase()).toBe("OPERATOR");
      });

      await test.step("UPDATE: Change role from Operator to Manager", async () => {
        await userManagementPage.editUser(testUser.email, {
          role: "Manager",
        });
        await userManagementPage.waitForTableUpdate();

        // Refresh the page to ensure we get fresh data from server
        await page.reload();
        await userManagementPage.verifyPageLoaded();
        await userManagementPage.waitForTableUpdate();

        // Wait for the user row to be visible (ensures table is populated)
        await userManagementPage.verifyUserExists(testUser.email);

        // Verify role was updated
        const updatedUserData = await userManagementPage.getUserData(
          testUser.email,
        );
        expect(updatedUserData.role.toUpperCase()).toBe("MANAGER");
      });

      await test.step("DELETE: Remove user", async () => {
        await userManagementPage.deleteUserViaActionMenu(testUser.email);
        await userManagementPage.waitForTableUpdate();

        // Verify user is deleted
        await userManagementPage.verifyUserNotExists(testUser.email);
      });
    });

    /**
     * Reset Password Test - Manager Role
     * Creates a Manager user and tests the Reset Password functionality
     */
    test("UM-CRUD-006: Reset Password - Create Manager, Reset Password, Delete @regression @manager", async ({
      page,
    }) => {
      const testUser = generateTestUser("Manager");

      await test.step("CREATE: Add new Manager user", async () => {
        await userManagementPage.addUser(testUser);
        await userManagementPage.waitForTableUpdate();

        // Verify user was created
        await userManagementPage.verifyUserExists(testUser.email);
      });

      await test.step("RESET PASSWORD: Reset Manager App Password", async () => {
        await userManagementPage.resetUserPassword(testUser.email);
        await userManagementPage.waitForTableUpdate();

        // Verify user still exists after password reset
        await userManagementPage.verifyUserExists(testUser.email);

        // Verify user data is intact
        const userData = await userManagementPage.getUserData(testUser.email);
        expect(userData.email).toBe(testUser.email);
        expect(userData.role.toUpperCase()).toBe("MANAGER");
      });

      await test.step("DELETE: Remove Manager user", async () => {
        await userManagementPage.deleteUserViaActionMenu(testUser.email);
        await userManagementPage.waitForTableUpdate();

        // Verify user is deleted
        await userManagementPage.verifyUserNotExists(testUser.email);
      });
    });
  });
});
