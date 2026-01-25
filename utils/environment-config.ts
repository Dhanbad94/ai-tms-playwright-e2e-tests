// utils/environment-config.ts

export interface EnvironmentConfig {
  orgName: string;
  trackingId: string;
  orgSelectors: string[];
  trackingSelectors: string[];
}

// Define the configurations with explicit typing
const STAGING_CONFIG: EnvironmentConfig = {
  orgName: "Automated OD ASAP",
  trackingId: "ODASAP",
  orgSelectors: [
    'a:has-text("Automated OD ASAP")',
    'a:has-text("Automated OD ASAP")',
    'text="Automated OD ASAP"',
    '[title="Automated OD ASAP"]',
  ],
  trackingSelectors: [
    'text="Tracking ID : ODASAP"',
    'text="Tracking ID: ODASAP"',
    'text="ODASAP"',
    '[data-tracking-id="ODASAP"]',
  ],
};

const PREPRODUCTION_CONFIG: EnvironmentConfig = {
  orgName: "Test Hotel edit",
  trackingId: "TESTD",
  orgSelectors: [
    'a:has-text("Test Hotel edit")',
    'a:has-text("Test Hotel")',
    'text="Test Hotel edit"',
    '[title="Test Hotel edit"]',
  ],
  trackingSelectors: [
    'text="Tracking ID : TESTD"',
    'text="Tracking ID: TESTD"',
    'text="TESTD"',
    '[data-tracking-id="TESTD"]',
  ],
};

const PRODUCTION_CONFIG: EnvironmentConfig = {
  orgName: "-Automated OD ASAP", // Update this if production has different org name
  trackingId: "ODASAP", // Update this if production has different tracking ID
  orgSelectors: [
    'a:has-text("Automated OD ASAP")',
    'a:has-text("Automated OD ASAP")',
    'text="Automated OD ASAP"',
    '[title="Automated OD ASAP"]',
  ],
  trackingSelectors: [
    'text="Tracking ID : ODASAP"',
    'text="Tracking ID: ODASAP"',
    'text="ODASAP"',
    '[data-tracking-id="ODASAP"]',
  ],
};

export const ENVIRONMENT_CONFIGS = {
  staging: STAGING_CONFIG,
  preproduction: PREPRODUCTION_CONFIG,
  production: PRODUCTION_CONFIG,
} as const;

// Define valid environment keys as a union type
export type ValidEnvironment = keyof typeof ENVIRONMENT_CONFIGS;

/**
 * Get environment configuration based on ENV variable or URL detection
 * This function guarantees to return a valid EnvironmentConfig
 */
export function getEnvironmentConfig(page?: any): EnvironmentConfig {
  let environment = process.env.ENV?.toLowerCase() || "";

  // If no ENV variable, try to detect from page URL
  if (!environment && page) {
    try {
      const url = page.url();
      if (url.includes("preproduction") || url.includes("preprod")) {
        environment = "preproduction";
      } else if (url.includes("production") || url.includes("prod")) {
        environment = "production";
      } else {
        environment = "staging";
      }
    } catch {
      environment = "staging";
    }
  }

  // Use switch statement to ensure TypeScript knows we always return a valid config
  switch (environment) {
    case "staging":
      return ENVIRONMENT_CONFIGS.staging;
    case "preproduction":
      return ENVIRONMENT_CONFIGS.preproduction;
    case "production":
      return ENVIRONMENT_CONFIGS.production;
    default:
      console.warn(
        `Unknown environment '${environment}', defaulting to staging`,
      );
      return ENVIRONMENT_CONFIGS.staging;
  }
}

/**
 * Get all possible selectors for organization dropdown across all environments
 * Useful for fallback scenarios
 */
export function getAllOrgSelectors(): string[] {
  const allSelectors = new Set<string>();

  // Add selectors from all environments
  ENVIRONMENT_CONFIGS.staging.orgSelectors.forEach((selector) =>
    allSelectors.add(selector),
  );
  ENVIRONMENT_CONFIGS.preproduction.orgSelectors.forEach((selector) =>
    allSelectors.add(selector),
  );
  ENVIRONMENT_CONFIGS.production.orgSelectors.forEach((selector) =>
    allSelectors.add(selector),
  );

  // Add generic fallback selectors
  const genericSelectors = [
    '[data-toggle="dropdown"]',
    ".dropdown-toggle",
    ".profile-dropdown",
    ".organization-dropdown",
    ".nav-link:has(.organization)",
    'button[aria-haspopup="true"]',
  ];

  genericSelectors.forEach((selector) => allSelectors.add(selector));

  return Array.from(allSelectors);
}

/**
 * Get all possible selectors for tracking ID across all environments
 */
export function getAllTrackingSelectors(): string[] {
  const allSelectors = new Set<string>();

  // Add selectors from all environments
  ENVIRONMENT_CONFIGS.staging.trackingSelectors.forEach((selector) =>
    allSelectors.add(selector),
  );
  ENVIRONMENT_CONFIGS.preproduction.trackingSelectors.forEach((selector) =>
    allSelectors.add(selector),
  );
  ENVIRONMENT_CONFIGS.production.trackingSelectors.forEach((selector) =>
    allSelectors.add(selector),
  );

  // Add generic fallback selectors
  const genericSelectors = [
    'text="Tracking ID"',
    ".tracking-id",
    '[class*="tracking"]',
    ".hotel__id-box",
    '[data-testid="tracking-id"]',
  ];

  genericSelectors.forEach((selector) => allSelectors.add(selector));

  return Array.from(allSelectors);
}

/**
 * Validate environment configuration
 */
export function validateEnvironmentConfig(config: EnvironmentConfig): boolean {
  return !!(
    config.orgName &&
    config.trackingId &&
    config.orgSelectors.length > 0 &&
    config.trackingSelectors.length > 0
  );
}

/**
 * Log environment configuration for debugging
 */
export function logEnvironmentConfig(environment: string): void {
  let config: EnvironmentConfig;

  switch (environment.toLowerCase()) {
    case "staging":
      config = ENVIRONMENT_CONFIGS.staging;
      break;
    case "preproduction":
      config = ENVIRONMENT_CONFIGS.preproduction;
      break;
    case "production":
      config = ENVIRONMENT_CONFIGS.production;
      break;
    default:
      console.warn(
        `Unknown environment '${environment}', showing staging config`,
      );
      config = ENVIRONMENT_CONFIGS.staging;
      break;
  }

  // Environment configuration logging suppressed to reduce verbosity
}
