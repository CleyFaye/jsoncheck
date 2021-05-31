import {
  isArrayStart,
  isBackslash,
  isBracketEnd,
  isBracketStart,
  isComma,
  isControl,
  isDigit,
  isDot,
  isDoublequote,
  isEscapableSymbol,
  isExponent,
  isFalseStart,
  isHexDigit,
  isMinus,
  isNullStart,
  isNumberStart,
  isObjectStart,
  isPlus,
  isSemicolon,
  isSquareBracketEnd,
  isSquareBracketStart,
  isStringStart,
  isTrueStart,
  isUnicodeEscape,
  isZero,
} from "./chars.js";
import {getInput, getNextChar} from "./input.js";
import {
  ParseStatus,
  ValueType,
} from "./types.js";
import {
  falseWord,
  nullWord,
  readWord,
  trueWord,
} from "./words.js";

/** Read the keyword false */
export const readFalse = (state: ParseStatus): boolean => {
  if (!state.topLevel) state.topLevel = ValueType.boolean;
  return readWord(state, falseWord);
};

/** Read the keyword true */
export const readTrue = (state: ParseStatus): boolean => {
  if (!state.topLevel) state.topLevel = ValueType.boolean;
  return readWord(state, trueWord);
};

/** Read the keyword null */
export const readNull = (state: ParseStatus): boolean => {
  if (!state.topLevel) state.topLevel = ValueType.null;
  return readWord(state, nullWord);
};

/** Read an array */
export const readArray = (state: ParseStatus): boolean => {
  if (!state.topLevel) state.topLevel = ValueType.array;
  let chr = getNextChar(state, false, false);
  if (chr === null) return true;
  if (!isSquareBracketStart(chr)) return false;
  while (state.cursor < state.input.byteLength) {
    chr = getNextChar(state, true, true);
    if (chr === null) return true;
    if (isSquareBracketEnd(chr)) break;
    // eslint-disable-next-line no-use-before-define
    if (!readValue(state)) return false;
    chr = getNextChar(state, true, true);
    if (chr === null || !isComma(chr)) break;
    // Eat the coma
    getNextChar(state, true, false);
  }
  chr = getNextChar(state, true, false);
  if (chr === null) return true;
  if (!isSquareBracketEnd(chr)) return false;
  return true;
};

/** Read a number */
// eslint-disable-next-line complexity
export const readNumber = (state: ParseStatus): boolean => {
  if (!state.topLevel) state.topLevel = ValueType.number;
  let chr = getNextChar(state, false, false);
  if (chr === null) return true;
  if (isMinus(chr)) {
    chr = getNextChar(state, false, false);
  }
  if (chr === null) return true;
  // Read integer part
  if (!isZero(chr)) {
    while (isDigit(chr)) {
      chr = getNextChar(state, false, false);
      if (chr === null) return true;
    }
  }
  // Read fractional part
  if (isDot(chr)) {
    chr = getNextChar(state, false, false);
    if (chr === null) return true;
    if (!isDigit(chr)) return false;
    while (isDigit(chr)) {
      chr = getNextChar(state, false, false);
      if (chr === null) return true;
    }
  }
  // Read exponent
  if (isExponent(chr)) {
    chr = getNextChar(state, false, false);
    if (chr === null) return true;
    if (!isDigit(chr) && !isPlus(chr) && !isMinus(chr)) return false;
    chr = getNextChar(state, false, false);
    if (chr === null) return true;
    while (isDigit(chr)) {
      chr = getNextChar(state, false, false);
      if (chr === null) return true;
    }
  }
  if (!isDigit(chr)) {
    --state.cursor;
  }
  return true;
};

/** Read a string */
const readString = (state: ParseStatus): boolean => {
  if (!state.topLevel) state.topLevel = ValueType.string;
  let chr = getNextChar(state, false, false);
  if (chr === null) return true;
  if (!isDoublequote(chr)) return false;
  while (state.cursor < state.input.byteLength) {
    chr = getNextChar(state, false, false);
    if (chr === null) return true;
    if (isControl(chr)) return false;
    if (isBackslash(chr)) {
      chr = getNextChar(state, false, false);
      if (chr === null) return true;
      if (isEscapableSymbol(chr)) continue;
      if (isUnicodeEscape(chr)) {
        const chr1 = getNextChar(state, false, false);
        const chr2 = getNextChar(state, false, false);
        const chr3 = getNextChar(state, false, false);
        const chr4 = getNextChar(state, false, false);
        for (const chrCheck of [chr1, chr2, chr3, chr4]) {
          if (chrCheck === null) return true;
          if (!isHexDigit(chr)) return false;
        }
        continue;
      }
    }
    if (isDoublequote(chr)) break;
  }
  return true;
};

/** Read a full object */
const readObject = (state: ParseStatus): boolean => {
  if (!state.topLevel) state.topLevel = ValueType.object;
  let chr = getNextChar(state, true, false);
  if (chr === null) return true;
  if (!isBracketStart(chr)) return false;
  while (state.cursor < state.input.byteLength) {
    chr = getNextChar(state, true, true);
    if (chr === null || isBracketEnd(chr)) break;
    if (!readString(state)) return false;
    chr = getNextChar(state, true, false);
    if (chr === null) return true;
    if (!isSemicolon(chr)) return false;
    // eslint-disable-next-line no-use-before-define
    if (!readValue(state)) return false;
    chr = getNextChar(state, true, true);
    if (chr === null) return true;
    if (!isComma(chr)) break;
    // Eat the comma
    getNextChar(state, true, false);
  }
  chr = getNextChar(state, true, false);
  return chr === null || isBracketEnd(chr);
};

/** Read any valid value */
const readValue = (state: ParseStatus): boolean => {
  const nextChr = getNextChar(state, true, true);
  if (nextChr === null) {
    return true;
  }
  if (isObjectStart(nextChr)) return readObject(state);
  if (isStringStart(nextChr)) return readString(state);
  if (isNumberStart(nextChr)) return readNumber(state);
  if (isArrayStart(nextChr)) return readArray(state);
  if (isTrueStart(nextChr)) return readTrue(state);
  if (isFalseStart(nextChr)) return readFalse(state);
  if (isNullStart(nextChr)) return readNull(state);
  return false;
};

/** Start reading a JSON from the beginning */
const readTopLevel = (input: Uint8Array): ValueType | null => {
  const state: ParseStatus = {
    input,
    cursor: 0,
  };
  if (!readValue(state)) {
    return null;
  }
  if (!state.topLevel) {
    return null;
  }
  return state.topLevel;
};

/** Check that the given input looks like a valid JSON input.
 *
 * @return
 * If a parsing error occurs before the end of the input, returns null.
 * Otherwise return the type of the top-level object.
 */
export const checkJSONStart = (
  input: Uint8Array | ArrayBuffer | string,
): ValueType | null => readTopLevel(getInput(input));
