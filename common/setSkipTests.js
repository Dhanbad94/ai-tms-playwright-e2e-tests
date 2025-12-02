// This file contains functions used by the tests
const fs = require("fs");

/**
 * Tells caller if tests should run in the given environment
 * Uses environments.json
 *  @function setSkipTests
 * @param {string} env - current environment under test
 * @param {string} module - current test suite path
 * @returns {boolean} tells caller to skip tests if product is not available in current environment
 */
export default function setSkipTests(env, module) {
  // read environments.json
  const environments = JSON.parse(fs.readFileSync("environmentsProductsMap.json"));
  const masterProduct = module.split('/')[0];
  // loop thru product's array and set skipTests to true if current environment is not found
  let skipTests = false;
  const found = environments[masterProduct].find(environment => environment === env);
  if (typeof found === 'undefined') {
    skipTests = true;
  }
  return skipTests;
}
