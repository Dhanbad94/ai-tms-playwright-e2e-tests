import { APIRequestContext, request } from '@playwright/test';
import { TEST_DATA } from './test-data';
import { API_ENDPOINTS, TIMEOUTS } from '../constants';
import type { ApiResponse, ApiRequestOptions, LoginResponse } from '../types';

/**
 * API Client for TMS E2E Tests
 *
 * Provides a clean interface for making API calls during tests.
 * Useful for:
 * - Setting up test data before tests
 * - Cleaning up data after tests
 * - Hybrid API + UI testing
 * - Health checks before test suites
 */

export class ApiClient {
  private baseUrl: string;
  private requestContext: APIRequestContext | null = null;
  private authToken: string | null = null;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || TEST_DATA.baseUrl;
  }

  /**
   * Initialize the API request context
   */
  async init(): Promise<void> {
    this.requestContext = await request.newContext({
      baseURL: this.baseUrl,
      extraHTTPHeaders: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Dispose of the request context
   */
  async dispose(): Promise<void> {
    if (this.requestContext) {
      await this.requestContext.dispose();
      this.requestContext = null;
    }
  }

  /**
   * Set the authentication token for subsequent requests
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Make an API request
   */
  async request<T = unknown>(options: ApiRequestOptions): Promise<ApiResponse<T>> {
    if (!this.requestContext) {
      await this.init();
    }

    const headers: Record<string, string> = {
      ...options.headers,
    };

    if (this.authToken) {
      headers['Authorization'] = `Bearer ${this.authToken}`;
    }

    const response = await this.requestContext!.fetch(options.endpoint, {
      method: options.method,
      data: options.body,
      headers,
      timeout: options.timeout || TIMEOUTS.API,
    });

    const responseHeaders: Record<string, string> = {};
    response.headers().forEach((value, key) => {
      responseHeaders[key] = value;
    });

    let data: T;
    try {
      data = await response.json() as T;
    } catch {
      data = (await response.text()) as unknown as T;
    }

    return {
      status: response.status(),
      statusText: response.statusText(),
      data,
      headers: responseHeaders,
    };
  }

  /**
   * Convenience methods for common HTTP verbs
   */
  async get<T = unknown>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'GET', endpoint, headers });
  }

  async post<T = unknown>(endpoint: string, body?: Record<string, unknown>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'POST', endpoint, body, headers });
  }

  async put<T = unknown>(endpoint: string, body?: Record<string, unknown>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PUT', endpoint, body, headers });
  }

  async patch<T = unknown>(endpoint: string, body?: Record<string, unknown>, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'PATCH', endpoint, body, headers });
  }

  async delete<T = unknown>(endpoint: string, headers?: Record<string, string>): Promise<ApiResponse<T>> {
    return this.request<T>({ method: 'DELETE', endpoint, headers });
  }

  /**
   * Login via API and store the auth token
   */
  async login(email?: string, password?: string): Promise<LoginResponse> {
    const response = await this.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, {
      email: email || TEST_DATA.loginEmail,
      password: password || TEST_DATA.loginPassword,
    });

    if (response.status === 200 && response.data.token) {
      this.setAuthToken(response.data.token);
    }

    return response.data;
  }

  /**
   * Logout via API
   */
  async logout(): Promise<void> {
    if (this.authToken) {
      await this.post(API_ENDPOINTS.AUTH.LOGOUT);
      this.authToken = null;
    }
  }

  /**
   * Check if the API is healthy
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await this.get('/api/health');
      return response.status === 200;
    } catch {
      return false;
    }
  }
}

/**
 * Factory function to create and initialize an API client
 */
export async function createApiClient(baseUrl?: string): Promise<ApiClient> {
  const client = new ApiClient(baseUrl);
  await client.init();
  return client;
}

/**
 * Singleton instance for shared API client
 */
let sharedClient: ApiClient | null = null;

export async function getSharedApiClient(): Promise<ApiClient> {
  if (!sharedClient) {
    sharedClient = await createApiClient();
  }
  return sharedClient;
}

export async function disposeSharedApiClient(): Promise<void> {
  if (sharedClient) {
    await sharedClient.dispose();
    sharedClient = null;
  }
}
