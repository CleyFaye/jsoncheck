import {getNextChar} from "./input.js";
import {ParseStatus} from "./types.js";

export const trueWord = "true".split("").map(c => c.charCodeAt(0));
export const falseWord = "false".split("").map(c => c.charCodeAt(0));
export const nullWord = "null".split("").map(c => c.charCodeAt(0));

/**
 * Attempt to read a full word.
 *
 * As long as the available characters match, it returns true.
 */
export const readWord = (state: ParseStatus, word: Array<number>): boolean => {
  // eslint-disable-next-line @typescript-eslint/prefer-for-of
  for (let i = 0; i < word.length; ++i) {
    const chr = getNextChar(state, false, false);
    if (chr === null) return true;
    if (chr !== word[i]) return false;
  }
  return true;
};
