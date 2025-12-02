import fs from 'fs';

const data = JSON.parse(fs.readFileSync('playwright.conf.json'));
/**
 * Reads the playwright conf
 * @returns {browser} only browser config that must be utilized.
 */
export function getBrowserConfig() {
  return data.browser;
}

/**
 * Reads the playwright conf
 * @returns {Context}only context config that must be utilized.
 */
export function getBrowserContextConfig() {
  return data.context;
}
