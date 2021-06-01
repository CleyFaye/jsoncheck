/* eslint-disable @typescript-eslint/no-magic-numbers */
import {
  getInput,
  getNextChar,
} from "./input.js";
import {expect} from "chai";
import {ParseStatus} from "./types.js";

const testGetInput = () => {
  it("Input Uint8Array", () => {
    const input = new Uint8Array([1, 2, 3, 4, 5]);
    const output = getInput(input);
    expect(output).to.be.instanceOf(Uint8Array).to.deep.equal(
      new Uint8Array([1, 2, 3, 4, 5]),
    );
  });
  it("Input ArrayBuffer", () => {
    const input = new ArrayBuffer(5);
    const view = new Uint8Array(input);
    view.set([1, 2, 3, 4, 5]);
    const output = getInput(input);
    expect(output).to.be.instanceOf(Uint8Array).to.deep.equal(
      new Uint8Array([1, 2, 3, 4, 5]),
    );
  });
  it("Input string", () => {
    const input = "test with © chr";
    const output = getInput(input);
    expect(output).to.be.instanceOf(Uint8Array).to.deep.equal(
      new Uint8Array([
        116,
        101,
        115,
        116,
        32,
        119,
        105,
        116,
        104,
        32,
        194,
        169,
        32,
        99,
        104,
        114,
      ]),
    );
  });
};

const readFixtures = [
  // no space in input, from start
  {
    input: "abcde",
    start: 0,
    expectChr: "a",
    expectPosition: 1,
    skipSpace: false,
    peekOnly: false,
  },
  {
    input: "abcde",
    start: 0,
    expectChr: "a",
    expectPosition: 1,
    skipSpace: true,
    peekOnly: false,
  },
  {
    input: "abcde",
    start: 0,
    expectChr: "a",
    expectPosition: 0,
    skipSpace: false,
    peekOnly: true,
  },
  {
    input: "abcde",
    start: 0,
    expectChr: "a",
    expectPosition: 0,
    skipSpace: true,
    peekOnly: true,
  },
  // space in input, from start
  {
    input: " \t\n\rabcde",
    start: 0,
    expectChr: " ",
    expectPosition: 1,
    skipSpace: false,
    peekOnly: false,
  },
  {
    input: "\t \n\rabcde",
    start: 0,
    expectChr: "a",
    expectPosition: 5,
    skipSpace: true,
    peekOnly: false,
  },
  {
    input: "\t \n\rabcde",
    start: 0,
    expectChr: "\t",
    expectPosition: 0,
    skipSpace: false,
    peekOnly: true,
  },
  {
    input: "\t \n\rabcde",
    start: 0,
    expectChr: "a",
    expectPosition: 4,
    skipSpace: true,
    peekOnly: true,
  },
  // no space in input, from middle
  {
    input: "abcde",
    start: 3,
    expectChr: "d",
    expectPosition: 4,
    skipSpace: false,
    peekOnly: false,
  },
  {
    input: "abcde",
    start: 3,
    expectChr: "d",
    expectPosition: 4,
    skipSpace: true,
    peekOnly: false,
  },
  {
    input: "abcde",
    start: 3,
    expectChr: "d",
    expectPosition: 3,
    skipSpace: false,
    peekOnly: true,
  },
  {
    input: "abcde",
    start: 3,
    expectChr: "d",
    expectPosition: 3,
    skipSpace: true,
    peekOnly: true,
  },
  // space in input, from middle
  {
    input: "abc \t\n\rde",
    start: 3,
    expectChr: " ",
    expectPosition: 4,
    skipSpace: false,
    peekOnly: false,
  },
  {
    input: "abc\t\n\r de",
    start: 3,
    expectChr: "d",
    expectPosition: 8,
    skipSpace: true,
    peekOnly: false,
  },
  {
    input: "abc\n\r \tde",
    start: 3,
    expectChr: "\n",
    expectPosition: 3,
    skipSpace: false,
    peekOnly: true,
  },
  {
    input: "abc\r \t\nde",
    start: 3,
    expectChr: "d",
    expectPosition: 7,
    skipSpace: true,
    peekOnly: true,
  },
  // reaching end
  {
    input: "abcde",
    start: 5,
    expectChr: null,
    expectPosition: 5,
    skipSpace: false,
    peekOnly: false,
  },
  {
    input: "abcde",
    start: 5,
    expectChr: null,
    expectPosition: 5,
    skipSpace: true,
    peekOnly: false,
  },
  {
    input: "abcde",
    start: 5,
    expectChr: null,
    expectPosition: 5,
    skipSpace: false,
    peekOnly: true,
  },
  {
    input: "abcde",
    start: 5,
    expectChr: null,
    expectPosition: 5,
    skipSpace: true,
    peekOnly: true,
  },
  {
    input: "abcde \t\r\n",
    start: 5,
    expectChr: " ",
    expectPosition: 6,
    skipSpace: false,
    peekOnly: false,
  },
  {
    input: "abcde\t\r\n ",
    start: 5,
    expectChr: null,
    expectPosition: 9,
    skipSpace: true,
    peekOnly: false,
  },
  {
    input: "abcde\r\n \t",
    start: 5,
    expectChr: "\r",
    expectPosition: 5,
    skipSpace: false,
    peekOnly: true,
  },
  {
    input: "abcde\n \t\r",
    start: 5,
    expectChr: null,
    expectPosition: 9,
    skipSpace: true,
    peekOnly: true,
  },
];

const testGetNextChar = () => {
  readFixtures.forEach(fixture => {
    // eslint-disable-next-line max-len
    const name = `${JSON.stringify(fixture.input)} (offset:${fixture.start}${fixture.skipSpace ? ",skipSpace" : ""}${fixture.peekOnly ? ",peekOnly" : ""})`;
    it(name, () => {
      const state: ParseStatus = {
        cursor: fixture.start,
        input: getInput(fixture.input),
      };
      const result = getNextChar(state, fixture.skipSpace, fixture.peekOnly);
      const expected = fixture.expectChr === null
        ? null
        : fixture.expectChr.charCodeAt(0);
      expect(result).to.equal(expected);
      expect(state.cursor).to.equal(fixture.expectPosition);
    });
  });
};

describe("/input", () => {
  describe("getInput()", testGetInput);
  describe("getNextChar()", testGetNextChar);
});
