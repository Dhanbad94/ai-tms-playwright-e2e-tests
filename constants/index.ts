/**
 * Centralized constants for TMS E2E tests
 * Import specific constants or the entire module as needed
 */

// ============================================================================
// Timeout Constants (in milliseconds)
// ============================================================================

export const TIMEOUTS = {
  /** Default action timeout (clicks, fills, etc.) */
  ACTION: 10000,
  /** Navigation timeout */
  NAVIGATION: 30000,
  /** Assertion/expect timeout */
  EXPECT: 10000,
  /** Page load timeout */
  PAGE_LOAD: 30000,
  /** Short wait for animations */
  SHORT: 500,
  /** Medium wait for async operations */
  MEDIUM: 2000,
  /** Long wait for slow operations */
  LONG: 5000,
  /** API request timeout */
  API: 15000,
} as const;

// ============================================================================
// Viewport Constants
// ============================================================================

export const VIEWPORTS = {
  DESKTOP: { width: 1280, height: 720 },
  DESKTOP_LARGE: { width: 1920, height: 1080 },
  TABLET: { width: 768, height: 1024 },
  MOBILE: { width: 375, height: 667 },
  MOBILE_LARGE: { width: 414, height: 896 },
} as const;

// ============================================================================
// URL Paths
// ============================================================================

export const PATHS = {
  LOGIN: '/login',
  DASHBOARD: '/dashboard',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  ACTIVATE_ACCOUNT: '/activate',
  FORGOT_PASSWORD: '/recover-account',
  LOGOUT: '/logout',
} as const;

// ============================================================================
// Test Tags
// ============================================================================

export const TAGS = {
  /** Quick sanity check tests */
  SMOKE: '@smoke',
  /** Full regression test suite */
  REGRESSION: '@regression',
  /** System/integration tests */
  SYSTEM: '@system',
  /** Performance-related tests */
  PERFORMANCE: '@performance',
  /** Business-critical path tests */
  CRITICAL: '@critical',
  /** Tests known to be flaky */
  FLAKY: '@flaky',
  /** Tests that take longer than usual */
  SLOW: '@slow',
  /** Manager role tests */
  MANAGER: '@manager',
  /** Operator role tests */
  OPERATOR: '@operator',
  /** Admin role tests */
  ADMIN: '@admin',
  /** API-related tests */
  API: '@api',
} as const;

// ============================================================================
// Error Messages
// ============================================================================

export const ERROR_MESSAGES = {
  // Login errors
  INVALID_EMAIL: 'Please enter a valid email address',
  INVALID_PASSWORD: 'Please enter a valid password',
  EMPTY_EMAIL: 'Email is required',
  EMPTY_PASSWORD: 'Password is required',
  INVALID_CREDENTIALS: 'Invalid email or password',
  ACCOUNT_LOCKED: 'Account has been locked',

  // Form validation
  REQUIRED_FIELD: 'This field is required',
  INVALID_FORMAT: 'Invalid format',

  // Network errors
  NETWORK_ERROR: 'Network error occurred',
  TIMEOUT_ERROR: 'Request timed out',
  SERVER_ERROR: 'Server error occurred',
} as const;

// ============================================================================
// Success Messages
// ============================================================================

export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful',
  LOGOUT_SUCCESS: 'Logout successful',
  PASSWORD_RESET_SENT: 'Password reset link sent',
  ACCOUNT_ACTIVATED: 'Account activated successfully',
  PROFILE_UPDATED: 'Profile updated successfully',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

// ============================================================================
// Test Data Constants
// ============================================================================

export const TEST_DATA_CONSTANTS = {
  // Valid test data
  VALID_EMAIL_FORMAT: 'test@example.com',
  VALID_PASSWORD_MIN_LENGTH: 8,

  // Invalid test data for negative testing
  INVALID_EMAILS: [
    'invalid-email',
    'invalid@',
    '@invalid.com',
    'invalid@.com',
    'invalid email@test.com',
  ],
  INVALID_PASSWORDS: [
    '123', // too short
    '', // empty
  ],

  // Random data generation
  RANDOM_STRING_LENGTH: 10,
} as const;

// ============================================================================
// Selector Fallbacks (for resilient tests)
// ============================================================================

export const SELECTOR_FALLBACKS = {
  LOGIN_FORM: [
    '#frm_login',
    'form[name="email-form"]',
    'form[action*="login"]',
    '.loginForm form',
    'form',
  ],
  EMAIL_INPUT: [
    '#login_email',
    'input[type="email"]',
    'input[name="email"]',
    '[data-testid="email-input"]',
  ],
  PASSWORD_INPUT: [
    '#login_pass',
    'input[type="password"]',
    'input[name="password"]',
    '[data-testid="password-input"]',
  ],
  SUBMIT_BUTTON: [
    'button[type="submit"]',
    '[data-testid="submit-button"]',
    '.submit-btn',
  ],
} as const;

// ============================================================================
// API Endpoints
// ============================================================================

export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    LOGOUT: '/api/auth/logout',
    REFRESH: '/api/auth/refresh',
    VERIFY: '/api/auth/verify',
  },
  USER: {
    PROFILE: '/api/user/profile',
    SETTINGS: '/api/user/settings',
  },
} as const;

// ============================================================================
// Browser Storage Keys
// ============================================================================

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'authToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences',
  SESSION_ID: 'sessionId',
} as const;

// ============================================================================
// Export all constants as default
// ============================================================================

export default {
  TIMEOUTS,
  VIEWPORTS,
  PATHS,
  TAGS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  TEST_DATA_CONSTANTS,
  SELECTOR_FALLBACKS,
  API_ENDPOINTS,
  STORAGE_KEYS,
};
