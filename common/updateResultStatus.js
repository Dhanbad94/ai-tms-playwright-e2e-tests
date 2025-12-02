/**
 * update the result status
 * @param {string} result - current result
 * @param {integer} caseID - case id
 * @param {integer} browserID - browser id
 * @param {integer} status - status
 */
function updateResultStatus () {
  const args = process.argv.slice(2);
  const result = JSON.parse(args[0]);

  result.status_id = 5;
  console.log(JSON.stringify(result));
}
updateResultStatus ();