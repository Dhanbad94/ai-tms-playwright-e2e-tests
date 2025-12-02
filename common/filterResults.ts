/**
 * Print formatted results from input JSON (used by CI scripts)
 */
export function filterResults(): void {
  const args = process.argv.slice(2);
  if (!args[0]) return;
  const results = JSON.parse(args[0]);
  console.log(results);
}

if (require.main === module) filterResults();
