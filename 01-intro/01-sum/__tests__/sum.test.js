import { describe, expect, test } from "@jest/globals";
import sum from "../sum.js";

describe("intro/sum", () => {
  describe("функция sum", () => {
    test("складывает два числа", () => {
      expect(sum(1, 2)).toBe(3);
    });

    [
      ["1", []],
      ["1", "1"],
      [1, "1"],
      ["1", 1],
    ].forEach(([a, b]) => {
      test("бросает TypeError, если аргументы - не числа", () => {
        expect(() => sum(a, b)).toThrow(TypeError);
      });
    });
  });
});
