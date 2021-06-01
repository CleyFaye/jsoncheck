/* eslint-disable mocha/no-setup-in-describe */
import * as chars from "./chars.js";
import {expect} from "chai";

const charsFixtures = [
  {
    label: "isBackslash()",
    validChars: ["\\"],
    predicate: chars.isBackslash,
  },
  {
    label: "isDoublequote()",
    validChars: ["\""],
    predicate: chars.isDoublequote,
  },
  {
    label: "isEscapableSymbol()",
    validChars: ["\"", "\\", "/", "b", "f", "n", "r", "t"],
    predicate: chars.isEscapableSymbol,
  },
  {
    label: "isUnicodeEscape()",
    validChars: ["u"],
    predicate: chars.isUnicodeEscape,
  },
  {
    label: "isHexDigit()",
    validChars: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "a", "b", "c", "d", "e", "f", "A", "B", "C", "D", "E", "F"],
    predicate: chars.isHexDigit,
  },
  {
    label: "isControl()",
    validChars: [
      "\x00",
      "\x01",
      "\x02",
      "\x03",
      "\x04",
      "\x05",
      "\x06",
      "\x07",
      "\x08",
      "\x09",
      "\x0a",
      "\x0b",
      "\x0c",
      "\x0d",
      "\x0e",
      "\x0f",
      "\x10",
      "\x11",
      "\x12",
      "\x13",
      "\x14",
      "\x15",
      "\x16",
      "\x17",
      "\x18",
      "\x19",
      "\x1a",
      "\x1b",
      "\x1c",
      "\x1d",
      "\x1e",
      "\x1f",
    ],
    predicate: chars.isControl,
  },
  {
    label: "isStringStart()",
    validChars: ["\""],
    predicate: chars.isStringStart,
  },
  {
    label: "isExponent()",
    validChars: ["e", "E"],
    predicate: chars.isExponent,
  },
  {
    label: "isPlus()",
    validChars: ["+"],
    predicate: chars.isPlus,
  },
  {
    label: "isMinus()",
    validChars: ["-"],
    predicate: chars.isMinus,
  },
  {
    label: "isZero()",
    validChars: ["0"],
    predicate: chars.isZero,
  },
  {
    label: "isDigit()",
    validChars: ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    predicate: chars.isDigit,
  },
  {
    label: "isDot()",
    validChars: ["."],
    predicate: chars.isDot,
  },
  {
    label: "isNumberStart()",
    validChars: ["-", "0", "1", "2", "3", "4", "5", "6", "7", "8", "9"],
    predicate: chars.isNumberStart,
  },
  {
    label: "isBracketStart()",
    validChars: ["{"],
    predicate: chars.isBracketStart,
  },
  {
    label: "isBracketEnd()",
    validChars: ["}"],
    predicate: chars.isBracketEnd,
  },
  {
    label: "isComma()",
    validChars: [","],
    predicate: chars.isComma,
  },
  {
    label: "isSemicolon()",
    validChars: [":"],
    predicate: chars.isSemicolon,
  },
  {
    label: "isObjectStart()",
    validChars: ["{"],
    predicate: chars.isObjectStart,
  },
  {
    label: "isSquareBracketStart()",
    validChars: ["["],
    predicate: chars.isSquareBracketStart,
  },
  {
    label: "isSquareBracketEnd()",
    validChars: ["]"],
    predicate: chars.isSquareBracketEnd,
  },
  {
    label: "isArrayStart()",
    validChars: ["["],
    predicate: chars.isArrayStart,
  },
  {
    label: "isTrueStart()",
    validChars: ["t"],
    predicate: chars.isTrueStart,
  },
  {
    label: "isFalseStart()",
    validChars: ["f"],
    predicate: chars.isFalseStart,
  },
  {
    label: "isNullStart()",
    validChars: ["n"],
    predicate: chars.isNullStart,
  },
];

describe("/chars", () => {
  charsFixtures.forEach(fixture => {
    it(fixture.label, () => {
      const validChars = fixture.validChars.map(c => c.charCodeAt(0));
      // eslint-disable-next-line @typescript-eslint/no-magic-numbers
      for (let chr = 0; chr < 256; ++chr) {
        const res = fixture.predicate(chr);
        expect(res).to.equal(validChars.includes(chr));
      }
    });
  });
});
