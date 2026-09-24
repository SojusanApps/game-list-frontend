import { describe, expect, it } from "vitest";

import { CARD_HEIGHT_TO_WIDTH_RATIO, computeCardRowHeight } from "@/utils/gridLayout";

describe("computeCardRowHeight", () => {
  it("returns the card height plus one gap", () => {
    // 7 columns, 24px gaps: card width = (1182 - 6 * 24) / 7 = 148.28...
    const cardWidth = (1182 - 6 * 24) / 7;
    const height = computeCardRowHeight({ gridWidth: 1182, columnCount: 7, columnGap: 24 });
    expect(height).toBeCloseTo(cardWidth * CARD_HEIGHT_TO_WIDTH_RATIO + 24);
  });

  it("keeps the row gap equal to the column gap", () => {
    const columnGap = 16;
    const gridWidth = 800;
    const columnCount = 4;
    const cardWidth = (gridWidth - (columnCount - 1) * columnGap) / columnCount;
    const cardHeight = cardWidth * CARD_HEIGHT_TO_WIDTH_RATIO;
    const rowHeight = computeCardRowHeight({ gridWidth, columnCount, columnGap });
    expect(rowHeight - cardHeight).toBeCloseTo(columnGap);
  });

  it("does not cap tall cards on few columns", () => {
    // 2 columns on a wide tablet: the card is taller than the old 450px cap.
    const height = computeCardRowHeight({ gridWidth: 700, columnCount: 2, columnGap: 24 });
    expect(height).toBeGreaterThan(450);
  });

  it.each([
    { gridWidth: 0, columnCount: 7, columnGap: 24 },
    { gridWidth: -10, columnCount: 7, columnGap: 24 },
    { gridWidth: 1000, columnCount: 0, columnGap: 24 },
    { gridWidth: 100, columnCount: 7, columnGap: 24 },
  ])("returns 0 for unusable input %o", params => {
    expect(computeCardRowHeight(params)).toBe(0);
  });
});
