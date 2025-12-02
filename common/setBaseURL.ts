/**
 * Sets the base url for a given environment and user.
 */
export default function setBaseURL(env: string, domain: string | null, masterProduct: string): string {
  let baseURL: string;
  switch (env) {
    case 'client':
      if (domain && domain !== '') baseURL = `https://${masterProduct}.${domain}.com/`;
      else baseURL = `https://${masterProduct}.com/`;
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
      if (domain != null && domain !== '') baseURL = `https://${domain}.${masterProduct}.com/`;
      else baseURL = `https://${masterProduct}.com/`;
  }
  return baseURL;
}
