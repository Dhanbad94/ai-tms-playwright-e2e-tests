/**
 * add a result to result payload
 * @param {integer} browserID - browser id
 * @param {string} env - test environment
 * @param {string} tag - smoke or system
 * @param {string} elapsedTime - execution time of test
 * @return {string} updated result payload
 */
function add2Result() {
  const args = process.argv.slice(2);
  const browserID = args[0];
  const env = args[1];
  const tag = args[2];
  const time = args[3];

  const result = {};
  result.status_id = 1;
  result.custom_kind = 2;
  result.custom_browser_id = parseInt(browserID);

  switch (env) {
    case 'staging':
      result.custom_env = 1;
      break;
    case 'preproduction':
      result.custom_env = 2;
      break;
    case 'prod':
      result.custom_env = 3;
      break;
  }
  if (tag == 'smoke') {
    result.custom_class = 1;
  } else if (tag == 'system') {
    result.custom_class = 2;
  }

  result.elapsed = time;
  console.log(JSON.stringify(result));
}
add2Result();
