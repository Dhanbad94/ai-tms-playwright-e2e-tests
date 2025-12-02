/**
 * Sets the base API URL for a given environment.
 * @param env - Name of the environment to run the tests on.
 * @returns base API URL.
 */
export default function getBaseURL(env: 'staging' | 'preproduction' | 'production'): string {
  if (env === 'production') {
    return 'https://trackmyshuttle.com/';
  }

  if (env === 'staging' || env === 'preproduction') {
    return `https://${env}.trackmyshuttle.com/`;
  }

  throw new Error(`Invalid environment: ${env}`);
}