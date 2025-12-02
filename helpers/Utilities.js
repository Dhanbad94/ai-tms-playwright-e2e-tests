/**
 * make first letter of text capital
 * @param {String} text to convert
 * @returns {String} updated string
 */
export function make_first_letter_capital(text) {
  return text[0].toUpperCase() + text.slice(1);
}

/**
 * removes special characters
 * @param {String} text required
 * @returns {String} string without special characters
 */
export function remove_special_chars(text) {
  return text.replace(/[^0-9 ]/g, '');
}

/**
 * removes special characters
 * @param {String} text required
 * @returns {String} string without special characters
 */
export function remove_percentage_fromText(text) {
  return text.replace(/%/g, '');
}
