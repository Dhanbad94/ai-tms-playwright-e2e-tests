import * as fs from 'fs';

export function findUserProd(): void {
  const allCredentials = JSON.parse(fs.readFileSync('./config/logins.json', 'utf8')) as any;
  const args = process.argv.slice(2);
  if (!args[2]) {
    console.log('undefined');
    return;
  }
  const iUser = `${args[2].toUpperCase()}.sa`;

  const creds = allCredentials?.[args[0] as string]?.[args[1] as string]?.find((obj: any) => obj.username === `${iUser}`);
  if (`${args[3]}` === 'true' && !creds?.run) console.log('undefined');
  else console.log(creds);
}

if (require.main === module) findUserProd();
