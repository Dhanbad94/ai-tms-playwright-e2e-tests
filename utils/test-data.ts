export const environments = {
  staging: {
    baseUrl: 'https://php-staging.trackmyshuttle.com',
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
  }
};

// Normalize ENV: lowercase, map common aliases, and fall back to staging for
// any unknown value so TEST_DATA is always defined (avoids crashes like
// `Cannot read properties of undefined (reading 'baseUrl')`).
function resolveEnv(raw: string | undefined): keyof typeof environments {
  const e = (raw || 'staging').toLowerCase();
  if (e === 'prod' || e === 'production') return 'production';
  if (e === 'preprod' || e === 'preproduction') return 'preproduction';
  if (e === 'staging') return 'staging';
  console.warn(`⚠️  Unknown ENV "${raw}", falling back to "staging".`);
  return 'staging';
}

const ENV = resolveEnv(process.env.ENV);
export const TEST_DATA = environments[ENV];
