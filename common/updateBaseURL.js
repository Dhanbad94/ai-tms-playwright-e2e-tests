import setBaseURL from './setBaseURL';
/**
 * Add product and fragment to baseURL and returns launchURL
 *  @function updateBaseURL
 * @param {string} env - current environment under test
 * @param {string} module - current test suite path
 * @param {string} creds - current credentials from login.json
 * @returns {string} launchURL
 */
export default function updateBaseURL(env, module, creds) {
  let launchURL;
  // extract masterProduct from module
  let masterProduct =
    process.platform === 'win32' ? module.split('\\')[0] : module.split('/')[0];

  if (masterProduct === 'zebrafish') {
    masterProduct = 'trackmyshuttle';
  }
  if (masterProduct === 'edf') {
    masterProduct = 'edf-nm';
  }
  const baseURL = setBaseURL(env, creds.domain, masterProduct);
  // based on env, add product to the correct location
  let insertLocation;
  switch (env) {
    case 'client':
      insertLocation = baseURL.indexOf('.com');
      launchURL = `${baseURL.substring(
        0,
        insertLocation,
      )}.${env}${baseURL.substring(insertLocation)}`;
      break;
    case 'staging':
      launchURL = baseURL;
      break;
    case 'preproduction':
      launchURL = baseURL;
      break;
    case 'prod':
      launchURL = baseURL;
      break;
    case 'dev':
      if (creds.domain !== '') {
        insertLocation = baseURL.indexOf('.com');
        launchURL = `${baseURL.substring(
          0,
          insertLocation,
        )}.${env}${baseURL.substring(insertLocation)}`;
      } else {
        insertLocation = baseURL.indexOf('.com');
        launchURL = `${baseURL.substring(
          0,
          insertLocation,
        )}.${env}${baseURL.substring(insertLocation)}`;
      }
      break;
    default:
      insertLocation = baseURL.indexOf('.');
      launchURL = `${baseURL.substring(
        0,
        insertLocation,
      )}.${env}${baseURL.substring(insertLocation)}`;
  }
  return launchURL;
}
