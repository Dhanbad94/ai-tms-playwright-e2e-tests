import * as fs from 'fs';

export function concatenateTestResults(): void {
  const args = process.argv.slice(2);
  const paths = args; // simple: log inputs
  const outputs = paths.map((p: string) => fs.readFileSync(p, 'utf8'));
  console.log(outputs.join('\n'));
}

if (require.main === module) concatenateTestResults();
