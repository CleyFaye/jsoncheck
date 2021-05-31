export enum ValueType {
  object = "object",
  string = "string",
  number = "number",
  Array = "Array",
  boolean = "boolean",
  null = "null",
};

interface ParseStatus {
  input: Uint8Array;
  cursor: number;
  topLevel?: ValueType;
}

const whitespace = [" ", "\r", "\n", "\t"].map(c => c.charCodeAt(0));
const doubleQuote = "\"".charCodeAt(0);
const digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"].map(c => c.charCodeAt(0));
const numberStart = ["-".charCodeAt(0), ...digits];
const plusChr = "+".charCodeAt(0);
const brackets = "{}".split("").map(c => c.charCodeAt(0));
const squareBrackets = "[]".split("").map(c => c.charCodeAt(0));
const trueChr = "true".split("").map(c => c.charCodeAt(0));
const falseChr = "false".split("").map(c => c.charCodeAt(0));
const nullChr = "null".split("").map(c => c.charCodeAt(0));
const commaChr = ",".charCodeAt(0);
const semicolonChr = ":".charCodeAt(0);
const backslash = "\\".charCodeAt(0);
const dotChr = ".".charCodeAt(0);
const exponentChr = ["e", "E"].map(c => c.charCodeAt(0));
const escapableSymbols = ["\"", "\\", "/", "b", "f", "n", "r", "t"].map(c => c.charCodeAt(0));
const unicodeEscape = "u".charCodeAt(0);
const hexDigits = "0123456789abcdefABCDEF".split("").map(c => c.charCodeAt(0));

/** Convert all input type to Uint8Array */
const getInput = (
  input: Uint8Array | ArrayBuffer | string,
): Uint8Array => {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }
  return new TextEncoder().encode(input);
}

const isWhitespace = (chr: number): boolean => whitespace.includes(chr);
const isStringStart = (chr: number): boolean => chr === doubleQuote;
const isNumberStart = (chr: number): boolean => numberStart.includes(chr);
const isObjectStart = (chr: number): boolean => chr === brackets[0];
const isObjectEnd = (chr: number): boolean => chr === brackets[1];
const isArrayStart = (chr: number): boolean => chr === squareBrackets[0];
const isTrueStart = (chr: number): boolean => chr === trueChr[0];
const isFalseStart = (chr: number): boolean => chr === falseChr[0];
const isNullStart = (chr: number): boolean => chr === nullChr[0];
const isComma = (chr: number): boolean => chr === commaChr;
const isSemicolon = (chr: number): boolean => chr === semicolonChr;
const isExponent = (chr: number): boolean => exponentChr.includes(chr);

/** Return the next char */
const getNextChar = (
  state: ParseStatus,
  skipWhitespace: boolean,
  peekOnly: boolean,
): number | null => {
  while (state.cursor < state.input.byteLength) {
    const chr = state.input[state.cursor];
    ++state.cursor;
    if (isWhitespace(chr) && skipWhitespace) continue;
    if (peekOnly) {
      --state.cursor;
    }
    return chr;
  }
  return null;
}

const readWord = (state: ParseStatus, word: Array<number>): boolean => {
  for (let i = 0; i < word.length; ++i) {
    const chr = getNextChar(state, false, false);
    if (chr === null) return true;
    if (chr !== word[i]) return false;
  }
  return true;
}

const readFalse = (state: ParseStatus): boolean => readWord(state, falseChr);
const readTrue = (state: ParseStatus): boolean => readWord(state, trueChr);
const readNull = (state: ParseStatus): boolean => readWord(state, nullChr);

const readArray = (state: ParseStatus): boolean => {
  let chr = getNextChar(state, false, false);
  if (chr === null) return true;
  if (chr !== squareBrackets[0]) return false;
  while (true) {
    chr = getNextChar(state, true, true);
    if (chr === null) return true;
    if (chr === squareBrackets[1]) break;
    if (!readValue(state)) return false;
    chr = getNextChar(state, true, true);
    if (chr !== commaChr) break;
    // Eat the coma
    getNextChar(state, true, false);
  }
  chr = getNextChar(state, true, false);
  if (chr === null) return true;
  if (chr !== squareBrackets[1]) return false;
  return true;
};

const readNumber = (state: ParseStatus): boolean => {
  let chr = getNextChar(state, false, false);
  if (chr === numberStart[0]) {
    chr = getNextChar(state, false, false);
  }
  if (chr === null) return true;
  // Read integer part
  if (chr !== digits[0]) {
    while (digits.includes(chr)) {
      chr = getNextChar(state, false, false);
      if (chr === null) return true;
    }
  }
  // Read fractional part
  if (chr === dotChr) {
    chr = getNextChar(state, false, false);
    if (chr === null) return true;
    if (!digits.includes(chr)) return false;
    while (digits.includes(chr)) {
      chr = getNextChar(state, false, false);
      if (chr === null) return true;
    }
  }
  // Read exponent
  if (isExponent(chr)) {
    chr = getNextChar(state, false, false);
    if (chr === null) return true;
    if (!(numberStart.includes(chr) || chr === plusChr)) return false;
    chr = getNextChar(state, false, false);
    if (chr === null) return true;
    while (digits.includes(chr)) {
      chr = getNextChar(state, false, false);
      if (chr === null) return true;
    }
  }
  if (!digits.includes(chr)) {
    --state.cursor;
  }
  return true;
}

const readString = (state: ParseStatus): boolean => {
  let chr = getNextChar(state, false, false);
  if (chr === null) return true;
  if (chr !== doubleQuote) return false;
  while (true) {
    chr = getNextChar(state, false, false);
    if (chr === null) return true;
    if (chr < 32) return false;
    if (chr === backslash) {
      chr = getNextChar(state, false, false);
      if (chr === null) return true;
      if (escapableSymbols.includes(chr)) continue;
      if (chr === unicodeEscape) {
        const chr1 = getNextChar(state, false, false);
        const chr2 = getNextChar(state, false, false);
        const chr3 = getNextChar(state, false, false);
        const chr4 = getNextChar(state, false, false);
        for (const chrCheck of [chr1, chr2, chr3, chr4]) {
          if (chrCheck === null) return true;
          if (!hexDigits.includes(chrCheck)) return false;
        }
        continue;
      }
    }
    if (chr === doubleQuote) return true;
  }
}

const readObject = (state: ParseStatus): boolean => {
  let chr = getNextChar(state, true, false);
  if (chr === null) return true;
  if (chr !== brackets[0]) return false;
  while (true) {
    chr = getNextChar(state, true, true);
    if (chr === brackets[1] || chr === null) break;
    if (!readString(state)) return false;
    chr = getNextChar(state, true, false);
    if (chr === null) return true;
    if (chr !== semicolonChr) return false;
    if (!readValue(state)) return false;
    chr = getNextChar(state, true, true);
    if (chr === null) return true;
    if (chr !== commaChr) return false;
    // Eat the comma
    getNextChar(state, true, false);
  }
  chr = getNextChar(state, true, false);
  return chr === null || chr === brackets[1];
};

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
}

const readTopLevel = (input: Uint8Array): ValueType | null => {
  const state: ParseStatus = {
    input,
    cursor: 0,
  };
  if (
    !readValue(state)) {
    return null;
  }
  if (!state.topLevel) {
    return null;
  }
  return state.topLevel;
}

/** Check that the given input looks like a valid JSON input */
export const checkJSONStart = (
  input: Uint8Array | ArrayBuffer | string,
): ValueType | null => {
  return readTopLevel(getInput(input));
};
