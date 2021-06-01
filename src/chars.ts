import {
  falseWord,
  nullWord,
  trueWord,
} from "./words.js";

// All valid whitespaces
const whitespace = [" ", "\r", "\n", "\t"].map(c => c.charCodeAt(0));
export const isWhitespace = (chr: number): boolean => whitespace.includes(chr);

// String delimiters
const doubleQuote = "\"".charCodeAt(0);
const backslash = "\\".charCodeAt(0);
const escapableSymbols = ["\"", "\\", "/", "b", "f", "n", "r", "t"].map(c => c.charCodeAt(0));
const unicodeEscape = "u".charCodeAt(0);
const hexDigits = "0123456789abcdefABCDEF".split("").map(c => c.charCodeAt(0));
const CONTROL_CHAR_MAX = 31;
export const isBackslash = (chr: number): boolean => chr === backslash;
export const isDoublequote = (chr: number): boolean => chr === doubleQuote;
export const isEscapableSymbol = (chr: number): boolean => escapableSymbols.includes(chr);
export const isUnicodeEscape = (chr: number): boolean => chr === unicodeEscape;
export const isHexDigit = (chr: number): boolean => hexDigits.includes(chr);
export const isControl = (chr: number): boolean => chr <= CONTROL_CHAR_MAX;
export const isStringStart = (chr: number): boolean => chr === doubleQuote;

// Number elements
const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map(c => c.charCodeAt(0));
const minusChr = "-".charCodeAt(0);
const plusChr = "+".charCodeAt(0);
const dotChr = ".".charCodeAt(0);
const exponentChr = ["e", "E"].map(c => c.charCodeAt(0));
export const isExponent = (chr: number): boolean => exponentChr.includes(chr);
export const isPlus = (chr: number): boolean => chr === plusChr;
export const isMinus = (chr: number): boolean => chr === minusChr;
export const isZero = (chr: number): boolean => chr === digits[0];
export const isDigit = (chr: number): boolean => digits.includes(chr);
export const isDot = (chr: number): boolean => chr === dotChr;
export const isNumberStart = (chr: number): boolean => isDigit(chr) || isMinus(chr);

// Object delimiters
const brackets = "{}".split("").map(c => c.charCodeAt(0));
const commaChr = ",".charCodeAt(0);
const semicolonChr = ":".charCodeAt(0);
export const isBracketStart = (chr: number): boolean => chr === brackets[0];
export const isBracketEnd = (chr: number): boolean => chr === brackets[1];
export const isComma = (chr: number): boolean => chr === commaChr;
export const isSemicolon = (chr: number): boolean => chr === semicolonChr;
export const isObjectStart = (chr: number): boolean => chr === brackets[0];

// Array delimiters
const squareBrackets = "[]".split("").map(c => c.charCodeAt(0));
export const isSquareBracketStart = (chr: number): boolean => chr === squareBrackets[0];
export const isSquareBracketEnd = (chr: number): boolean => chr === squareBrackets[1];
export const isArrayStart = (chr: number): boolean => chr === squareBrackets[0];

// Keyword start characters
export const isTrueStart = (chr: number): boolean => chr === trueWord[0];
export const isFalseStart = (chr: number): boolean => chr === falseWord[0];
export const isNullStart = (chr: number): boolean => chr === nullWord[0];
