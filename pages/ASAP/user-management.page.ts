import { Page, Locator, expect } from "@playwright/test";

/**
 * User Management Page Object
 * Settings Tab: User Management
 * URL Hash: #members
 *
 * Supports CRUD operations for users:
 * - Create: Add new users (Manager, Operator, Driver)
 * - Read: View user list, search users
 * - Update: Edit user details, change role
 * - Delete: Remove users from organization
 */
export class UserManagementPage {
  readonly page: Page;

  // Page Heading
  readonly pageHeading: Locator;
  readonly usersHeading: Locator;

  // Action Buttons
  readonly addUserButton: Locator;

  // Search
  readonly searchBox: Locator;

  // Users Table
  readonly usersTable: Locator;
  readonly tableBody: Locator;
  readonly tableHeaders: {
    name: Locator;
    email: Locator;
    role: Locator;
    phone: Locator;
    lastLogin: Locator;
    status: Locator;
    action: Locator;
  };

  // Add User Dialog - Step 1 (Role & Email)
  readonly addUserDialog: Locator;
  readonly addUserDialogHeading: Locator;
  readonly addUserRoleDropdown: Locator;
  readonly addUserRoleButton: Locator;
  readonly addUserEmailInput: Locator;
  readonly addUserCancelButton: Locator;
  readonly addUserContinueButton: Locator;

  // Add User Dialog - Step 2 (Full Form)
  readonly addUserFirstNameInput: Locator;
  readonly addUserLastNameInput: Locator;
  readonly addUserPhoneCountryDropdown: Locator;
  readonly addUserPhoneInput: Locator;
  readonly addUserAlsoAddAsDriverCheckbox: Locator;
  readonly addUserSaveButton: Locator;

  // Edit User Dialog
  readonly editUserDialog: Locator;
  readonly editUserDialogHeading: Locator;
  readonly editUserCloseButton: Locator;
  readonly editUserRoleDropdown: Locator;
  readonly editUserFirstNameInput: Locator;
  readonly editUserLastNameInput: Locator;
  readonly editUserEmailInput: Locator;
  readonly editUserPhoneCountryDropdown: Locator;
  readonly editUserPhoneInput: Locator;
  readonly editUserAlsoAddAsDriverCheckbox: Locator;
  readonly editUserUpdateButton: Locator;
  readonly editUserDeleteButton: Locator;

  // Action Menu (tooltip)
  readonly actionMenuTooltip: Locator;
  readonly actionMenuEditLink: Locator;
  readonly actionMenuResetPasswordLink: Locator;
  readonly actionMenuDeleteLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Headings
    this.pageHeading = page.getByRole("heading", { name: "User Management", level: 2 });
    this.usersHeading = page.getByRole("heading", { name: "Users", level: 4 });

    // Add User Button
    this.addUserButton = page.getByRole("button", { name: "ADD USER" });

    // Search box
    this.searchBox = page.getByRole("searchbox");

    // Users table
    this.usersTable = page.getByRole("table").first();
    this.tableBody = page.locator("tbody");

    // Table headers - Note: Headers have accessible names like "Name: activate to sort column..."
    // Using locator with text content instead of role name for better matching
    this.tableHeaders = {
      name: page.locator("th").filter({ hasText: /^Name/ }).first(),
      email: page.locator("th").filter({ hasText: "Email Address" }).first(),
      role: page.locator("th").filter({ hasText: /^Role/ }).first(),
      phone: page.locator("th").filter({ hasText: "Phone No." }).first(),
      lastLogin: page.locator("th").filter({ hasText: /Last Login/ }).first(),
      status: page.locator("th").filter({ hasText: /^Status/ }).first(),
      action: page.locator("th").filter({ hasText: /^Action/ }).first(),
    };

    // Add User Dialog - Step 1
    this.addUserDialog = page.getByRole("dialog");
    this.addUserDialogHeading = page.getByRole("heading", { name: "Add User", level: 4 });
    this.addUserRoleDropdown = page.getByRole("combobox", { name: "Select User" });
    this.addUserRoleButton = page.getByRole("button").filter({ hasText: /Manager|Operator|Driver/ });
    this.addUserEmailInput = this.addUserDialog.getByRole("textbox").first();
    this.addUserCancelButton = page.getByRole("button", { name: "Cancel" });
    this.addUserContinueButton = page.getByRole("button", { name: "Continue" });

    // Add User Dialog - Step 2
    this.addUserFirstNameInput = this.addUserDialog.locator("text=First Name").locator("..").getByRole("textbox");
    this.addUserLastNameInput = this.addUserDialog.locator("text=Last Name").locator("..").getByRole("textbox");
    this.addUserPhoneCountryDropdown = this.addUserDialog.getByRole("combobox").filter({ hasText: /\+\d+/ });
    this.addUserPhoneInput = page.getByRole("textbox", { name: "User Phone No." });
    this.addUserAlsoAddAsDriverCheckbox = page.getByRole("checkbox", { name: "Also add as Driver" });
    this.addUserSaveButton = page.getByRole("button", { name: "Save" });

    // Edit User Dialog
    this.editUserDialog = page.getByRole("dialog");
    this.editUserDialogHeading = page.getByRole("heading", { name: "Edit User", level: 4 });
    this.editUserCloseButton = this.editUserDialog.getByRole("button").first();
    this.editUserRoleDropdown = this.editUserDialog.getByRole("combobox").first();
    this.editUserFirstNameInput = this.editUserDialog.locator("text=First Name").locator("..").getByRole("textbox");
    this.editUserLastNameInput = this.editUserDialog.locator("text=Last Name").locator("..").getByRole("textbox");
    this.editUserEmailInput = page.getByRole("textbox", { name: "Email (optional)" });
    this.editUserPhoneCountryDropdown = this.editUserDialog.getByRole("combobox").filter({ hasText: /\+\d+/ });
    this.editUserPhoneInput = this.editUserDialog.locator("text=Phone").locator("..").getByRole("textbox").last();
    this.editUserAlsoAddAsDriverCheckbox = this.editUserDialog.getByRole("checkbox", { name: "Also add as Driver" });
    this.editUserUpdateButton = page.getByRole("button", { name: "Update" });
    this.editUserDeleteButton = this.editUserDialog.getByRole("button", { name: "Delete" });

    // Action Menu
    this.actionMenuTooltip = page.getByRole("tooltip");
    this.actionMenuEditLink = page.getByRole("link", { name: /edit-pencil Edit/i });
    // Reset Password link can be "Reset Operator App Password", "Reset Manager App Password", etc.
    this.actionMenuResetPasswordLink = page.getByRole("link", { name: /Reset.*App.*Password/i });
    this.actionMenuDeleteLink = page.getByRole("link", { name: /delete Delete/i });
  }

  // ==================== PAGE VERIFICATION METHODS ====================

  /**
   * Verify user management page is loaded
   */
  async verifyPageLoaded(): Promise<void> {
    await expect(this.pageHeading).toBeVisible({ timeout: 10000 });
    await expect(this.usersHeading).toBeVisible({ timeout: 5000 });
    await expect(this.addUserButton).toBeVisible({ timeout: 5000 });
  }

  /**
   * Verify users table is displayed with headers
   */
  async verifyUsersTableVisible(): Promise<void> {
    await expect(this.usersTable).toBeVisible({ timeout: 10000 });
    await expect(this.tableHeaders.name).toBeVisible();
    await expect(this.tableHeaders.email).toBeVisible();
    await expect(this.tableHeaders.role).toBeVisible();
  }

  /**
   * Verify Add User button is enabled
   */
  async verifyAddUserButtonEnabled(): Promise<void> {
    await expect(this.addUserButton).toBeEnabled();
  }

  // ==================== CREATE (ADD USER) METHODS ====================

  /**
   * Click Add User button to open dialog
   */
  async clickAddUser(): Promise<void> {
    await this.addUserButton.click();
    await expect(this.addUserDialog).toBeVisible({ timeout: 5000 });
  }

  /**
   * Select role in Add User dialog (Step 1)
   */
  async selectAddUserRole(role: "Manager" | "Operator" | "Driver"): Promise<void> {
    await this.addUserRoleDropdown.selectOption(role);
    // Playwright auto-waits for actions
  }

  /**
   * Enter email in Add User dialog (Step 1)
   */
  async enterAddUserEmail(email: string): Promise<void> {
    await this.addUserEmailInput.fill(email);
    // Playwright auto-waits for actions
  }

  /**
   * Click Continue to proceed to Step 2
   */
  async clickAddUserContinue(): Promise<void> {
    await expect(this.addUserContinueButton).toBeEnabled({ timeout: 5000 });
    await this.addUserContinueButton.click();
    // Wait for UI to update after action
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  }

  /**
   * Fill Add User form (Step 2)
   */
  async fillAddUserForm(userData: {
    firstName: string;
    lastName: string;
    phone: string;
    alsoAddAsDriver?: boolean;
  }): Promise<void> {
    await this.addUserFirstNameInput.fill(userData.firstName);
    await this.addUserLastNameInput.fill(userData.lastName);

    // Phone input may be readonly for Driver role - check if editable before filling
    const isPhoneEditable = await this.addUserPhoneInput.isEditable();
    if (isPhoneEditable) {
      await this.addUserPhoneInput.fill(userData.phone);
    } else {
      // For readonly inputs (e.g., Driver role), use JavaScript to set the value
      await this.addUserPhoneInput.evaluate(
        (el: HTMLInputElement, value: string) => {
          el.value = value;
          el.dispatchEvent(new Event("input", { bubbles: true }));
          el.dispatchEvent(new Event("change", { bubbles: true }));
        },
        userData.phone
      );
    }

    if (userData.alsoAddAsDriver) {
      // The checkbox may be outside viewport in the dialog
      // First try to scroll it into view
      await this.addUserAlsoAddAsDriverCheckbox.scrollIntoViewIfNeeded();
      // Playwright auto-waits for actions

      const isChecked = await this.addUserAlsoAddAsDriverCheckbox.isChecked();
      if (!isChecked) {
        // Try using JavaScript to click if element is outside viewport
        try {
          await this.addUserAlsoAddAsDriverCheckbox.click({ timeout: 3000 });
        } catch {
          // If normal click fails, use JavaScript to check the checkbox
          await this.addUserAlsoAddAsDriverCheckbox.evaluate(
            (el: HTMLInputElement) => {
              el.click();
              if (!el.checked) {
                el.checked = true;
                el.dispatchEvent(new Event("change", { bubbles: true }));
              }
            }
          );
        }
      }
    }
    // Playwright auto-waits for actions
  }

  /**
   * Click Save to create user
   */
  async clickAddUserSave(): Promise<void> {
    await this.addUserSaveButton.click();
    // Wait for the dialog to close after save
    await expect(this.addUserDialog).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Cancel Add User dialog
   */
  async cancelAddUser(): Promise<void> {
    await this.addUserCancelButton.click();
    await expect(this.addUserDialog).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Complete Add User flow
   */
  async addUser(userData: {
    role: "Manager" | "Operator" | "Driver";
    email: string;
    firstName: string;
    lastName: string;
    phone: string;
    alsoAddAsDriver?: boolean;
  }): Promise<void> {
    await this.clickAddUser();
    await this.selectAddUserRole(userData.role);
    await this.enterAddUserEmail(userData.email);
    await this.clickAddUserContinue();

    const formData: {
      firstName: string;
      lastName: string;
      phone: string;
      alsoAddAsDriver?: boolean;
    } = {
      firstName: userData.firstName,
      lastName: userData.lastName,
      phone: userData.phone,
    };

    if (userData.alsoAddAsDriver !== undefined) {
      formData.alsoAddAsDriver = userData.alsoAddAsDriver;
    }

    await this.fillAddUserForm(formData);
    await this.clickAddUserSave();
  }

  /**
   * Verify Add User dialog is visible
   */
  async verifyAddUserDialogVisible(): Promise<void> {
    await expect(this.addUserDialog).toBeVisible({ timeout: 5000 });
    await expect(this.addUserDialogHeading).toBeVisible({ timeout: 5000 });
  }

  // ==================== READ (SEARCH & VIEW) METHODS ====================

  /**
   * Search for a user
   */
  async searchUser(searchTerm: string): Promise<void> {
    await this.searchBox.fill(searchTerm);
    // Wait for UI to update after action
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  }

  /**
   * Clear search box
   */
  async clearSearch(): Promise<void> {
    await this.searchBox.clear();
    // Wait for UI to update after action
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  }

  /**
   * Get all user rows from the table
   */
  async getUserRows(): Promise<Locator[]> {
    return await this.tableBody.getByRole("row").all();
  }

  /**
   * Get user count from table
   */
  async getUserCount(): Promise<number> {
    const rows = await this.tableBody.getByRole("row").all();
    return rows.length;
  }

  /**
   * Find user row by email
   */
  getUserRowByEmail(email: string): Locator {
    return this.page.getByRole("row").filter({ hasText: email });
  }

  /**
   * Find user row by name
   */
  getUserRowByName(name: string): Locator {
    return this.page.getByRole("row").filter({ hasText: name });
  }

  /**
   * Verify user exists in table by email
   */
  async verifyUserExists(email: string): Promise<void> {
    const userRow = this.getUserRowByEmail(email);
    await expect(userRow).toBeVisible({ timeout: 15000 });
  }

  /**
   * Verify user exists in table by name
   * Useful for Driver role where email shows as "N/A"
   */
  async verifyUserExistsByName(name: string): Promise<void> {
    const userRow = this.getUserRowByName(name);
    await expect(userRow).toBeVisible({ timeout: 15000 });
  }

  /**
   * Verify user does not exist in table
   */
  async verifyUserNotExists(email: string): Promise<void> {
    const userRow = this.getUserRowByEmail(email);
    await expect(userRow).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Verify user does not exist in table by name
   */
  async verifyUserNotExistsByName(name: string): Promise<void> {
    const userRow = this.getUserRowByName(name);
    await expect(userRow).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Get user data from a specific row
   */
  async getUserData(email: string): Promise<{
    name: string;
    email: string;
    role: string;
    phone: string;
    lastLogin: string;
    status: string;
  }> {
    const row = this.getUserRowByEmail(email);
    const cells = await row.getByRole("cell").all();

    return {
      name: ((await cells[0]?.textContent()) || "").trim(),
      email: ((await cells[1]?.textContent()) || "").trim(),
      role: ((await cells[2]?.textContent()) || "").trim(),
      phone: ((await cells[3]?.textContent()) || "").trim(),
      lastLogin: ((await cells[4]?.textContent()) || "").trim(),
      status: ((await cells[5]?.textContent()) || "").trim(),
    };
  }

  /**
   * Get user data from a specific row by name
   * Useful for Driver role where email shows as "N/A"
   */
  async getUserDataByName(name: string): Promise<{
    name: string;
    email: string;
    role: string;
    phone: string;
    lastLogin: string;
    status: string;
  }> {
    const row = this.getUserRowByName(name);
    const cells = await row.getByRole("cell").all();

    return {
      name: ((await cells[0]?.textContent()) || "").trim(),
      email: ((await cells[1]?.textContent()) || "").trim(),
      role: ((await cells[2]?.textContent()) || "").trim(),
      phone: ((await cells[3]?.textContent()) || "").trim(),
      lastLogin: ((await cells[4]?.textContent()) || "").trim(),
      status: ((await cells[5]?.textContent()) || "").trim(),
    };
  }

  /**
   * Verify user role
   */
  async verifyUserRole(email: string, expectedRole: string): Promise<void> {
    const userData = await this.getUserData(email);
    expect(userData.role.toUpperCase()).toBe(expectedRole.toUpperCase());
  }

  /**
   * Verify user status
   */
  async verifyUserStatus(email: string, expectedStatus: "Active" | "Inactive"): Promise<void> {
    const userData = await this.getUserData(email);
    expect(userData.status).toContain(expectedStatus);
  }

  /**
   * Sort table by column (click column header)
   */
  async sortByColumn(column: "name" | "role" | "lastLogin" | "status"): Promise<void> {
    const header = this.tableHeaders[column];
    await header.click();
    // Wait for UI to update after action
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  }

  // ==================== UPDATE (EDIT USER) METHODS ====================

  /**
   * Open action menu for a user by email
   */
  async openUserActionMenu(email: string): Promise<void> {
    const row = this.getUserRowByEmail(email);
    const actionButton = row.getByRole("cell").last().getByRole("img");
    await actionButton.click();
    await expect(this.actionMenuTooltip).toBeVisible({ timeout: 5000 });
  }

  /**
   * Open action menu for a user by name
   * Useful for Driver role where email shows as "N/A"
   */
  async openUserActionMenuByName(name: string): Promise<void> {
    const row = this.getUserRowByName(name);
    const actionButton = row.getByRole("cell").last().getByRole("img");
    await actionButton.click();
    await expect(this.actionMenuTooltip).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click Edit from action menu
   */
  async clickEditFromActionMenu(): Promise<void> {
    await this.actionMenuEditLink.click();
    await expect(this.editUserDialog).toBeVisible({ timeout: 5000 });
  }

  /**
   * Click Edit button for a specific user (opens action menu and clicks Edit)
   */
  async clickEditUser(email: string): Promise<void> {
    await this.openUserActionMenu(email);
    await this.clickEditFromActionMenu();
  }

  /**
   * Verify Edit User dialog is visible
   */
  async verifyEditUserDialogVisible(): Promise<void> {
    await expect(this.editUserDialog).toBeVisible({ timeout: 5000 });
    await expect(this.editUserDialogHeading).toBeVisible({ timeout: 5000 });
  }

  /**
   * Get current values from Edit User dialog
   */
  async getEditUserFormValues(): Promise<{
    role: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  }> {
    const role = await this.editUserRoleDropdown.inputValue();
    const firstName = await this.editUserFirstNameInput.inputValue();
    const lastName = await this.editUserLastNameInput.inputValue();
    const email = await this.editUserEmailInput.inputValue();
    const phone = await this.editUserPhoneInput.inputValue();

    return { role, firstName, lastName, email, phone };
  }

  /**
   * Update user role in Edit dialog
   */
  async updateUserRole(role: "Manager" | "Operator" | "Driver"): Promise<void> {
    await this.editUserRoleDropdown.selectOption(role);
    // Playwright auto-waits for actions
  }

  /**
   * Update user first name in Edit dialog
   */
  async updateUserFirstName(firstName: string): Promise<void> {
    await this.editUserFirstNameInput.clear();
    await this.editUserFirstNameInput.fill(firstName);
    // Playwright auto-waits for actions
  }

  /**
   * Update user last name in Edit dialog
   */
  async updateUserLastName(lastName: string): Promise<void> {
    await this.editUserLastNameInput.clear();
    await this.editUserLastNameInput.fill(lastName);
    // Playwright auto-waits for actions
  }

  /**
   * Update user phone in Edit dialog
   */
  async updateUserPhone(phone: string): Promise<void> {
    await this.editUserPhoneInput.clear();
    await this.editUserPhoneInput.fill(phone);
    // Playwright auto-waits for actions
  }

  /**
   * Toggle "Also add as Driver" checkbox in Edit dialog
   */
  async toggleAlsoAddAsDriver(): Promise<void> {
    await this.editUserAlsoAddAsDriverCheckbox.click();
    // Playwright auto-waits for actions
  }

  /**
   * Click Update button in Edit dialog
   */
  async clickUpdateUser(): Promise<void> {
    await this.editUserUpdateButton.click();
    // Wait for the dialog to close after update
    await expect(this.editUserDialog).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Close Edit User dialog
   */
  async closeEditUserDialog(): Promise<void> {
    await this.editUserCloseButton.click();
    await expect(this.editUserDialog).not.toBeVisible({ timeout: 5000 });
  }

  /**
   * Complete Edit User flow
   */
  async editUser(
    email: string,
    updates: {
      role?: "Manager" | "Operator" | "Driver";
      firstName?: string;
      lastName?: string;
      phone?: string;
      alsoAddAsDriver?: boolean;
    }
  ): Promise<void> {
    await this.clickEditUser(email);

    // Wait for edit dialog to be fully loaded
    await this.verifyEditUserDialogVisible();
    // Wait for UI to update after action
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

    if (updates.role) {
      await this.updateUserRole(updates.role);
    }
    if (updates.firstName) {
      await this.updateUserFirstName(updates.firstName);
    }
    if (updates.lastName) {
      await this.updateUserLastName(updates.lastName);
    }
    if (updates.phone) {
      await this.updateUserPhone(updates.phone);
    }
    if (updates.alsoAddAsDriver !== undefined) {
      const isChecked = await this.editUserAlsoAddAsDriverCheckbox.isChecked();
      if (isChecked !== updates.alsoAddAsDriver) {
        await this.toggleAlsoAddAsDriver();
      }
    }

    await this.clickUpdateUser();
  }

  /**
   * Complete Edit User flow by name
   * Useful for Driver role where email shows as "N/A"
   */
  async editUserByName(
    name: string,
    updates: {
      role?: "Manager" | "Operator" | "Driver";
      firstName?: string;
      lastName?: string;
      phone?: string;
      alsoAddAsDriver?: boolean;
    }
  ): Promise<void> {
    await this.openUserActionMenuByName(name);
    await this.clickEditFromActionMenu();

    // Wait for edit dialog to be fully loaded
    await this.verifyEditUserDialogVisible();
    // Wait for UI to update after action
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});

    if (updates.role) {
      await this.updateUserRole(updates.role);
    }
    if (updates.firstName) {
      await this.updateUserFirstName(updates.firstName);
    }
    if (updates.lastName) {
      await this.updateUserLastName(updates.lastName);
    }
    if (updates.phone) {
      await this.updateUserPhone(updates.phone);
    }
    if (updates.alsoAddAsDriver !== undefined) {
      const isChecked = await this.editUserAlsoAddAsDriverCheckbox.isChecked();
      if (isChecked !== updates.alsoAddAsDriver) {
        await this.toggleAlsoAddAsDriver();
      }
    }

    await this.clickUpdateUser();
  }

  // ==================== DELETE METHODS ====================

  /**
   * Click Delete from action menu
   */
  async clickDeleteFromActionMenu(): Promise<void> {
    await this.actionMenuDeleteLink.click();
    // Wait for UI to update after action
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  }

  /**
   * Click Delete button in Edit dialog
   */
  async clickDeleteInEditDialog(): Promise<void> {
    await this.editUserDeleteButton.click();
    // Wait for UI to update after action
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  }

  /**
   * Delete user via action menu by email
   */
  async deleteUserViaActionMenu(email: string): Promise<void> {
    await this.openUserActionMenu(email);
    await this.clickDeleteFromActionMenu();

    // Handle delete confirmation dialog
    const deleteConfirmButton = this.page.getByRole("button", { name: "DELETE" });
    await expect(deleteConfirmButton).toBeVisible({ timeout: 5000 });
    await deleteConfirmButton.click();

    // Wait for dialog to close
    await expect(this.page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Delete user via action menu by name
   * Useful for Driver role where email shows as "N/A"
   */
  async deleteUserViaActionMenuByName(name: string): Promise<void> {
    await this.openUserActionMenuByName(name);
    await this.clickDeleteFromActionMenu();

    // Handle delete confirmation dialog
    const deleteConfirmButton = this.page.getByRole("button", { name: "DELETE" });
    await expect(deleteConfirmButton).toBeVisible({ timeout: 5000 });
    await deleteConfirmButton.click();

    // Wait for dialog to close
    await expect(this.page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });
  }

  /**
   * Delete user via Edit dialog
   */
  async deleteUserViaEditDialog(email: string): Promise<void> {
    await this.clickEditUser(email);
    await this.clickDeleteInEditDialog();

    // Handle delete confirmation dialog
    const deleteConfirmButton = this.page.getByRole("button", { name: "DELETE" });
    await expect(deleteConfirmButton).toBeVisible({ timeout: 5000 });
    await deleteConfirmButton.click();

    // Wait for dialog to close
    await expect(this.page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });
  }

  // ==================== PASSWORD RESET METHODS ====================

  /**
   * Click Reset Password from action menu
   */
  async clickResetPasswordFromActionMenu(): Promise<void> {
    await this.actionMenuResetPasswordLink.click();
    // Wait for UI to update after action
    await this.page.waitForLoadState('networkidle', { timeout: 3000 }).catch(() => {});
  }

  /**
   * Reset user password via action menu by email
   * The Reset Password dialog requires entering a new password
   * @param email - User email to reset password for
   * @param newPassword - New password to set (defaults to a test password)
   */
  async resetUserPassword(email: string, newPassword: string = "TestPassword123!"): Promise<void> {
    await this.openUserActionMenu(email);
    await this.clickResetPasswordFromActionMenu();

    // Wait for the Reset Password dialog to appear
    const dialog = this.page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Fill in the new password fields
    const newPasswordInput = this.page.getByPlaceholder("New password");
    const confirmPasswordInput = this.page.getByPlaceholder("Confirm password");

    await newPasswordInput.fill(newPassword);
    await confirmPasswordInput.fill(newPassword);

    // Click the RESET PASSWORD button
    const resetButton = this.page.getByRole("button", { name: /RESET PASSWORD/i });
    await expect(resetButton).toBeEnabled({ timeout: 3000 });
    await resetButton.click();

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    // Wait for the action to process (toast notification may appear)
    // Wait for network requests to complete
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  }

  /**
   * Reset user password via action menu by name
   * Useful for Driver role where email shows as "N/A"
   * The Reset Password dialog requires entering a new password
   * @param name - User name to reset password for
   * @param newPassword - New password to set (defaults to a test password)
   */
  async resetUserPasswordByName(name: string, newPassword: string = "TestPassword123!"): Promise<void> {
    await this.openUserActionMenuByName(name);
    await this.clickResetPasswordFromActionMenu();

    // Wait for the Reset Password dialog to appear
    const dialog = this.page.getByRole("dialog");
    await expect(dialog).toBeVisible({ timeout: 5000 });

    // Fill in the new password fields
    const newPasswordInput = this.page.getByPlaceholder("New password");
    const confirmPasswordInput = this.page.getByPlaceholder("Confirm password");

    await newPasswordInput.fill(newPassword);
    await confirmPasswordInput.fill(newPassword);

    // Click the RESET PASSWORD button
    const resetButton = this.page.getByRole("button", { name: /RESET PASSWORD/i });
    await expect(resetButton).toBeEnabled({ timeout: 3000 });
    await resetButton.click();

    // Wait for dialog to close
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    // Wait for the action to process (toast notification may appear)
    // Wait for network requests to complete
    await this.page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Wait for table to update after an action
   */
  async waitForTableUpdate(): Promise<void> {
    // Wait for any loading states to complete and table to be visible
    // Wait for table data to refresh
    await this.page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await expect(this.usersTable).toBeVisible({ timeout: 10000 });
  }

  /**
   * Close any open dialog
   */
  async closeAnyOpenDialog(): Promise<void> {
    const dialog = this.page.getByRole("dialog");
    if (await dialog.isVisible()) {
      // Try Cancel button first
      const cancelButton = dialog.getByRole("button", { name: "Cancel" });
      if (await cancelButton.isVisible()) {
        await cancelButton.click();
      } else {
        // Try close button
        const closeButton = dialog.getByRole("button").first();
        await closeButton.click();
      }
      await expect(dialog).not.toBeVisible({ timeout: 5000 });
    }
  }

  /**
   * Verify no empty state message (users exist)
   */
  async verifyUsersExist(): Promise<void> {
    const userCount = await this.getUserCount();
    expect(userCount).toBeGreaterThan(0);
  }
}
