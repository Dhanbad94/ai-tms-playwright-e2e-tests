/**
 * CLI: findShortcut - searches shortcuts.json for a matching value
 */
import * as fs from 'fs';

export function findShortcut(key: string): string | null {
  const configRaw = fs.readFileSync('shortcuts.json', 'utf8');
  const shortcuts = JSON.parse(configRaw) as Record<string, any>;
  return shortcuts?.[key] ?? null;
}

if (require.main === module) {
  const args = process.argv.slice(2);
  if (!args[0]) console.log('');
  else console.log(findShortcut(args[0]));
}
