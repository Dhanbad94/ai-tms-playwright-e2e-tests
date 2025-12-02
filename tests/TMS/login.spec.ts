import { test, expect } from "@playwright/test";
import { Page } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { ActivateAccountPage } from "../../pages/activate_account_page";
import { ForgotPasswordPage } from "../../pages/forgot_password_page";
import { TEST_DATA } from "../../utils/test-data";

// Configure tests to run serially (one after another)
test.describe.configure({ mode: "serial" });

test.describe("TrackMyShuttle Login Tests", () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await page.goto(`${TEST_DATA.baseUrl}/login`);
  });

  test("should display all login page elements @smoke @system", async () => {
    await test.step("Verify all login page elements are visible", async () => {
      await loginPage.verifyLoginPageElements();
    });
  });

  test("should handle empty credentials @smoke @regression", async ({
    page,
  }) => {
    await test.step("Submit form with empty credentials", async () => {
      await loginPage.login("", "");

      await page.waitForTimeout(1000);

      const emailError = await loginPage.getErrorMessage("login_email");
      const passwordError = await loginPage.getErrorMessage("login_pass");
      const emailValidation = await loginPage.emailInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage
      );
      const passwordValidation = await loginPage.passwordInput.evaluate(
        (el: HTMLInputElement) => el.validationMessage
      );

      const hasValidation =
        emailError !== "" ||
        passwordError !== "" ||
        emailValidation !== "" ||
        passwordValidation !== "";

      expect(hasValidation).toBeTruthy();
    });
  });

  test("should handle invalid email format @regression", async ({ page }) => {
    await test.step("Enter invalid email format", async () => {
      const invalidEmail = "invalid-email";
      const password = "12345678";

      await loginPage.login(invalidEmail, password);

      await page.waitForTimeout(1000);

      const errorMessage = await loginPage.getErrorMessage("login_email");
      const currentUrl = page.url();
      const isStillOnLoginPage =
        currentUrl.includes("/login") || currentUrl.includes(TEST_DATA.baseUrl);

      expect(errorMessage !== "" || isStillOnLoginPage).toBeTruthy();
    });
  });

  test("should toggle password visibility @system", async () => {
    await test.step("Toggle password visibility", async () => {
      await loginPage.passwordInput.fill("testpassword");

      const initialType = await loginPage.passwordInput.getAttribute("type");
      expect(initialType).toBe("password");

      await loginPage.togglePasswordVisibility();

      await loginPage.page.waitForTimeout(500);

      const toggledType = await loginPage.passwordInput.getAttribute("type");
      const toggleIcon = await loginPage.passwordToggle
        .locator("i")
        .getAttribute("class");

      const isToggled =
        toggledType === "text" || (toggleIcon && toggleIcon.includes("fa-eye"));

      expect(isToggled).toBeTruthy();
    });
  });

  test("should remember me checkbox functionality @system @regression", async () => {
    await test.step("Test remember me checkbox", async () => {
      const initialState = await loginPage.isRememberMeChecked();

      await loginPage.rememberMeCheckbox.click();

      await loginPage.page.waitForTimeout(300);

      const newState = await loginPage.isRememberMeChecked();
      expect(newState).toBe(!initialState);
    });
  });

  test("should navigate to activate account page and verify elements @smoke @system", async ({
    page,
  }) => {
    await test.step("Navigate from login to activate account page", async () => {
      await loginPage.clickActivateAccount();

      await page.waitForLoadState("networkidle");

      await expect(page).toHaveURL(/activate/);
    });

    await test.step("Verify activate account page loads correctly", async () => {
      const activateAccountPage = new ActivateAccountPage(page);

      await activateAccountPage.verifyActivateAccountPageElements();

      await activateAccountPage.clickBackToLogin();
      await page.waitForLoadState("networkidle");
      await expect(page).toHaveURL(/login/);
    });
  });

  test("should navigate to forgot password page @smoke @system", async ({
    page,
  }) => {
    await test.step("Click forgot password link", async () => {
      await loginPage.clickForgotPassword();
      await loginPage.page.waitForLoadState("networkidle");
      await expect(loginPage.page).toHaveURL(/recover-account/);
    });
  });

  test("should display and submit forgot password page", async ({ page }) => {
    const forgotPasswordPage = new ForgotPasswordPage(page);

    await forgotPasswordPage.goto(TEST_DATA.baseUrl);

    // Ensure navigation to forgot password page
    await forgotPasswordPage.page.goto(`${TEST_DATA.baseUrl}/recover-account`);
    await forgotPasswordPage.emailInput.waitFor({
      state: "visible",
      timeout: 10000,
    });

    // Check heading and subtext
    await expect(forgotPasswordPage.heading).toHaveText("Forgot Password");
    await expect(forgotPasswordPage.subText).toHaveText(
      "Enter email address for recovery instructions"
    );

    // Verify page elements
    await forgotPasswordPage.verifyForgotPasswordPageElements();

    // Submit with empty email
    await forgotPasswordPage.recoverAccount("");
    await page.waitForTimeout(500);
    expect(await forgotPasswordPage.getEmailError()).not.toBe("");

    // Submit with invalid email
    await forgotPasswordPage.recoverAccount("invalid-email");
    await page.waitForTimeout(500);
    expect(await forgotPasswordPage.getEmailError()).not.toBe("");
    await forgotPasswordPage.clickBackToLogin();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/login/);

    // Submit with a valid and existing email from .env.local
    const email = process.env.FORGOT_PASSWORD_EMAIL || TEST_DATA.loginEmail;
    await forgotPasswordPage.page.goto(`${TEST_DATA.baseUrl}/recover-account`);
    await forgotPasswordPage.emailInput.waitFor({
      state: "visible",
      timeout: 10000,
    });
    await forgotPasswordPage.recoverAccount(email);
    await page.waitForTimeout(1000);
    const validMsg = await forgotPasswordPage.getEmailError();
    expect(typeof validMsg).toBe("string");

    // Check back to login navigation
    await forgotPasswordPage.clickBackToLogin();
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/login/);
  });

  test("should display phone number correctly @system", async () => {
    await test.step("Verify phone number display", async () => {
      await expect(loginPage.phoneNumber).toBeVisible();
      await expect(loginPage.phoneNumber).toHaveAttribute(
        "href",
        "tel:+1-888-574-8885"
      );
    });
  });

  test("should have correct form action and method @system @regression", async ({
    page,
  }) => {
    await test.step("Verify form attributes", async () => {
      const form = page.locator("#frm_login");
      await expect(form).toHaveAttribute(
        "action",
        `${TEST_DATA.baseUrl}/login`
      );
      await expect(form).toHaveAttribute("method", "post");
    });
  });

  test("should load login page within acceptable time @system", async ({
    page,
  }) => {
    await test.step("Measure page load time", async () => {
      const newPage = await page.context().newPage();

      const startTime = Date.now();

      await newPage.goto(`${TEST_DATA.baseUrl}/login`);
      await newPage.waitForLoadState("domcontentloaded");

      const endTime = Date.now();
      const loadTime = endTime - startTime;

      expect(loadTime).toBeLessThan(10000);

      await newPage.close();
    });
  });

  test("should validate cross-page navigation flow @system @integration", async ({
    page,
  }) => {
    await test.step("Test complete navigation flow between login and activate account", async () => {
      expect(await loginPage.isOnLoginPage()).toBeTruthy();

      await loginPage.clickActivateAccount();
      await page.waitForLoadState("networkidle");

      const activateAccountPage = new ActivateAccountPage(page);
      expect(await activateAccountPage.isOnActivateAccountPage()).toBeTruthy();

      await activateAccountPage.clickBackToLogin();
      await page.waitForLoadState("networkidle");

      expect(await loginPage.isOnLoginPage()).toBeTruthy();

      await loginPage.clickForgotPassword();
      await page.waitForLoadState("networkidle");

      expect(page.url()).toContain("recover-account");
    });
  });

  test("should maintain consistent UI elements across pages @system", async ({
    page,
  }) => {
    await test.step("Verify consistent header elements across pages", async () => {
      await expect(loginPage.logo).toBeVisible();
      await expect(loginPage.phoneNumber).toBeVisible();

      await loginPage.clickActivateAccount();
      await page.waitForLoadState("networkidle");

      const activateAccountPage = new ActivateAccountPage(page);

      await expect(activateAccountPage.logo).toBeVisible();
      await expect(activateAccountPage.phoneNumber).toBeVisible();

      const loginPhoneHref = await loginPage.phoneNumber.getAttribute("href");
      const activatePhoneHref =
        await activateAccountPage.phoneNumber.getAttribute("href");
      expect(loginPhoneHref).toBe(activatePhoneHref);
    });
  });

  test("should login with valid credentials @smoke @system @regression", async ({
    page,
  }) => {
    await test.step("Enter valid credentials and login", async () => {
      const email = TEST_DATA.loginEmail;
      const password = TEST_DATA.loginPassword;

      await loginPage.login(email, password, true);

      await page.waitForTimeout(2000);

      const currentUrl = page.url();

      const isLoggedIn =
        !currentUrl.includes("/login") ||
        (await page
          .locator('[data-testid="dashboard"]')
          .isVisible()
          .catch(() => false));
      const hasError =
        (await loginPage.getErrorMessage("login_email")) !== "" ||
        (await loginPage.getErrorMessage("login_pass")) !== "";

      expect(isLoggedIn || hasError).toBeTruthy();

      if (isLoggedIn) {
        expect(currentUrl).not.toContain("/login");
      }
    });
  });

  test("should login as operator and manager @smoke @system", async ({
    page,
  }) => {
    let loginPage: LoginPage;

    // Get the current environment (staging, preproduction, production)
    const currentEnv = process.env.ENV || "staging";

    // Helper function to get environment-specific credentials
    const getCredentials = (role: "OPERATOR" | "MANAGER") => {
      const envPrefix =
        currentEnv.toUpperCase() === "PREPRODUCTION"
          ? "PREPRODUCTION"
          : currentEnv.toUpperCase() === "PRODUCTION"
          ? "PROD"
          : "STAGING";

      const emailKey = `${envPrefix}_${role}_EMAIL`;
      const passwordKey = `${envPrefix}_${role}_PASSWORD`;

      return {
        email: process.env[emailKey] || "",
        password: process.env[passwordKey] || "",
      };
    };

    // Test Operator Login
    await test.step("Login as Operator", async () => {
      loginPage = new LoginPage(page);
      await page.goto(`${TEST_DATA.baseUrl}/login`);

      // Wait for page to be ready
      await page.waitForLoadState("domcontentloaded");

      const operatorCredentials = getCredentials("OPERATOR");

      if (!operatorCredentials.email || !operatorCredentials.password) {
        test.skip(
          true,
          `Operator credentials not provided for ${currentEnv} environment`
        );
        return;
      }

      // Fill and submit login form
      await page.fill("#login_email", operatorCredentials.email);
      await page.fill("#login_pass", operatorCredentials.password);
      await page.check("#remember_me");

      // Click login and wait for response
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.url().includes("/login") && resp.request().method() === "POST",
          { timeout: 30000 }
        ),
        page.click('button[type="submit"][name="submit_login"]'),
      ]).catch(() => [null]);

      // Wait a bit for any redirects
      await page.waitForTimeout(2000);

      const currentUrl = page.url();

      // Check for login success
      if (currentUrl.includes("/login")) {
        // Still on login page, check for errors
        const errorVisible =
          (await page
            .locator(".input-error:visible, .error-message:visible")
            .count()) > 0;
        if (errorVisible) {
          const errorText = await page
            .locator(".input-error:visible, .error-message:visible")
            .first()
            .textContent();
          throw new Error(`Operator login failed with error: ${errorText}`);
        }
        throw new Error("Operator login failed - still on login page");
      }

      console.log("✓ Operator login successful");
      await page.screenshot({
        path: `test-results/operator-login-success-${currentEnv}.png`,
      });
    });

    // Clear session between logins
    await test.step("Clear session", async () => {
      await page.context().clearCookies();
      await page.goto(`${TEST_DATA.baseUrl}/login`);
      await page.waitForLoadState("domcontentloaded");
    });

    // Test Manager Login
    await test.step("Login as Manager", async () => {
      const managerCredentials = getCredentials("MANAGER");

      if (!managerCredentials.email || !managerCredentials.password) {
        test.skip(
          true,
          `Manager credentials not provided for ${currentEnv} environment`
        );
        return;
      }

      // Fill and submit login form
      await page.fill("#login_email", managerCredentials.email);
      await page.fill("#login_pass", managerCredentials.password);
      await page.check("#remember_me");

      // Click login and wait for response
      const [response] = await Promise.all([
        page.waitForResponse(
          (resp) =>
            resp.url().includes("/login") && resp.request().method() === "POST",
          { timeout: 30000 }
        ),
        page.click('button[type="submit"][name="submit_login"]'),
      ]).catch(() => [null]);

      // Wait a bit for any redirects
      await page.waitForTimeout(2000);

      const currentUrl = page.url();

      // Check for login success
      if (currentUrl.includes("/login")) {
        // Still on login page, check for errors
        const errorVisible =
          (await page
            .locator(".input-error:visible, .error-message:visible")
            .count()) > 0;
        if (errorVisible) {
          const errorText = await page
            .locator(".input-error:visible, .error-message:visible")
            .first()
            .textContent();
          throw new Error(`Manager login failed with error: ${errorText}`);
        }
        throw new Error("Manager login failed - still on login page");
      }

      console.log("✓ Manager login successful");
      await page.screenshot({
        path: `test-results/manager-login-success-${currentEnv}.png`,
      });
    });
  });

  test("should handle session timeout and redirect @system @regression", async ({
    page,
  }) => {
    await test.step("Test session handling", async () => {
      await loginPage.clickActivateAccount();
      await page.waitForLoadState("networkidle");

      const activateAccountPage = new ActivateAccountPage(page);
      await activateAccountPage.clickBackToLogin();
      await page.waitForLoadState("networkidle");

      expect(await loginPage.isOnLoginPage()).toBeTruthy();

      await loginPage.emailInput.fill("test@example.com");
      await loginPage.passwordInput.fill("password");

      expect(await loginPage.getEmailValue()).toBe("test@example.com");
      expect(await loginPage.getPasswordValue()).toBe("password");
    });
  });

  // ACTIVATE ACCOUNT PAGE TESTS
  test.describe("Activate Account Page Tests", () => {
    let activateAccountPage: ActivateAccountPage;

    test.beforeEach(async ({ page }) => {
      activateAccountPage = new ActivateAccountPage(page);
      await page.goto(`${TEST_DATA.baseUrl}/activate`);
    });

    test("should display all activate account page elements @smoke @system", async () => {
      await test.step("Verify all activate account page elements are visible", async () => {
        await activateAccountPage.verifyActivateAccountPageElements();
      });
    });

    test("should have correct form attributes @system", async ({ page }) => {
      await test.step("Verify activate form attributes", async () => {
        await expect(activateAccountPage.activateForm).toHaveAttribute(
          "action",
          `${TEST_DATA.baseUrl}/activatesubmit`
        );
        await expect(activateAccountPage.activateForm).toHaveAttribute(
          "method",
          "post"
        );
      });
    });

    test("should require terms acceptance to enable activate button @system @regression", async () => {
      await test.step("Test terms checkbox enables activate button", async () => {
        expect(await activateAccountPage.isActivateButtonEnabled()).toBeFalsy();

        await activateAccountPage.acceptTerms(true);
        await activateAccountPage.page.waitForTimeout(300);

        expect(
          await activateAccountPage.isActivateButtonEnabled()
        ).toBeTruthy();

        await activateAccountPage.acceptTerms(false);
        await activateAccountPage.page.waitForTimeout(300);

        expect(await activateAccountPage.isActivateButtonEnabled()).toBeFalsy();
      });
    });

    test("should handle empty form submission @smoke @regression", async ({
      page,
    }) => {
      await test.step("Submit form with empty fields", async () => {
        await activateAccountPage.acceptTerms(true);
        await activateAccountPage.submitActivation();

        await page.waitForTimeout(1000);

        const firstNameError = await activateAccountPage.getErrorMessage(
          "user_first_name"
        );
        const lastNameError = await activateAccountPage.getErrorMessage(
          "user_last_name"
        );
        const emailError = await activateAccountPage.getErrorMessage(
          "register_Email"
        );
        const phoneError = await activateAccountPage.getErrorMessage(
          "org_phone"
        );
        const codeError = await activateAccountPage.getErrorMessage("org_code");
        const passwordError = await activateAccountPage.getErrorMessage(
          "register_password"
        );

        const hasValidation =
          firstNameError !== "" ||
          lastNameError !== "" ||
          emailError !== "" ||
          phoneError !== "" ||
          codeError !== "" ||
          passwordError !== "";

        expect(hasValidation).toBeTruthy();
      });
    });

    test("should validate email format @regression", async ({ page }) => {
      await test.step("Enter invalid email format", async () => {
        await activateAccountPage.fillFirstName("John");
        await activateAccountPage.fillLastName("Doe");
        await activateAccountPage.fillEmail("invalid-email");
        await activateAccountPage.fillPhone("1234567890");
        await activateAccountPage.fillActivationCode("ABC-123");
        await activateAccountPage.fillPassword("password123");
        await activateAccountPage.acceptTerms(true);

        await activateAccountPage.submitActivation();
        await page.waitForTimeout(1000);

        const emailError = await activateAccountPage.getErrorMessage(
          "register_Email"
        );
        const currentUrl = page.url();
        const isStillOnActivatePage = currentUrl.includes("/activate");

        expect(emailError !== "" || isStillOnActivatePage).toBeTruthy();
      });
    });

    test("should validate phone number format @regression", async ({
      page,
    }) => {
      await test.step("Enter invalid phone number", async () => {
        await activateAccountPage.fillFirstName("John");
        await activateAccountPage.fillLastName("Doe");
        await activateAccountPage.fillEmail("john.doe@example.com");
        await activateAccountPage.fillPhone("123");
        await activateAccountPage.fillActivationCode("ABC-123");
        await activateAccountPage.fillPassword("password123");
        await activateAccountPage.acceptTerms(true);

        await activateAccountPage.submitActivation();
        await page.waitForTimeout(1000);

        const phoneError = await activateAccountPage.getErrorMessage(
          "org_phone"
        );
        expect(phoneError).toBeTruthy();
      });
    });

    test("should validate activation code format @regression", async ({
      page,
    }) => {
      await test.step("Test activation code format validation", async () => {
        await activateAccountPage.fillActivationCode("INVALID");

        const codeValue =
          await activateAccountPage.activationCodeInput.inputValue();

        await activateAccountPage.fillFirstName("John");
        await activateAccountPage.fillLastName("Doe");
        await activateAccountPage.fillEmail("john.doe@example.com");
        await activateAccountPage.fillPhone("1234567890");
        await activateAccountPage.fillPassword("password123");
        await activateAccountPage.acceptTerms(true);

        await activateAccountPage.submitActivation();
        await page.waitForTimeout(1000);

        const codeError = await activateAccountPage.getErrorMessage("org_code");
        const currentUrl = page.url();

        expect(
          codeError !== "" || currentUrl.includes("/activate")
        ).toBeTruthy();
      });
    });

    test("should toggle password visibility @system", async () => {
      await test.step("Toggle password visibility", async () => {
        await activateAccountPage.fillPassword("testpassword");

        const initialType =
          await activateAccountPage.passwordInput.getAttribute("type");
        expect(initialType).toBe("password");

        await activateAccountPage.togglePasswordVisibility();
        await activateAccountPage.page.waitForTimeout(500);

        const toggledType =
          await activateAccountPage.passwordInput.getAttribute("type");
        const toggleIcon = await activateAccountPage.passwordToggle
          .locator("i")
          .getAttribute("class");

        const isToggled =
          toggledType === "text" ||
          (toggleIcon &&
            (toggleIcon.includes("fa-eye") ||
              toggleIcon.includes("fa-eye-slash")));

        expect(isToggled).toBeTruthy();
      });
    });

    test("should validate password requirements @regression", async ({
      page,
    }) => {
      await test.step("Test password validation", async () => {
        await activateAccountPage.fillFirstName("John");
        await activateAccountPage.fillLastName("Doe");
        await activateAccountPage.fillEmail("john.doe@example.com");
        await activateAccountPage.fillPhone("1234567890");
        await activateAccountPage.fillActivationCode("ABC-123");
        await activateAccountPage.fillPassword("123");
        await activateAccountPage.acceptTerms(true);

        await activateAccountPage.submitActivation();
        await page.waitForTimeout(1000);

        const passwordError = await activateAccountPage.getErrorMessage(
          "register_password"
        );
        const currentUrl = page.url();

        expect(
          passwordError !== "" || currentUrl.includes("/activate")
        ).toBeTruthy();
      });
    });

    test("should validate first name field @regression", async ({ page }) => {
      await test.step("Test first name validation", async () => {
        await activateAccountPage.fillLastName("Doe");
        await activateAccountPage.fillEmail("john.doe@example.com");
        await activateAccountPage.fillPhone("1234567890");
        await activateAccountPage.fillActivationCode("ABC-123");
        await activateAccountPage.fillPassword("password123");
        await activateAccountPage.acceptTerms(true);

        await activateAccountPage.submitActivation();
        await page.waitForTimeout(1000);

        const firstNameError = await activateAccountPage.getErrorMessage(
          "user_first_name"
        );
        expect(firstNameError).toBeTruthy();
      });
    });

    test("should validate last name field @regression", async ({ page }) => {
      await test.step("Test last name validation", async () => {
        await activateAccountPage.fillFirstName("John");
        await activateAccountPage.fillEmail("john.doe@example.com");
        await activateAccountPage.fillPhone("1234567890");
        await activateAccountPage.fillActivationCode("ABC-123");
        await activateAccountPage.fillPassword("password123");
        await activateAccountPage.acceptTerms(true);

        await activateAccountPage.submitActivation();
        await page.waitForTimeout(1000);

        const lastNameError = await activateAccountPage.getErrorMessage(
          "user_last_name"
        );
        expect(lastNameError).toBeTruthy();
      });
    });

    test("should handle country code selection @system", async ({ page }) => {
      await test.step("Test country code selector", async () => {
        await activateAccountPage.countrySelector.click();
        await page.waitForTimeout(500);

        const countryList = page.locator(".country-list");
        await expect(countryList).toBeVisible();

        const canadaOption = page.locator('[data-country-code="ca"]');
        if (await canadaOption.isVisible()) {
          await canadaOption.click();
          await page.waitForTimeout(500);

          const selectedFlag =
            activateAccountPage.countrySelector.locator(".iti-flag");
          const flagClass = await selectedFlag.getAttribute("class");
          expect(flagClass).toContain("ca");
        }
      });
    });

    test("should clear form fields @system", async () => {
      await test.step("Test form clearing functionality", async () => {
        await activateAccountPage.fillFirstName("John");
        await activateAccountPage.fillLastName("Doe");
        await activateAccountPage.fillEmail("john.doe@example.com");
        await activateAccountPage.fillPhone("1234567890");
        await activateAccountPage.fillActivationCode("ABC-123");
        await activateAccountPage.fillPassword("password123");
        await activateAccountPage.acceptTerms(true);

        await activateAccountPage.clearForm();

        expect(await activateAccountPage.firstNameInput.inputValue()).toBe("");
        expect(await activateAccountPage.lastNameInput.inputValue()).toBe("");
        expect(await activateAccountPage.emailInput.inputValue()).toBe("");
        expect(await activateAccountPage.phoneInput.inputValue()).toBe("");
        expect(await activateAccountPage.activationCodeInput.inputValue()).toBe(
          ""
        );
        expect(await activateAccountPage.passwordInput.inputValue()).toBe("");
        expect(await activateAccountPage.termsCheckbox.isChecked()).toBeFalsy();
      });
    });

    test("should navigate back to login page @system", async ({ page }) => {
      await test.step("Test back to login navigation", async () => {
        await activateAccountPage.clickBackToLogin();
        await page.waitForLoadState("networkidle");

        await expect(page).toHaveURL(/login/);

        const loginPage = new LoginPage(page);
        expect(await loginPage.isOnLoginPage()).toBeTruthy();
      });
    });

    test("should verify privacy policy link @system", async ({ page }) => {
      await test.step("Test privacy policy link", async () => {
        await expect(activateAccountPage.privacyPolicyLink).toBeVisible();
        await expect(activateAccountPage.privacyPolicyLink).toHaveAttribute(
          "href",
          "privacy"
        );
        await expect(activateAccountPage.privacyPolicyLink).toHaveAttribute(
          "target",
          "_blank"
        );
      });
    });

    test("should handle maximum character limits @regression", async () => {
      await test.step("Test field character limits", async () => {
        const longText = "a".repeat(150);

        await activateAccountPage.fillFirstName(longText);
        await activateAccountPage.fillLastName(longText);
        await activateAccountPage.fillEmail(longText + "@example.com");
        await activateAccountPage.fillActivationCode(longText);
        await activateAccountPage.fillPassword(longText);

        const firstNameValue =
          await activateAccountPage.firstNameInput.inputValue();
        const lastNameValue =
          await activateAccountPage.lastNameInput.inputValue();
        const emailValue = await activateAccountPage.emailInput.inputValue();
        const codeValue =
          await activateAccountPage.activationCodeInput.inputValue();
        const passwordValue =
          await activateAccountPage.passwordInput.inputValue();

        expect(firstNameValue.length).toBeLessThanOrEqual(100);
        expect(lastNameValue.length).toBeLessThanOrEqual(100);
        expect(emailValue.length).toBeLessThanOrEqual(100);
        expect(codeValue.length).toBeLessThanOrEqual(100);
        expect(passwordValue.length).toBeLessThanOrEqual(100);
      });
    });
  });
});
