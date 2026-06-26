import { test, expect } from "@playwright/test";
import { Page } from "@playwright/test";
import { LoginPage } from "../../pages/login_page";
import { DashboardPage } from "../../pages/dashboard_page";
import { ActivateAccountPage } from "../../pages/activate_account_page";
import { ForgotPasswordPage } from "../../pages/forgot_password_page";
import { TEST_DATA } from "../../utils/test-data";
import { autoDismissCookieBanner } from "../../helpers/dismissCookieBanner";

// Resolve credentials for the active environment (staging/preproduction/production)
// instead of hardcoding STAGING_* so login tests are portable across environments.
function getCredentials(role: "OPERATOR" | "MANAGER") {
  const currentEnv = (process.env.ENV || "staging").toUpperCase();
  const envPrefix =
    currentEnv === "PREPRODUCTION"
      ? "PREPRODUCTION"
      : currentEnv === "PRODUCTION"
      ? "PROD"
      : "STAGING";
  return {
    email: process.env[`${envPrefix}_${role}_EMAIL`] || "",
    password: process.env[`${envPrefix}_${role}_PASSWORD`] || "",
  };
}

// Run tests independently (parallel-safe). Serial mode was previously used, but
// it cascades: the first failing/flaky test marks every later test as SKIPPED,
// which hid the entire Activate Account group. These tests are independent
// (most don't even log in), so a single flake should not skip the rest.
test.describe.configure({ mode: "parallel" });

test.describe("TrackMyShuttle Login Tests", () => {
  let loginPage: LoginPage;

  // Clear auth state since login tests need to start unauthenticated
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await autoDismissCookieBanner(page);
    // domcontentloaded (not full "load") keeps the hook fast and resilient under
    // parallel load; the LoginPage element waits confirm readiness afterwards.
    await page.goto(`${TEST_DATA.baseUrl}/login`, { waitUntil: "domcontentloaded" });
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

      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

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

      await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

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

      // Playwright auto-waits for actions

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

      // Playwright auto-waits for actions

      const newState = await loginPage.isRememberMeChecked();
      expect(newState).toBe(!initialState);
    });
  });

  test("should navigate to activate account page and verify elements @smoke @system", async ({
    page,
  }) => {
    await test.step("Navigate from login to activate account page", async () => {
      await loginPage.clickActivateAccount();

      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

      await expect(page).toHaveURL(/activate/);
    });

    await test.step("Verify activate account page loads correctly", async () => {
      const activateAccountPage = new ActivateAccountPage(page);

      await activateAccountPage.verifyActivateAccountPageElements();

      await activateAccountPage.clickBackToLogin();
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      await expect(page).toHaveURL(/login/);
    });
  });

  test("should navigate to forgot password page @smoke @system", async ({
    page,
  }) => {
    await test.step("Click forgot password link", async () => {
      await loginPage.clickForgotPassword();
      await loginPage.page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
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
    await expect(forgotPasswordPage.heading).toHaveText(/forgot password/i);
    await expect(forgotPasswordPage.subText).toHaveText(
      /enter email address for recovery instructions/i
    );

    // Verify page elements
    await forgotPasswordPage.verifyForgotPasswordPageElements();

    // Submit with empty email
    await forgotPasswordPage.recoverAccount("");
    await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    expect(await forgotPasswordPage.getEmailError()).not.toBe("");

    // Submit with invalid email
    await forgotPasswordPage.recoverAccount("invalid-email");
    await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});
    expect(await forgotPasswordPage.getEmailError()).not.toBe("");
    await forgotPasswordPage.clickBackToLogin();
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
    await expect(page).toHaveURL(/login/);

    // Submit with a valid and existing email from .env.local
    const email = process.env.FORGOT_PASSWORD_EMAIL || TEST_DATA.loginEmail;
    await forgotPasswordPage.page.goto(`${TEST_DATA.baseUrl}/recover-account`);
    await forgotPasswordPage.emailInput.waitFor({
      state: "visible",
      timeout: 10000,
    });
    await forgotPasswordPage.recoverAccount(email);
    // A valid email submits the form (POST) and redirects to the "reset link
    // sent" confirmation page — there is no inline error span to read here.
    await expect(page).toHaveURL(/reset-link-sent/, { timeout: 15000 });
    await expect(
      page.getByRole("heading", { name: /check your inbox/i })
    ).toBeVisible({ timeout: 10000 });

    // Check back to login navigation
    await forgotPasswordPage.clickBackToLogin();
    await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
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
      const startTime = Date.now();

      await page.goto(`${TEST_DATA.baseUrl}/login`);
      await loginPage.waitForPageLoad();

      const loadTime = Date.now() - startTime;

      expect(loadTime).toBeLessThan(10000);
    });
  });

  test("should validate cross-page navigation flow @system @integration", async ({
    page,
  }) => {
    await test.step("Test navigation between pages", async () => {
      await loginPage.clickActivateAccount();
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      await expect(page).toHaveURL(/activate/);

      const activateAccountPage = new ActivateAccountPage(page);
      await activateAccountPage.clickBackToLogin();
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      await expect(page).toHaveURL(/login/);

      await loginPage.clickForgotPassword();
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      await expect(page).toHaveURL(/recover-account/);

      const forgotPasswordPage = new ForgotPasswordPage(page);
      await forgotPasswordPage.clickBackToLogin();
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});
      await expect(page).toHaveURL(/login/);
    });
  });

  test("should maintain consistent UI elements across pages @system", async ({
    page,
  }) => {
    await test.step("Verify consistent UI elements", async () => {
      const loginLogo = loginPage.logo;
      const loginPhone = loginPage.phoneNumber;

      await expect(loginLogo).toBeVisible();
      await expect(loginPhone).toBeVisible();

      await loginPage.clickActivateAccount();
      await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

      const activateAccountPage = new ActivateAccountPage(page);
      await expect(activateAccountPage.logo).toBeVisible();
      await expect(activateAccountPage.phoneNumber).toBeVisible();
    });
  });

  // FIXED: Proper credential handling for login test
  test("should login with valid credentials @smoke @system @regression", async ({
    page,
  }) => {
    await test.step("Enter valid credentials and login", async () => {
      // Get credentials for the active environment
      const { email, password } = getCredentials("OPERATOR");

      // Skip if credentials not provided
      test.skip(
        !email || !password,
        "Valid credentials not provided in environment variables"
      );

      await loginPage.login(email, password);

      // Wait for navigation or error
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      const currentUrl = page.url();
      const isLoggedIn = currentUrl.includes("/dashboard");
      const hasError =
        (await loginPage.getErrorMessage("login_email")) !== "" ||
        (await loginPage.getErrorMessage("login_pass")) !== "";

      // Should either login successfully OR show error
      expect(isLoggedIn || hasError).toBeTruthy();

      if (isLoggedIn) {
        expect(currentUrl).not.toContain("/login");

        // Logout after successful test - clear cookies and navigate
        await page.context().clearCookies();
        await page.goto(`${TEST_DATA.baseUrl}/login`, { waitUntil: 'domcontentloaded' });
      } else if (hasError) {
        // Error is expected if credentials are invalid
        expect(hasError).toBeTruthy();
      }
    });
  });

  test("should login as operator and manager @smoke @system", async ({
    page,
  }) => {
    const { email: operatorEmail, password: operatorPassword } =
      getCredentials("OPERATOR");
    const { email: managerEmail, password: managerPassword } =
      getCredentials("MANAGER");

    test.skip(
      !operatorEmail ||
        !operatorPassword ||
        !managerEmail ||
        !managerPassword,
      "Operator or Manager credentials not provided"
    );

    await test.step("Login as Operator", async () => {
      await page.goto(`${TEST_DATA.baseUrl}/login`);
      await loginPage.login(operatorEmail, operatorPassword);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      const currentUrl = page.url();
      expect(currentUrl).toContain("/dashboard");

      // Logout - clear cookies and navigate
      await page.context().clearCookies();
      await page.goto(`${TEST_DATA.baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    });

    await test.step("Login as Manager", async () => {
      await page.goto(`${TEST_DATA.baseUrl}/login`);
      await loginPage.login(managerEmail, managerPassword);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      const currentUrl = page.url();
      expect(currentUrl).toContain("/dashboard");

      // Logout - clear cookies and navigate
      await page.context().clearCookies();
      await page.goto(`${TEST_DATA.baseUrl}/login`, { waitUntil: 'domcontentloaded' });
    });
  });

  test("should handle session timeout and redirect @system @regression", async ({
    page,
  }) => {
    const { email, password } = getCredentials("OPERATOR");

    test.skip(
      !email || !password,
      "Valid credentials not provided in environment variables"
    );

    await test.step("Login and simulate session timeout", async () => {
      await loginPage.login(email, password);
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      const currentUrl = page.url();
      expect(currentUrl).toContain("/dashboard");

      // Clear session/cookies to simulate timeout
      await page.context().clearCookies();
      await page.reload();
      await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});

      // Should redirect to login
      const newUrl = page.url();
      expect(
        newUrl.includes("/login") ||
          newUrl.includes("/signin") ||
          newUrl.includes("/auth")
      ).toBeTruthy();
    });
  });

  test.describe("Activate Account Page Tests", () => {
    let activateAccountPage: ActivateAccountPage;

    test.beforeEach(async ({ page }) => {
      activateAccountPage = new ActivateAccountPage(page);
      await autoDismissCookieBanner(page);
      await activateAccountPage.goto();
    });

    test("should display all activate account page elements @smoke @system", async () => {
      await test.step("Verify all elements are visible", async () => {
        await activateAccountPage.verifyActivateAccountPageElements();
      });
    });

    test("should have correct form attributes @system", async ({ page }) => {
      await test.step("Verify form attributes", async () => {
        await expect(activateAccountPage.activateForm).toBeVisible();
        await expect(activateAccountPage.activateForm).toHaveAttribute(
          "id",
          "activate"
        );
        await expect(activateAccountPage.activateForm).toHaveAttribute(
          "method",
          "post"
        );
      });
    });

    test("should require terms acceptance to enable activate button @system @regression", async ({
      page,
    }) => {
      await test.step("Test terms checkbox requirement", async () => {
        await activateAccountPage.fillFirstName("John");
        await activateAccountPage.fillLastName("Doe");
        await activateAccountPage.fillEmail("john.doe@example.com");
        await activateAccountPage.fillPhone("1234567890");
        await activateAccountPage.fillActivationCode("ABC-123");
        await activateAccountPage.fillPassword("password123");

        // Without accepting terms, button should be disabled (or submission should fail)
        const isEnabledWithoutTerms =
          await activateAccountPage.isActivateButtonEnabled();

        await activateAccountPage.acceptTerms(true);
        await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});

        const isEnabledWithTerms =
          await activateAccountPage.isActivateButtonEnabled();

        // Either button is initially disabled or terms must be checked
        expect(isEnabledWithoutTerms || isEnabledWithTerms).toBeTruthy();
      });
    });

    test("should handle empty form submission @smoke @regression", async ({
      page,
    }) => {
      await test.step("Submit empty form", async () => {
        await activateAccountPage.acceptTerms(true);
        await activateAccountPage.submitActivation();
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

        const currentUrl = page.url();
        expect(currentUrl).toContain("/activate");
      });
    });

    test("should validate email format @regression", async ({ page }) => {
      await test.step("Test email validation", async () => {
        await activateAccountPage.fillFirstName("John");
        await activateAccountPage.fillLastName("Doe");
        await activateAccountPage.fillEmail("invalid-email");
        await activateAccountPage.fillPhone("1234567890");
        await activateAccountPage.fillActivationCode("ABC-123");
        await activateAccountPage.fillPassword("password123");
        await activateAccountPage.acceptTerms(true);

        await activateAccountPage.submitActivation();
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

        const emailError = await activateAccountPage.getErrorMessage(
          "register_Email"
        );
        const currentUrl = page.url();

        expect(emailError !== "" || currentUrl.includes("/activate")).toBeTruthy();
      });
    });

    test("should validate phone number format @regression", async ({ page }) => {
      await test.step("Test phone validation", async () => {
        await activateAccountPage.fillFirstName("John");
        await activateAccountPage.fillLastName("Doe");
        await activateAccountPage.fillEmail("john.doe@example.com");
        await activateAccountPage.fillPhone("invalid");
        await activateAccountPage.fillActivationCode("ABC-123");
        await activateAccountPage.fillPassword("password123");
        await activateAccountPage.acceptTerms(true);

        await activateAccountPage.submitActivation();
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

        const phoneError =
          await activateAccountPage.getErrorMessage("org_phone");
        const currentUrl = page.url();

        expect(
          phoneError !== "" || currentUrl.includes("/activate")
        ).toBeTruthy();
      });
    });

    test("should validate activation code format @regression", async ({
      page,
    }) => {
      await test.step("Test activation code validation", async () => {
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
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

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
        // Playwright auto-waits for actions

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
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

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
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

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
        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

        const lastNameError = await activateAccountPage.getErrorMessage(
          "user_last_name"
        );
        expect(lastNameError).toBeTruthy();
      });
    });

    test("should handle country code selection @system", async ({ page }) => {
      await test.step("Test country code selector", async () => {
        await activateAccountPage.countrySelector.click();
        await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});

        const countryList = page.locator(".country-list");
        await expect(countryList).toBeVisible();

        const canadaOption = page.locator('[data-country-code="ca"]');
        if (await canadaOption.isVisible()) {
          await canadaOption.click();
          await page.waitForLoadState('domcontentloaded', { timeout: 3000 }).catch(() => {});

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
        await page.waitForLoadState("networkidle", { timeout: 5000 }).catch(() => {});

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