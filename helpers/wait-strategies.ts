/**
 * Playwright Wait Strategies Helper
 * Provides proper wait methods following Playwright best practices
 * Replaces anti-pattern waitForTimeout() calls with condition-based waits
 */

import { Page, Locator, expect } from "@playwright/test";

/**
 * Wait for an element to become stable/visible after an action
 * Used for actions that trigger animations or DOM updates
 * @param locator - The locator to wait for
 * @param timeout - Maximum time to wait in ms (default 5000)
 */
export async function waitForElementStable(
  locator: Locator,
  timeout: number = 5000
): Promise<void> {
  await expect(locator).toBeVisible({ timeout });
}

/**
 * Wait for element to be hidden/removed from DOM
 * Useful for verifying deletion or dismissal of elements
 * @param locator - The locator to wait for
 * @param timeout - Maximum time to wait in ms (default 5000)
 */
export async function waitForElementHidden(
  locator: Locator,
  timeout: number = 5000
): Promise<void> {
  await locator.waitFor({ state: "hidden", timeout });
}

/**
 * Wait for element to have a specific value
 * Better than hard sleep for form input verification
 * @param locator - The input locator
 * @param value - Expected value
 * @param timeout - Maximum time to wait in ms (default 5000)
 */
export async function waitForInputValue(
  locator: Locator,
  value: string,
  timeout: number = 5000
): Promise<void> {
  await expect(locator).toHaveValue(value, { timeout });
}

/**
 * Wait for element to be enabled/disabled
 * @param locator - The locator to check
 * @param timeout - Maximum time to wait in ms (default 5000)
 */
export async function waitForElementEnabled(
  locator: Locator,
  timeout: number = 5000
): Promise<void> {
  await expect(locator).toBeEnabled({ timeout });
}

export async function waitForElementDisabled(
  locator: Locator,
  timeout: number = 5000
): Promise<void> {
  await expect(locator).toBeDisabled({ timeout });
}

/**
 * Wait for page to stabilize after navigation or action
 * Replaces hard waits with proper network idle detection
 * @param page - The Playwright page object
 * @param loadState - Type of load state to wait for ('load', 'domcontentloaded', 'networkidle')
 * @param timeout - Maximum time to wait in ms (default 10000)
 */
export async function waitForPageStable(
  page: Page,
  loadState: "load" | "domcontentloaded" | "networkidle" = "networkidle",
  timeout: number = 10000
): Promise<void> {
  try {
    await page.waitForLoadState(loadState, { timeout });
  } catch (e) {
    // Network idle might timeout on dynamic applications - that's ok
    if (loadState !== "networkidle") {
      throw e;
    }
  }
}

/**
 * Wait for a locator to exist in DOM
 * @param locator - The locator to find
 * @param timeout - Maximum time to wait in ms (default 5000)
 */
export async function waitForLocatorExists(
  locator: Locator,
  timeout: number = 5000
): Promise<void> {
  await locator.waitFor({ state: "attached", timeout });
}

/**
 * Wait for an element count to match expected value
 * Useful for dynamic lists/tables
 * @param locator - The locator to count
 * @param count - Expected count
 * @param timeout - Maximum time to wait in ms (default 10000)
 */
export async function waitForElementCount(
  locator: Locator,
  count: number,
  timeout: number = 10000
): Promise<void> {
  await expect(locator).toHaveCount(count, { timeout });
}

/**
 * Wait for an element to have specific text
 * @param locator - The locator to check
 * @param text - Expected text (regex or string)
 * @param timeout - Maximum time to wait in ms (default 5000)
 */
export async function waitForElementText(
  locator: Locator,
  text: string | RegExp,
  timeout: number = 5000
): Promise<void> {
  if (typeof text === "string") {
    await expect(locator).toContainText(text, { timeout });
  } else {
    await expect(locator).toHaveText(text, { timeout });
  }
}

/**
 * Wait for a class to be added/removed from element
 * Useful for detecting state changes via CSS class
 * @param locator - The locator to check
 * @param className - The class name to look for
 * @param timeout - Maximum time to wait in ms (default 5000)
 */
export async function waitForClassPresence(
  locator: Locator,
  className: string,
  timeout: number = 5000
): Promise<void> {
  const endTime = Date.now() + timeout;
  while (Date.now() < endTime) {
    const classes = await locator.getAttribute("class");
    if (classes && classes.includes(className)) {
      return;
    }
    await locator.page().waitForTimeout(50);
  }
  throw new Error(`Class "${className}" not found on element after ${timeout}ms`);
}

/**
 * Wait for function condition to be true
 * Most flexible option for custom conditions
 * @param page - The Playwright page
 * @param condition - Function that returns boolean
 * @param timeout - Maximum time to wait in ms (default 5000)
 */
export async function waitForCondition(
  page: Page,
  condition: () => Promise<boolean> | boolean,
  timeout: number = 5000
): Promise<void> {
  const endTime = Date.now() + timeout;
  while (Date.now() < endTime) {
    const result = await condition();
    if (result) {
      return;
    }
    await page.waitForTimeout(100);
  }
  throw new Error(`Condition not met after ${timeout}ms`);
}

/**
 * Wait after a click action for common scenarios
 * Handles the common pattern: click -> wait for something to happen
 * @param locator - The element clicked
 * @param waitForLocator - Optional: element to wait for after click
 * @param timeout - Maximum time to wait in ms (default 5000)
 */
export async function waitAfterClick(
  locator: Locator,
  waitForLocator?: Locator,
  timeout: number = 5000
): Promise<void> {
  await locator.click();

  if (waitForLocator) {
    // Try waiting for the element to be visible
    try {
      await waitForElementStable(waitForLocator, timeout);
    } catch {
      // If it doesn't appear, maybe it's supposed to hide?
      try {
        await waitForElementHidden(waitForLocator, timeout);
      } catch {
        // Neither appeared nor hidden, just continue
      }
    }
  } else {
    // No specific element to wait for, wait for page to stabilize
    await waitForPageStable(locator.page(), "domcontentloaded", timeout);
  }
}

/**
 * Wait after filling input for validation/updates
 * @param locator - The input element
 * @param value - Value being filled
 * @param timeout - Maximum time to wait in ms (default 5000)
 */
export async function waitAfterFill(
  locator: Locator,
  value: string,
  timeout: number = 5000
): Promise<void> {
  await locator.fill(value);
  // Wait for the value to actually be set in the input
  await expect(locator).toHaveValue(value, { timeout });
}

/**
 * Wait for multiple elements in sequence
 * @param locators - Array of locators to wait for
 * @param timeout - Maximum time per element in ms (default 5000)
 */
export async function waitForMultiple(
  locators: Locator[],
  timeout: number = 5000
): Promise<void> {
  for (const locator of locators) {
    await waitForElementStable(locator, timeout);
  }
}
