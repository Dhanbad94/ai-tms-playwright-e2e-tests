import { Environment } from '../types/env';

/**
 * Returns user credentials from environment variables.
 * @param env - Environment name
 * @returns An object with `email` and `password`
 */
export function getUserCredentials(env: Environment): { email: string; password: string } {
  const envUpper = env.toUpperCase(); // "STAGING", "PRODUCTION", etc.

  const email = process.env[`${envUpper}_EMAIL`];
  const password = process.env[`${envUpper}_PASSWORD`];

  if (!email || !password) {
    throw new Error(`Missing credentials for environment: ${env}`);
  }

  return { email, password }; //
}
