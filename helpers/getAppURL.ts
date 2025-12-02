import * as fs from 'fs';
import * as path from 'path';

type Environment = 'staging' | 'preproduction' | 'production';

interface EnvConfig {
  url: string;
}

interface EnvironmentDomainMap {
  [key: string]: EnvConfig;
}

/**
 * Returns the base application URL based on the given environment.
 * @param env - Environment name ('staging' | 'preproduction' | 'production')
 * @param _creds - Optional creds param (retained for backward compatibility, but not used)
 * @returns The launch URL string
 */
export default function getAppURL(env: Environment, _creds?: unknown): string {
  const configPath = path.join(process.cwd(), 'config/environment-domain-map.json');
  const fileContent = fs.readFileSync(configPath, 'utf-8');
  const envMap: EnvironmentDomainMap = JSON.parse(fileContent);

  const config = envMap[env];

  if (!config?.url) {
    throw new Error(`URL not defined for environment: ${env}`);
  }

  return config.url;
}
