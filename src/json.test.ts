/* eslint-disable mocha/no-setup-in-describe */
import {expect} from "chai";
import {getInput} from "./input.js";
import {ParseStatus, ValueType} from "./types.js";
import * as readers from "./json.js";

type ReadPredicate = (state: ParseStatus) => boolean;

/** Helper, create a dummy state and read from it */
const readPredicateProxy = (
  input: string,
  predicate: ReadPredicate,
): {
  reachedEnd: boolean;
  result: boolean;
} => {
  const inputBuff = getInput(input);
  const state: ParseStatus = {
    input: inputBuff,
    cursor: 0,
  };
  const result = predicate(state);
  return {
    reachedEnd: state.cursor === inputBuff.byteLength,
    result,
  };
};

const helperFixtures = [
  {
    label: "readFalse()",
    inputs: [
      "false",
    ],
    invalidInputs: [
      "falsi",
      "fali",
      "fai",
      "fi",
      "i",
    ],
    predicate: readers.readFalse,
  },
  {
    label: "readTrue()",
    inputs: [
      "true",
    ],
    invalidInputs: [
      "trui",
      "tri",
      "ti",
      "i",
    ],
    predicate: readers.readTrue,
  },
  {
    label: "readNull()",
    inputs: [
      "null",
    ],
    invalidInputs: [
      "nuli",
      "nui",
      "ni",
      "i",
    ],
    predicate: readers.readNull,
  },
  {
    label: "readArray()",
    inputs: [
      "[]",
      "[ ]",
      "[\n\r\t]",
      "[1,2,3]",
      "[1, 2, 3]",
      "[1,\n2\t,3 ]",
    ],
    invalidInputs: [
      "[}",
      "[x]",
      "[3,]",
    ],
    predicate: readers.readArray,
  },
  {
    label: "readNumber()",
    inputs: [
      "0",
      "1",
      "-1",
      "123",
      "123.45",
      "123e5",
      "123E5",
      "123.4e6",
    ],
    invalidInputs: [
      "+1",
      "NaN",
      "+inf",
      "-inf",
      "034",
      "e49",
      ".45",
      ".4E53",
      "04a",
    ],
    predicate: readers.readNumber,
  },
  {
    label: "readString()",
    inputs: [
      "\"\"",
      "\" \"",
      "\"test\"",
      "\"some char \\\"\\\\\\/\\b\\f\\n\\r\\t \\u00e9done",
      "\"accent \u00e9\"",
      "\"emoji 😈\"",
    ],
    invalidInputs: [
      "'not a string'",
      "\"invalid escape: \\a",
      "\"invalid utf8: \\u03ut",
    ],
    predicate: readers.readString,
  },
  {
    label: "readObject()",
    inputs: [
      "{}",
      "{ }",
      "{ \t\n\r}",
      "{\"prop1\": 3}",
      "{\"prop1\": \"somestr\"}",
      "{\"prop1\": {}}",
      "{\"prop1\": []}",
      "{\"prop1\": true, \"prop2\": false, \"prop3\": null}",
    ],
    invalidInputs: [
      "t",
      "{a}",
      "{,}",
      "{ , }",
      "{\"prop1\": 3,}",
      "{prop1: 3}",
      "{prop1: 3,}",
      "{\"prop1\": somestr}",
      "{\"prop1\": [}}",
      "{\"prop1\": true, \"prop2\": invalid, \"prop3\": null}",
    ],
    predicate: readers.readObject,
  },
  {
    label: "readValue()",
    inputs: [
      "{\"someobj\": true}",
      "\"somestring\"",
      "34",
      "[1,2,3]",
      "true",
      "false",
      "null",
    ],
    invalidInputs: [
      "+16",
      "string",
      ",test",
    ],
    predicate: readers.readValue,
  },
];

const testHelpers = () => {
  helperFixtures.forEach(fixture => {
    describe(fixture.label, () => {
      describe("Full reads", () => {
        fixture.inputs.forEach(goodInput => {
          it(JSON.stringify(goodInput), () => {
            const res = readPredicateProxy(goodInput, fixture.predicate);
            expect(res.reachedEnd).to.be.true;
            expect(res.result).to.be.true;
          });
        });
      });
      describe("Short reads", () => {
        fixture.inputs.forEach(goodInput => {
          it(JSON.stringify(goodInput), () => {
            for (let cutLen = 1; cutLen < goodInput.length; ++cutLen) {
              const tempInput = goodInput.substr(0, cutLen);
              const res = readPredicateProxy(tempInput, fixture.predicate);
              expect(res.reachedEnd).to.be.true;
              expect(res.result).to.be.true;
            }
          });
        });
      });
      describe("Invalid reads", () => {
        fixture.invalidInputs.forEach(invalidInput => {
          it(JSON.stringify(invalidInput), () => {
            expect(readPredicateProxy(invalidInput, fixture.predicate).result).to.be.false;
          });
        });
      });
    });
  });
};

const topLevelFixtures = [
  {
    type: ValueType.array,
    inputs: [
      "[1, 2, 3]",
    ],
  },
  {
    type: ValueType.boolean,
    inputs: [
      "true",
      "false",
    ],
  },
  {
    type: ValueType.null,
    inputs: [
      "null",
    ],
  },
  {
    type: ValueType.number,
    inputs: [
      "0",
      "1",
      "34",
      "34.63",
      "34.63e5",
      "-1",
      "-34",
      "-34.63",
      "-34.63e5",
      "-34.63e-5",
      "-34.63e+5",
    ],
  },
  {
    type: ValueType.object,
    inputs: [
      "{}",
      "{\"test\": 34}",
      "{\"test\": {\"prop1\": true}}",
    ],
  },
  {
    type: ValueType.string,
    inputs: [
      "\"\"",
      "\"str\"",
      "\"line1\\nline2\"",
    ],
  },
  {
    type: null,
    inputs: [
      "somestr",
      ",hello",
    ],
  },
];

const testReadTopLevel = () => {
  topLevelFixtures.forEach(fixture => {
    describe(fixture.type ?? "null", () => {
      fixture.inputs.forEach(input => {
        for (let cutLen = 1; cutLen <= input.length; ++cutLen) {
          const cutInput = input.substring(0, cutLen);
          it(cutInput, () => {
            const inputBuf = getInput(cutInput);
            expect(readers.readTopLevel(inputBuf)).to.equal(fixture.type);
          });
        }
      });
    });
  });
};

const testCheckJSONStart = () => {
  topLevelFixtures.forEach(fixture => {
    describe(fixture.type ?? "null", () => {
      fixture.inputs.forEach(input => {
        for (let cutLen = 1; cutLen <= input.length; ++cutLen) {
          const cutInput = input.substring(0, cutLen);
          describe(cutInput, () => {
            it("As string", () => {
              expect(readers.checkJSONStart(cutInput)).to.equal(fixture.type);
            });
            it("As ArrayBuffer", () => {
              const buf8 = new TextEncoder().encode(cutInput);
              const ab = buf8.buffer.slice(buf8.byteOffset, buf8.byteOffset + buf8.byteLength);
              expect(readers.checkJSONStart(ab)).to.equal(fixture.type);
            });
            it("As Uint8Array", () => {
              const buf8 = new TextEncoder().encode(cutInput);
              expect(readers.checkJSONStart(buf8)).to.equal(fixture.type);
            });
          });
        }
      });
    });
  });
};

describe("/json", () => {
  describe("Read helpers", testHelpers);
  describe("readTopLevel()", testReadTopLevel);
  describe("checkJSONStart()", testCheckJSONStart);
});
