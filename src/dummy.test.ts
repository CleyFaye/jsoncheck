import {expect} from "chai";

describe("Test framework", () => {
  it("Test can run", () => {});
  it("Test env", () => {
    // eslint-disable-next-line no-process-env
    expect(process.env.NODE_ENV).to.equal("test");
  });
});
