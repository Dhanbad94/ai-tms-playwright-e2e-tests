const fs = require('fs');

/**
 * 1st parameter: env current environment
 * 2nd parameter: module to find the correct user
 * 3rd parameter: user to verify
 * 4th parameter: check if user should run
 *  @returns {object} creds
 */
function findUserProd() {
  const allCredentials = JSON.parse(fs.readFileSync('./config/logins.json'));
  const args = process.argv.slice(2);
  const iUser = `${args[2].toUpperCase()}.sa`;

  // search credentials for iUser for the product
  const creds = allCredentials[`${args[0]}`][`${args[1]}`].find(
    (obj) => obj.username === `${iUser}`,
  );
  // check run value
  if (`${args[3]}` === 'true' && !creds.run) console.log('undefined');
  else console.log(creds);
}
findUserProd();
