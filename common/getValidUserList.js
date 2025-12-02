const fs = require('fs');

/**
 * 1st parameter: env current environment
 * 2nd parameter: module to find the correct user
 *  @returns {string} userList
 */
function getValidUserList() {
  const allCredentials = JSON.parse(fs.readFileSync('./config/logins.json'));
  const args = process.argv.slice(2);
  let userList = '';

  if (typeof allCredentials[`${args[0]}`][`${args[1]}`] !== 'undefined') {
    // eslint-disable-next-line func-names
    allCredentials[`${args[0]}`][`${args[1]}`].forEach((user) => {
      // check run value
      if (user.run) {
        userList = userList.concat(` ${user.username}`);
      }
    });
  } else {
    userList = 'none';
  }
  console.log(userList);
}
getValidUserList();
