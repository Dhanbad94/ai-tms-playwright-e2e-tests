import * as fs from 'fs';
const xml2js: any = require('xml2js');

export async function getTimefromXML(): Promise<void> {
  const args = process.argv.slice(2);
  if (!args[0]) return;
  const xml = fs.readFileSync(args[0], 'utf8');
  const parsed = await xml2js.parseStringPromise(xml); // type any
  const time = parsed?.testsuite?.$?.time ?? '0';
  console.log(time);
}

if (require.main === module) {
  // eslint-disable-next-line no-console
  getTimefromXML().catch((e) => console.error(e));
}
