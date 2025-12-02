import * as fs from 'fs';

/**
 * Tells caller if tests should run in the given environment
 */
export default function setSkipTests(env: string, modulePath: string): boolean {
  const environments = JSON.parse(fs.readFileSync('environmentsProductsMap.json', 'utf8')) as any;
  const masterProduct = modulePath.split('/')[0];
  const list = environments?.[masterProduct as string];
  if (!list) return true;
  const found = list.find((environment: string) => environment === env);
  return typeof found === 'undefined';
}
