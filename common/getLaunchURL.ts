import * as fs from 'fs';

export default function setLaunchURL(env: string, customer: string): string {
  let launchURL: string;
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

export function setLaunchURLold(env: string, module: string, creds: any): string {
  let launchURL = '';
  let masterProduct = '';
  if (module === '') {
    masterProduct = 'trackmyshuttle';
  } else if (module) {
    masterProduct = (process.platform === 'win32' ? module.split('\\')[0] : module.split('/')[0]) || '';
  
  }

  const productURLMap = JSON.parse(fs.readFileSync(`${process.cwd()}/config/productURLMap.json`, 'utf8')) as any;
  const isEmpty = Object.keys(productURLMap).length === 0;
  let urlFragment = productURLMap?.[masterProduct];
  if (isEmpty || urlFragment === 'undefined') urlFragment = masterProduct;
  if (creds.domain != null && creds.domain !== '') launchURL = `https://${creds.domain}.${urlFragment}.com/`;
  else launchURL = `https://${urlFragment}.com/`;

  switch (env) {
    case 'prod':
      break;
    default:
      const insertLocation = launchURL.indexOf('.ai');
      launchURL = `${launchURL.substring(0, insertLocation)}.${env}${launchURL.substring(insertLocation)}`;
  }
  return launchURL;
}
