/**
 * Pulls the results array from a response
 * @param {string} response - results list from Testrail
 * @return {array} results - array of results
 */
function getResults() {
  // extract args
  const args = process.argv.slice(2);
  const response = JSON.parse(args[0]);
  const results = JSON.stringify(response.results);
  console.log(results);
}
getResults();
