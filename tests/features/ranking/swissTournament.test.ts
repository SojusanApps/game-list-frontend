import { describe, expect, it } from "vitest";
import {
  getTotalRounds,
  getTotalDuels,
  buildRoundPairings,
  getByeItemId,
  pairKey,
} from "@/features/ranking/utils/swissTournament";
import type { RankedItem } from "@/features/ranking/types";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function makeItem(id: number, rating: number = 1000): RankedItem {
  return { itemId: id, gameId: id, title: `Game ${id}`, rating, matchesPlayed: 0, wins: 0, losses: 0, draws: 0 };
}

// ---------------------------------------------------------------------------
// pairKey
// ---------------------------------------------------------------------------

describe("pairKey", () => {
  it("returns the smaller id first", () => {
    expect(pairKey(3, 1)).toBe("1-3");
    expect(pairKey(1, 3)).toBe("1-3");
  });

  it("is order-independent (commutative)", () => {
    expect(pairKey(5, 8)).toBe(pairKey(8, 5));
  });
});

// ---------------------------------------------------------------------------
// getTotalRounds
// ---------------------------------------------------------------------------

describe("getTotalRounds", () => {
  it("returns 0 for 0 or 1 items", () => {
    expect(getTotalRounds(0)).toBe(0);
    expect(getTotalRounds(1)).toBe(0);
  });

  it("returns 1 for 2 items", () => {
    expect(getTotalRounds(2)).toBe(1);
  });

  it("returns 2 for 3–4 items", () => {
    expect(getTotalRounds(3)).toBe(2);
    expect(getTotalRounds(4)).toBe(2);
  });

  it("returns 3 for 5–8 items", () => {
    expect(getTotalRounds(5)).toBe(3);
    expect(getTotalRounds(8)).toBe(3);
  });

  it("returns 4 for 9–16 items", () => {
    expect(getTotalRounds(9)).toBe(4);
    expect(getTotalRounds(10)).toBe(4);
    expect(getTotalRounds(16)).toBe(4);
  });

  it("returns ceil(log2(n)) in general", () => {
    expect(getTotalRounds(20)).toBe(5);
    expect(getTotalRounds(50)).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// getTotalDuels
// ---------------------------------------------------------------------------

describe("getTotalDuels", () => {
  it("returns 0 for 0 or 1 items", () => {
    expect(getTotalDuels(0)).toBe(0);
    expect(getTotalDuels(1)).toBe(0);
  });

  it("n=2 → 1 round × 1 duel = 1", () => {
    expect(getTotalDuels(2)).toBe(1);
  });

  it("n=4 → 2 rounds × 2 duels = 4", () => {
    expect(getTotalDuels(4)).toBe(4);
  });

  it("n=5 (odd) → 3 rounds × 2 duels = 6", () => {
    // floor(5/2) = 2 duels per round, ceil(log2(5)) = 3 rounds
    expect(getTotalDuels(5)).toBe(6);
  });

  it("n=8 → 3 rounds × 4 duels = 12", () => {
    expect(getTotalDuels(8)).toBe(12);
  });

  it("n=10 → 4 rounds × 5 duels = 20", () => {
    expect(getTotalDuels(10)).toBe(20);
  });

  it("is roughly half of the old n*ceil(log2(n)) formula", () => {
    for (const n of [6, 8, 10, 16, 20]) {
      const swiss = getTotalDuels(n);
      const old = n * Math.ceil(Math.log2(n));
      // Swiss should be at most 50% of old estimate for even n
      expect(swiss).toBeLessThanOrEqual(old * 0.55);
    }
  });
});

// ---------------------------------------------------------------------------
// buildRoundPairings
// ---------------------------------------------------------------------------

describe("buildRoundPairings", () => {
  it("pairs all items when n is even", () => {
    const items = [makeItem(1), makeItem(2), makeItem(3), makeItem(4)];
    const pairings = buildRoundPairings(items, new Set());
    expect(pairings).toHaveLength(2);
    const pairedIds = pairings.flat();
    expect(pairedIds.toSorted()).toEqual([1, 2, 3, 4]);
  });

  it("leaves one item unpaired when n is odd", () => {
    const items = [makeItem(1), makeItem(2), makeItem(3)];
    const pairings = buildRoundPairings(items, new Set());
    expect(pairings).toHaveLength(1);
    const pairedIds = new Set(pairings.flat());
    expect(pairedIds.size).toBe(2);
  });

  it("does not pair any item with itself", () => {
    const items = [makeItem(1), makeItem(2), makeItem(3), makeItem(4), makeItem(5), makeItem(6)];
    const pairings = buildRoundPairings(items, new Set());
    for (const [a, b] of pairings) {
      expect(a).not.toBe(b);
    }
  });

  it("avoids seen pairs when alternatives are available", () => {
    // Items sorted by rating: 4 > 3 > 2 > 1
    // Natural round 1 pairings: [4,3] and [2,1]
    // With [4,3] seen, next best for item 4 should be item 2
    const items = [makeItem(1, 990), makeItem(2, 995), makeItem(3, 1005), makeItem(4, 1010)];
    const seenPairs = new Set([pairKey(3, 4)]); // 3-4 already seen
    const pairings = buildRoundPairings(items, seenPairs);
    expect(pairings).toHaveLength(2);
    // 4 should be paired with 2 (next closest), not 3
    const hasSeenPair = pairings.some(([a, b]) => pairKey(a, b) === pairKey(3, 4));
    expect(hasSeenPair).toBe(false);
  });

  it("falls back to a seen pair if no fresh options exist (2 items)", () => {
    const items = [makeItem(1), makeItem(2)];
    const seenPairs = new Set([pairKey(1, 2)]); // only possible pair already seen
    const pairings = buildRoundPairings(items, seenPairs);
    // Must return the only available pair even though seen
    expect(pairings).toHaveLength(1);
    expect(pairings[0].toSorted()).toEqual([1, 2]);
  });

  it("each item appears in at most one pairing per round", () => {
    const items = [makeItem(1), makeItem(2), makeItem(3), makeItem(4), makeItem(5), makeItem(6)];
    const pairings = buildRoundPairings(items, new Set());
    const seen = new Set<number>();
    for (const [a, b] of pairings) {
      expect(seen.has(a)).toBe(false);
      expect(seen.has(b)).toBe(false);
      seen.add(a);
      seen.add(b);
    }
  });

  it("rotates bye fairly for odd n across rounds", () => {
    const items = [makeItem(1, 1010), makeItem(2, 1005), makeItem(3, 990)];
    // Round 1: item 3 (lowest) gets bye
    const r1 = buildRoundPairings(items, new Set(), []);
    const bye1 = getByeItemId(items, r1);
    expect(bye1).toBe(3);

    // Round 2: item 3 already had bye → item 2 should get bye next
    const r2 = buildRoundPairings(items, new Set(r1.map(([a, b]) => pairKey(a, b))), [bye1!]);
    const bye2 = getByeItemId(items, r2);
    expect(bye2).not.toBe(bye1); // different bye recipient
  });

  it("pairs highest-rated items together (top vs 2nd, etc.)", () => {
    const items = [
      makeItem(4, 800),
      makeItem(3, 900),
      makeItem(2, 1100),
      makeItem(1, 1200), // highest
    ];
    const pairings = buildRoundPairings(items, new Set());
    // Items sorted: 1 (1200), 2 (1100), 3 (900), 4 (800)
    // Expected: [1,2] and [3,4]
    const firstPair = pairings[0].toSorted((a, b) => a - b);
    const secondPair = pairings[1].toSorted((a, b) => a - b);
    expect(firstPair).toEqual([1, 2]);
    expect(secondPair).toEqual([3, 4]);
  });
});

// ---------------------------------------------------------------------------
// getByeItemId
// ---------------------------------------------------------------------------

describe("getByeItemId", () => {
  it("returns null when all items are paired (even n)", () => {
    const items = [makeItem(1), makeItem(2), makeItem(3), makeItem(4)];
    const pairings: Array<[number, number]> = [
      [1, 2],
      [3, 4],
    ];
    expect(getByeItemId(items, pairings)).toBeNull();
  });

  it("returns the unpaired item id (odd n)", () => {
    const items = [makeItem(1), makeItem(2), makeItem(3)];
    const pairings: Array<[number, number]> = [[1, 2]];
    expect(getByeItemId(items, pairings)).toBe(3);
  });
});
