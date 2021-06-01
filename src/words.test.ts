import {expect} from "chai";
import {getInput} from "./input.js";
import {ParseStatus} from "./types.js";
import {
  trueWord,
  falseWord,
  nullWord,
  readWord,
} from "./words.js";

const wordChrToStr = (wordChr: Array<number>) => wordChr.map(c => String.fromCharCode(c)).join("");

const testConsts = () => {
  const fixtures = [
    {
      input: trueWord,
      expected: "true",
    },
    {
      input: falseWord,
      expected: "false",
    },
    {
      input: nullWord,
      expected: "null",
    },
  ];
  fixtures.forEach(fixture => {
    it(fixture.expected, () => {
      const merged = wordChrToStr(fixture.input);
      expect(merged).to.equal(fixture.expected);
    });
  });
};

/** Helper; create a dummy state and read from it */
const readWordProxy = (
  input: string,
  word: Array<number>,
): boolean => {
  const state: ParseStatus = {
    input: getInput(input),
    cursor: 3,
  };
  return readWord(state, word);
};

const wordsFixtures = [
  {
    word: trueWord,
    goodInputs: ["abctruedef"],
    badInputs: [
      "abctrusdef",
      "abctrsdef",
      "abctsdef",
      "abcodsef",
    ],
    shortInputs: [
      "abctrue",
      "abctru",
      "abctr",
      "abct",
    ],
  },
  {
    word: falseWord,
    goodInputs: ["abcfalsedef"],
    badInputs: [
      "abcfalsdef",
      "abcfaldef",
      "abcfatsdef",
      "abcfodsef",
      "abcolsf",
    ],
    shortInputs: [
      "abcfalse",
      "abcfals",
      "abcfal",
      "abcfa",
      "abcf",
    ],
  },
  {
    word: nullWord,
    goodInputs: ["abcnulldef"],
    badInputs: [
      "abcnulsdef",
      "abcnusdef",
      "abcnsdef",
      "abcodsef",
    ],
    shortInputs: [
      "abcnull",
      "abcnul",
      "abcnu",
      "abcn",
    ],
  },
];

const testReadWord = () => {
  wordsFixtures.forEach(fixture => {
    const merged = wordChrToStr(fixture.word);
    describe(`Word: ${merged}`, () => {
      it(`${merged}: good inputs`, () => {
        for (const input of fixture.goodInputs) {
          expect(readWordProxy(input, fixture.word)).to.be.true;
        }
      });
    });
  });
};

describe("/words", () => {
  describe("Consts", testConsts);
  describe("readWord()", testReadWord);
});
