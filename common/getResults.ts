/**
 * Pulls the results array from a response (CLI)
 */
export function getResultsCLI(): void {
  const args = process.argv.slice(2);
  if (!args[0]) {
    console.error('No input provided');
    process.exit(1);
  }
  const response = JSON.parse(args[0]);
  const results = JSON.stringify(response.results);
  console.log(results);
}

if (require.main === module) getResultsCLI();
