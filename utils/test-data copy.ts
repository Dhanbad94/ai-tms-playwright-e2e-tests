// Load dotenv to ensure environment variables are available
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

export const environments = {
  staging: {
    baseUrl: 'https://staging.trackmyshuttle.com',
    loginEmail: process.env.STAGING_MANAGER_EMAIL || 'your-staging-email@example.com',
    loginPassword: process.env.STAGING_MANAGER_PASSWORD || 'your-staging-password',
  },
  dev: {
    // Dev environment uses staging credentials by default
    baseUrl: 'https://dev.trackmyshuttle.com',
    loginEmail: process.env.STAGING_MANAGER_EMAIL || 'your-staging-email@example.com',
    loginPassword: process.env.STAGING_MANAGER_PASSWORD || 'your-staging-password',
  },
  preproduction: {
    baseUrl: 'https://preproduction.trackmyshuttle.com',
    loginEmail: process.env.PREPRODUCTION_MANAGER_EMAIL || 'your-preprod-email@example.com',
    loginPassword: process.env.PREPRODUCTION_MANAGER_PASSWORD || 'your-preprod-password',
  },
  production: {
    baseUrl: 'https://trackmyshuttle.com',
    loginEmail: process.env.PROD_MANAGER_EMAIL || 'your-prod-email@example.com',
    loginPassword: process.env.PROD_MANAGER_PASSWORD || 'your-prod-password',
  },
  prod: {
    // Alias for production
    baseUrl: 'https://trackmyshuttle.com',
    loginEmail: process.env.PROD_MANAGER_EMAIL || 'your-prod-email@example.com',
    loginPassword: process.env.PROD_MANAGER_PASSWORD || 'your-prod-password',
  }
};

const ENV = (process.env.ENV || 'staging') as keyof typeof environments;
// Fallback to staging if ENV value is not recognized
export const TEST_DATA = environments[ENV] || environments.staging;
