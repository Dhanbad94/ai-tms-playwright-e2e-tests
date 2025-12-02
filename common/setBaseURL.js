/**
 *  Sets the base url for a given environment and user. updateBaseURL will add the product to this url
 * @param {string} env name of the environment to run the tests on.
 * @param {string} domain name to run the tests on.
 * @param {string} masterProduct name of the product for which the test will run.
 * @returns {string} baseURL.
 */
export default function setBaseURL(env, domain, masterProduct) {
  let baseURL;
  switch (env) {
    case 'client':
      if (domain !== '') {
        baseURL = `https://${masterProduct}.${domain}.com/`;
      } else {
        baseURL = `https://${masterProduct}.com/`;
      }
      break;
    case 'staging':
      baseURL = 'https://staging.trackmyshuttle.com/';
      break;
    case 'preproduction':
      baseURL = 'https://preproduction.trackmyshuttle.com/';
      break;
    case 'prod':
      baseURL = 'https://trackmyshuttle.com/';
      break;
    default:
      if (domain != null && domain !== '') {
        baseURL = `https://${domain}.${masterProduct}.com/`;
      } else {
        baseURL = `https://${masterProduct}.com/`;
      }
  }
  return baseURL;
}
