/* eslint-disable require-jsdoc */
/**
 * picks a random item from the array provided
 * @param {*} array of items
 * @returns {*} returns a random item from the array provided
 */
export function randomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * @param {number} length of the string
 * @returns {string} of fixed length
 */
export function getRandomString(length) {
  let result = '';
  const characters =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}
/**
 * @param {number} length of the string
 * @returns {string} of fixed length
 */
export function getRandomCapitalString(length) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * @param {number} length of the string
 * @returns {string} of fixed length
 */
export function getRandomLowerCaseString(length) {
  let result = '';
  const characters = 'abcdefghijklmnopqrstuvwxyz';
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

/**
 * @param {string} option is a dropdown option that needs to be selected.
 * @returns {string} XPATh of the dropdown option.
 */
export function getDropdownOption(option) {
  return `//div[contains(text(),'${option}')]`;
}

/**
 * @param {string} option is a tag option that needs to be selected/written.
 * @returns {string} XPATh of the tag option.
 */
export function getSpanOption(option) {
  return `//span[contains(text(),'${option}')]/button`;
}

export function waitForElementVisible(page, selector) {
  return page.waitForSelector(selector, { state: 'visible' });
}
