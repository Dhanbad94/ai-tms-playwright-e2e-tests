/**
 * add a result to results payload
 * @param {string} trResults - results payload
 * @param {string} commentBuffer = comment buffer
 * @returns {string} updated results object
 * @ */
function addComment2Result () {
  const args = process.argv.slice(2);
  const result = JSON.parse(args[0]);
  const commentBuffer = args[1];
  
  result.comment = commentBuffer;

  console.log(JSON.stringify(result));
  
}
addComment2Result();