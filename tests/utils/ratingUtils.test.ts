import { describe, expect, it } from "vitest";

import { hasScore } from "@/utils/ratingUtils";

describe("hasScore", () => {
  it("is false for a missing score", () => {
    expect(hasScore(null)).toBe(false);
    // oxlint-disable-next-line unicorn/no-useless-undefined -- the API type allows `undefined`, so cover it.
    expect(hasScore(undefined)).toBe(false);
  });

  it("is false for an average score of 0 (nobody has scored the game yet)", () => {
    expect(hasScore(0)).toBe(false);
  });

  it("is true for any positive score", () => {
    expect(hasScore(1)).toBe(true);
    expect(hasScore(7.5)).toBe(true);
    expect(hasScore(10)).toBe(true);
  });
});
