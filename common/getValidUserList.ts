import * as fs from 'fs';

/**
 * CLI: getValidUserList env module
 */
export function getValidUserList(): void {
  const content = fs.readFileSync('./config/logins.json', 'utf8');
  const allCredentials = JSON.parse(content) as any;
  const args = process.argv.slice(2);
  let userList = '';

  if (args[0] && args[1] && allCredentials?.[args[0]]?.[args[1]] !== undefined) {
    (allCredentials[args[0] as string][args[1] as string] as any[]).forEach((user) => {
      if (user.run) {
        userList = userList.concat(` ${user.username}`);
      }
    });
  } else {
    userList = 'none';
  }
  console.log(userList);
}

if (require.main === module) getValidUserList();
