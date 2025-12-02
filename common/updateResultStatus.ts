/**
 * Updates a test result status (CLI)
 */
export function updateResultStatus(): void {
  const args = process.argv.slice(2);
  const id = args[0];
  const status = args[1];
  console.log(JSON.stringify({ id, status }));
}

if (require.main === module) updateResultStatus();
