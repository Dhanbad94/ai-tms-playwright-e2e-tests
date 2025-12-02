const fs = require('fs');

/**
* 1st parameter: possible shortcut
*  @returns {string} fullValue
 */
function findShortcut() {
  const allShortcuts = JSON.parse(fs.readFileSync('./config/shortcuts.json'));
  const args = process.argv.slice(2);

  // search credentials for iUser for the product
  const fullValue = allShortcuts[`${args[0]}`];
  // check run value
  if  (`${fullValue}` === "undefined")
    console.log(`${args[0]}`);
  else
    console.log(fullValue);
}
findShortcut();
