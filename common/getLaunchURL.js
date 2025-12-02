const fs = require('fs');
/**
 * Add product and fragment to baseURL and returns launchURL
 *  @function setLaunchURL
 * @param {string} env - current environment under test
 * @param {string} customer - trackmyshuttle
 * @returns {string} launchURL
 */

export default function setLaunchURL(env, customer) {
  let launchURL;

  switch (env) {
    case 'staging':
      launchURL = 'https://staging.trackmyshuttle.com/';
      break;
    case 'preproduction':
      launchURL = 'https://preproduction.trackmyshuttle.com/';
      break;
    case 'prod':
      launchURL = 'https://trackmyshuttle.com/';
      break;
    default:
      launchURL = `https://${customer}.trackmyshuttle.${env}.com/`;
  }

  return launchURL;
}

/**
 * Add product and fragment to baseURL and returns launchURL
 *  @function setLaunchURL
 * @param {string} env - current environment under test
 * @param {string} module - current test suite path
 * @param {string} creds - current credentials from login.json
 * @returns {string} launchURL
 */
export function setLaunchURLold(env, module, creds) {
  let launchURL;
  // extract masterProduct from module
  let masterProduct = '';
  if (module === '') {
    masterProduct = 'trackmyshuttle';
  } else {
    masterProduct === 'win32' ? module.split('\\')[0] : module.split('/')[0];
  }
  // const masterProduct =
  //  process.platform === "win32" ? module.split("\\")[0] : module.split("/")[0];

  // check to see there is a URL mapping for the product
  const productURLMap = JSON.parse(
    fs.readFileSync(`${process.cwd()}/config/productURLMap.json`),
  );
  const isEmpty = Object.keys(productURLMap).length === 0;
  let urlFragment = productURLMap[`${masterProduct}`];

  if (isEmpty || urlFragment === 'undefined') {
    urlFragment = masterProduct;
  }
  if (creds.domain != null && creds.domain !== '') {
    launchURL = `https://${creds.domain}.${urlFragment}.com/`;
  } else {
    launchURL = `https://${urlFragment}.com/`;
  }
  let insertLocation;

  switch (env) {
    case 'prod':
      break;
    default:
      insertLocation = launchURL.indexOf('.ai');
      launchURL = `${launchURL.substring(
        0,
        insertLocation,
      )}.${env}${launchURL.substring(insertLocation)}`;
  }
  return launchURL;
}
