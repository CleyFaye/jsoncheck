import {isWhitespace} from "./chars.js";
import {ParseStatus} from "./types.js";

/** Convert all input type to Uint8Array */
export const getInput = (
  input: Uint8Array | ArrayBuffer | string,
): Uint8Array => {
  if (input instanceof Uint8Array) {
    return input;
  }
  if (input instanceof ArrayBuffer) {
    return new Uint8Array(input);
  }
  return new TextEncoder().encode(input);
};

/**
 * Return the next char
 *
 * If the end of buffer is reached, return null.
 */
export const getNextChar = (
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
};
