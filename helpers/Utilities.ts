/**
 * make first letter of text capital
 * @param text to convert
 * @returns updated string
 */
export function make_first_letter_capital(text: string): string {
  return text[0].toUpperCase() + text.slice(1);
}

/**
 * removes special characters
 * @param text required
 * @returns string without special characters
 */
export function remove_special_chars(text: string): string {
  return text.replace(/[^0-9 ]/g, '');
}

/**
 * removes percentage characters
 * @param text required
 * @returns string without percentage sign
 */
export function remove_percentage_fromText(text: string): string {
  return text.replace(/%/g, '');
}

export default {
  make_first_letter_capital,
  remove_special_chars,
  remove_percentage_fromText,
};
