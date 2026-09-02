import { describe, expect, it } from "vitest";

import { playtimeHoursToMinutes, playtimeMinutesToHours } from "@/utils/playtimeUtils";

describe("playtimeHoursToMinutes", () => {
  it("converts hours to whole minutes", () => {
    expect(playtimeHoursToMinutes(2)).toBe(120);
    expect(playtimeHoursToMinutes(112.8)).toBe(6768);
  });

  it("rounds to the nearest minute", () => {
    expect(playtimeHoursToMinutes(1.234)).toBe(74);
  });

  it("returns null for nullish or NaN input", () => {
    expect(playtimeHoursToMinutes(null)).toBeNull();
    expect(playtimeHoursToMinutes(Number.NaN)).toBeNull();
  });

  it("keeps zero as zero", () => {
    expect(playtimeHoursToMinutes(0)).toBe(0);
  });
});

describe("playtimeMinutesToHours", () => {
  it("converts minutes to hours rounded to one decimal", () => {
    expect(playtimeMinutesToHours(120)).toBe(2);
    expect(playtimeMinutesToHours(6768)).toBe(112.8);
    expect(playtimeMinutesToHours(100)).toBe(1.7);
  });

  it("returns null for nullish or NaN input", () => {
    expect(playtimeMinutesToHours(null)).toBeNull();
    expect(playtimeMinutesToHours(Number.NaN)).toBeNull();
  });

  it("keeps zero as zero", () => {
    expect(playtimeMinutesToHours(0)).toBe(0);
  });
});
