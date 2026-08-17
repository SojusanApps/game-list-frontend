import { describe, expect, it } from "vitest";

import type { RankedItem } from "@/features/ranking/types";
import { sortByRating, getConfidenceLevel, getSuggestedMinimumDuels } from "@/features/ranking/utils/rankingSort";

function makeItem(overrides: Partial<RankedItem> & { itemId: number }): RankedItem {
  return {
    gameId: overrides.itemId,
    title: `Game ${overrides.itemId}`,
    rating: 1000,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
    ...overrides,
  };
}

describe("rankingSort", () => {
  describe("sortByRating", () => {
    it("sorts by rating descending", () => {
      const items = [
        makeItem({ itemId: 1, rating: 900 }),
        makeItem({ itemId: 2, rating: 1100 }),
        makeItem({ itemId: 3, rating: 1000 }),
      ];
      const sorted = sortByRating(items);
      expect(sorted.map(i => i.itemId)).toEqual([2, 3, 1]);
    });

    it("breaks ties by wins", () => {
      const items = [makeItem({ itemId: 1, rating: 1000, wins: 3 }), makeItem({ itemId: 2, rating: 1000, wins: 5 })];
      const sorted = sortByRating(items);
      expect(sorted[0].itemId).toBe(2);
    });

    it("breaks further ties by fewer losses", () => {
      const items = [
        makeItem({ itemId: 1, rating: 1000, wins: 5, losses: 3 }),
        makeItem({ itemId: 2, rating: 1000, wins: 5, losses: 1 }),
      ];
      const sorted = sortByRating(items);
      expect(sorted[0].itemId).toBe(2);
    });

    it("does not mutate the original array", () => {
      const items = [makeItem({ itemId: 1, rating: 900 }), makeItem({ itemId: 2, rating: 1100 })];
      sortByRating(items);
      expect(items[0].itemId).toBe(1);
    });
  });

  describe("getConfidenceLevel", () => {
    it("returns 'low' when few matches played", () => {
      const item = makeItem({ itemId: 1, matchesPlayed: 0 });
      expect(getConfidenceLevel(item, 16)).toBe("low"); // log2(16) = 4
    });

    it("returns 'medium' for moderate matches", () => {
      const item = makeItem({ itemId: 1, matchesPlayed: 5 });
      expect(getConfidenceLevel(item, 16)).toBe("medium"); // 4 <= 5 < 8
    });

    it("returns 'high' for many matches", () => {
      const item = makeItem({ itemId: 1, matchesPlayed: 10 });
      expect(getConfidenceLevel(item, 16)).toBe("high"); // 10 >= 8
    });
  });

  describe("getSuggestedMinimumDuels", () => {
    it("returns 0 for 0 or 1 items", () => {
      expect(getSuggestedMinimumDuels(0)).toBe(0);
      expect(getSuggestedMinimumDuels(1)).toBe(0);
    });

    it("returns n * ceil(log2(n)) for multiple items", () => {
      // 8 items: 8 * 3 = 24
      expect(getSuggestedMinimumDuels(8)).toBe(24);
      // 16 items: 16 * 4 = 64
      expect(getSuggestedMinimumDuels(16)).toBe(64);
    });

    it("handles non-power-of-2 counts", () => {
      // 10 items: 10 * ceil(log2(10)) = 10 * ceil(3.32) = 10 * 4 = 40
      expect(getSuggestedMinimumDuels(10)).toBe(40);
    });
  });
});
