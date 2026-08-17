import { describe, expect, it } from "vitest";

import type { RankedItem, DuelResult } from "@/features/ranking/types";
import { selectNextPair } from "@/features/ranking/utils/pairSelection";

function makeItem(id: number, rating: number = 1000, matchesPlayed: number = 0): RankedItem {
  return {
    itemId: id,
    gameId: id,
    title: `Game ${id}`,
    rating,
    matchesPlayed,
    wins: 0,
    losses: 0,
    draws: 0,
  };
}

function makeDuel(aId: number, bId: number): DuelResult {
  return { itemAId: aId, itemBId: bId, choice: "A", timestamp: Date.now() };
}

describe("pairSelection", () => {
  it("returns null for fewer than 2 items", () => {
    expect(selectNextPair([], [])).toBeNull();
    expect(selectNextPair([makeItem(1)], [])).toBeNull();
  });

  it("returns a pair of two different items", () => {
    const items = [makeItem(1), makeItem(2), makeItem(3)];
    const pair = selectNextPair(items, []);
    expect(pair).not.toBeNull();
    expect(pair![0].itemId).not.toBe(pair![1].itemId);
  });

  it("avoids recently used pairs when alternatives exist", () => {
    const items = [makeItem(1, 1000), makeItem(2, 1001), makeItem(3, 1002)];
    // Simulate recent duels between 1-2 and 2-3
    const history: DuelResult[] = [makeDuel(1, 2), makeDuel(2, 3), makeDuel(1, 2)];
    const pair = selectNextPair(items, history);
    expect(pair).not.toBeNull();
    // With 3 items and 2 recent pairs (1-2, 2-3), the remaining pair is 1-3
    const ids = [pair![0].itemId, pair![1].itemId].toSorted((a, b) => a - b);
    expect(ids).toEqual([1, 3]);
  });

  it("still returns a pair even if all pairs are recent (fallback)", () => {
    const items = [makeItem(1), makeItem(2)];
    const history: DuelResult[] = [makeDuel(1, 2), makeDuel(1, 2), makeDuel(1, 2)];
    const pair = selectNextPair(items, history);
    expect(pair).not.toBeNull();
  });

  it("prefers items with fewer matches", () => {
    const items = [
      makeItem(1, 1000, 10),
      makeItem(2, 1000, 10),
      makeItem(3, 1000, 0), // least played
      makeItem(4, 1000, 0), // least played
    ];
    // Run multiple trials to check tendency
    let containsUnderplayed = 0;
    const trials = 20;
    for (let i = 0; i < trials; i++) {
      const pair = selectNextPair(items, []);
      if (pair) {
        const ids = new Set([pair[0].itemId, pair[1].itemId]);
        if (ids.has(3) || ids.has(4)) containsUnderplayed++;
      }
    }
    // Should pick underplayed items most of the time
    expect(containsUnderplayed).toBeGreaterThan(trials * 0.5);
  });

  it("works with a large number of items", () => {
    const items = Array.from({ length: 200 }, (_, i) => makeItem(i + 1, 1000 + i * 2));
    const pair = selectNextPair(items, []);
    expect(pair).not.toBeNull();
    expect(pair![0].itemId).not.toBe(pair![1].itemId);
  });
});
