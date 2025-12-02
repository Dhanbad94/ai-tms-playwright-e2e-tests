import * as fs from 'fs';

const data = JSON.parse(fs.readFileSync('playwright.conf.json', 'utf8')) as any;

/**
 * Reads the playwright conf
 * @returns {any} only browser config that must be utilized.
 */
export function getBrowserConfig(): any {
  return data.browser;
}

/**
 * Reads the playwright conf
 * @returns {any} only context config that must be utilized.
 */
export function getBrowserContextConfig(): any {
  return data.context;
}

export default {
  getBrowserConfig,
  getBrowserContextConfig,
};
