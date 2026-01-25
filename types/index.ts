/**
 * Centralized TypeScript types and interfaces for TMS E2E tests
 */

import { Page, Locator, APIResponse } from '@playwright/test';

// ============================================================================
// Environment & Configuration Types
// ============================================================================

export type Environment = 'staging' | 'preproduction' | 'production';

export interface EnvironmentConfig {
  baseUrl: string;
  loginEmail: string;
  loginPassword: string;
}

export interface EnvironmentConfigs {
  staging: EnvironmentConfig;
  preproduction: EnvironmentConfig;
  production: EnvironmentConfig;
}

// ============================================================================
// API Types
// ============================================================================

export interface ApiResponse<T = unknown> {
  status: number;
  statusText: string;
  data: T;
  headers: Record<string, string>;
}

export interface ApiRequestOptions {
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  endpoint: string;
  body?: Record<string, unknown>;
  headers?: Record<string, string>;
  timeout?: number;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: UserInfo;
  error?: string;
}

export interface UserInfo {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  organizationId?: string;
}

export type UserRole = 'admin' | 'manager' | 'operator' | 'viewer';

// ============================================================================
// Test Data Types
// ============================================================================

export interface TestUser {
  email: string;
  password: string;
  role: UserRole;
  name?: string;
}

export interface TestCredentials {
  manager: TestUser;
  operator: TestUser;
  admin?: TestUser;
}

// ============================================================================
// Page Object Types
// ============================================================================

export interface PageObject {
  readonly page: Page;
  goto(): Promise<void>;
  waitForPageLoad(): Promise<void>;
}

export interface FormField {
  locator: Locator;
  name: string;
  required?: boolean;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

// ============================================================================
// Test Result Types (for custom reporters)
// ============================================================================

export interface TestResult {
  testName: string;
  status: 'passed' | 'failed' | 'skipped' | 'timedOut';
  duration: number;
  error?: string;
  retries: number;
}

export interface TestSuiteResult {
  suiteName: string;
  tests: TestResult[];
  totalPassed: number;
  totalFailed: number;
  totalSkipped: number;
  duration: number;
}

// ============================================================================
// Utility Types
// ============================================================================

export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type Awaited<T> = T extends Promise<infer U> ? U : T;

// Selector strategy type
export type SelectorStrategy = 'role' | 'testId' | 'text' | 'css' | 'xpath';

export interface LocatorConfig {
  strategy: SelectorStrategy;
  value: string;
  fallbacks?: string[];
}
