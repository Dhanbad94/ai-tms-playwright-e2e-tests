import setBaseURL from './setBaseURL';

/**
 * Add product and fragment to baseURL and returns launchURL
 */
export default function updateBaseURL(env: string, module: string, creds: any): string {
  let launchURL: string;
  let masterProduct = process.platform === 'win32' ? module.split('\\')[0] : module.split('/')[0];

  if (masterProduct === 'zebrafish') masterProduct = 'trackmyshuttle';
  if (masterProduct === 'edf') masterProduct = 'edf-nm';

  const baseURL = setBaseURL(env, creds?.domain ?? '', masterProduct ?? '');
  let insertLocation: number;
  switch (env) {
    case 'client':
      insertLocation = baseURL.indexOf('.com');
      launchURL = `${baseURL.substring(0, insertLocation)}.${env}${baseURL.substring(insertLocation)}`;
      break;
    case 'staging':
    case 'preproduction':
    case 'prod':
      launchURL = baseURL;
      break;
    case 'dev':
      insertLocation = baseURL.indexOf('.com');
      launchURL = `${baseURL.substring(0, insertLocation)}.${env}${baseURL.substring(insertLocation)}`;
      break;
    default:
      insertLocation = baseURL.indexOf('.');
      launchURL = `${baseURL.substring(0, insertLocation)}.${env}${baseURL.substring(insertLocation)}`;
  }
  return launchURL;
}
