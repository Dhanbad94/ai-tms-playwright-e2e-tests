import { Page } from "@playwright/test";

/**
 * Auto-dismiss the site-wide cookie-consent banner ("Ok Accept").
 *
 * The banner is `position: fixed` and can intercept clicks on bottom-of-page
 * controls (e.g. "Back to Login", "Privacy Policy"). Registering a locator
 * handler makes Playwright click "Ok Accept" automatically whenever the banner
 * appears, before any other action that it would otherwise block.
 *
 * Call this once at the start of `beforeEach`, before the first navigation.
 */
export async function autoDismissCookieBanner(page: Page): Promise<void> {
  await page.addLocatorHandler(
    page.getByRole("button", { name: /ok accept/i }),
    async (button) => {
      await button.click();
    }
  );
}
