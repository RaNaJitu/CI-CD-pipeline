const { add } = require("./calculator");

describe("calculator", () => {
  describe("add", () => {
    test("adds two positive numbers", () => {
      expect(add(2, 3)).toBe(5);
    });

    test("adds negative numbers", () => {
      expect(add(-2, -3)).toBe(-5);
    });

    test("adds a positive and a negative number", () => {
      expect(add(10, -4)).toBe(6);
    });

    test("adds zeros", () => {
      expect(add(0, 0)).toBe(0);
    });

    test("adds decimal numbers", () => {
      expect(add(1.5, 2.5)).toBe(4);
    });

    test("coerces numeric strings", () => {
      expect(add("7", "3")).toBe(10);
    });
  });

  // Later: subtract, multiply, divide tests go here
});
