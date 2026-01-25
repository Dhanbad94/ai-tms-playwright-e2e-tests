/**
 * ASAP Mode Test Data and Fixtures
 */
import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

// Environment detection
const ENV = (process.env.ENV || "staging").toLowerCase();

/**
 * Get credentials for a specific role
 */
export function getCredentials(role: "MANAGER" | "OPERATOR") {
  const envPrefix =
    ENV === "preproduction"
      ? "PREPRODUCTION"
      : ENV === "production" || ENV === "prod"
        ? "PROD"
        : "STAGING";

  return {
    email: process.env[`${envPrefix}_${role}_EMAIL`] || "",
    password: process.env[`${envPrefix}_${role}_PASSWORD`] || "",
  };
}

/**
 * Base URLs by environment
 */
export const BASE_URLS = {
  staging: "https://staging.trackmyshuttle.com",
  preproduction: "https://preproduction.trackmyshuttle.com",
  production: "https://trackmyshuttle.com",
  prod: "https://trackmyshuttle.com",
} as const;

/**
 * Get base URL for current environment
 */
export function getBaseUrl(): string {
  return BASE_URLS[ENV as keyof typeof BASE_URLS] || BASE_URLS.staging;
}

/**
 * ASAP Mode Organization Configuration
 */
export const ASAP_ORG_CONFIG = {
  name: "Automated OD ASAP",
  trackingId: "ODASAP",
  address: "811 East Grand Avenue, Bensenville, Illinois, 60106, United States",
  timezone: "(GMT-05:00) America, Chicago",
};

/**
 * Settings Tab URL Hashes
 */
export const SETTINGS_TAB_HASHES = {
  organization: "",
  userManagement: "#members",
  operationSettings: "#platformSetting",
  operationHours: "#hours-of-operation",
  riderApp: "#guests",
  driverApp: "#driver-setting",
  liveDisplay: "#live_display",
  alerts: "#alerts",
  escalations: "#escaltionSettings",
  pricingSetup: "#stripe",
} as const;

/**
 * Settings Tab Names (for navigation)
 */
export const SETTINGS_TAB_NAMES = [
  "Organization",
  "User Management",
  "Operation Settings",
  "Operation Hours",
  "Rider App",
  "Driver App",
  "Live display",
  "Alerts",
  "Escalations",
  "Pricing Setup",
] as const;

/**
 * User Roles
 */
export const USER_ROLES = {
  MANAGER: "Manager",
  OPERATOR: "Operator",
  DRIVER: "Driver",
} as const;

/**
 * Test User Data Generator
 */
export function generateTestUser(role: "Manager" | "Operator" | "Driver" = "Operator") {
  const timestamp = Date.now();
  return {
    role,
    email: `test.user.${timestamp}@example.com`,
    firstName: "Test",
    lastName: `User${timestamp}`,
    phone: `555${String(timestamp).slice(-7)}`,
  };
}

/**
 * Existing Test Users
 */
export const EXISTING_USERS = {
  manager: {
    name: "automation manager",
    email: "automated.manager@trackmyshuttle.com",
    role: "MANAGER",
  },
  operator: {
    name: "automation operator",
    email: "automated.operator@trackmyshuttle.com",
    role: "OPERATOR",
  },
};

/**
 * Operation Settings Defaults for ASAP Mode
 * Note: These values reflect the actual defaults configured for the test organization
 */
export const ASAP_OPERATION_DEFAULTS = {
  pickupTime: "asap", // ASAP Pickup
  pickupStops: "predefinedPlusServiceArea", // Pre-Defined Stops + Service Area
  rideSharing: "shared", // Shared Rides
  driverAssignment: "driverSelf", // Driver Self-Assignment (Operator Bypass)
  shuttleCapacity: "static", // Static Capacity
};

/**
 * Operation Hours Defaults
 */
export const OPERATION_HOURS_DEFAULTS = {
  mode: "24x7", // Run 24/7
};

/**
 * Rider App Cancellation Reasons
 */
export const CANCELLATION_REASONS = [
  "Ride request was not accepted",
  "Wait time was too long",
  "Change in travel plans",
  "Found alternative ride",
  "App or technical issue",
];

/**
 * Alert Types
 */
export const ALERT_TYPES = {
  geofence: {
    name: "Geofence Alert",
    defaultRadius: "10",
  },
};

/**
 * Escalation Types
 */
export const ESCALATION_TYPES = {
  rideRequestNotAddressed: "Notify when Ride Request is not addressed by Driver on time",
  tripNotStarted: "Notify when Trip not started by Driver",
};

/**
 * Performance Thresholds (in milliseconds)
 */
export const PERFORMANCE_THRESHOLDS = {
  pageLoad: 5000,
  tabSwitch: 2000,
  dialogOpen: 1000,
  searchResults: 1000,
};

/**
 * Timeouts
 */
export const TIMEOUTS = {
  short: 5000,
  medium: 10000,
  long: 15000,
  navigation: 20000,
};
