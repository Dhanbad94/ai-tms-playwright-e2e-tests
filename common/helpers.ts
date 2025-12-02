/* eslint-disable require-jsdoc */
/**
 * picks a random item from the array provided
 * @param {*} array of items
 * @returns {*} returns a random item from the array provided
 */
export function randomItem<T>(array: T[]): T | undefined {
  if (!array || array.length === 0) return undefined;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * @param {number} length of the string
 * @returns {string} of fixed length
 */
export function getRandomString(length: number): string {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

export function getRandomCapitalString(length: number) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function getRandomLowerCaseString(length: number) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

export function getDropdownOption(option: string): string {
  return `//div[contains(text(),'${option}')]`;
}

export function getSpanOption(option: string): string {
  return `//span[contains(text(),'${option}')]/button`;
}

export function waitForElementVisible(page: any, selector: string) {
  return page.waitForSelector(selector, { state: 'visible' });
}

export default {
  randomItem,
  getRandomString,
  getRandomCapitalString,
  getRandomLowerCaseString,
  getDropdownOption,
  getSpanOption,
  waitForElementVisible,
};
