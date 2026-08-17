import type { RankedItem, DuelResult } from "../types";

/** Number of recent duels to check when avoiding immediate pair repetition. */
const RECENCY_WINDOW = 3;

/**
 * Build a canonical key for a pair of item IDs (order-independent).
 */
function pairKey(idA: number, idB: number): string {
  return idA < idB ? `${idA}-${idB}` : `${idB}-${idA}`;
}

/** Build a set of recently used pair keys from the tail of history. */
function buildRecentPairs(history: DuelResult[]): Set<string> {
  const recentPairs = new Set<string>();
  const recentSlice = history.slice(-RECENCY_WINDOW);
  for (const d of recentSlice) {
    recentPairs.add(pairKey(d.itemAId, d.itemBId));
  }
  return recentPairs;
}

/** Score a candidate pair — higher is better. */
function scorePair(a: RankedItem, b: RankedItem, avgMatches: number, ratingRange: number): number {
  const matchDeficit = Math.max(0, avgMatches - a.matchesPlayed) + Math.max(0, avgMatches - b.matchesPlayed);
  const ratingGap = Math.abs(a.rating - b.rating);
  const closenessScore = 1 - ratingGap / ratingRange;
  return matchDeficit * 2 + closenessScore * 3;
}

/** Find the best candidate pair from a sorted item list within a sliding window. */
function findBestCandidate(
  sorted: RankedItem[],
  recentPairs: Set<string>,
  avgMatches: number,
  ratingRange: number,
): { a: RankedItem; b: RankedItem } | null {
  const W = Math.min(sorted.length - 1, Math.max(5, Math.ceil(sorted.length * 0.3)));
  let best: { a: RankedItem; b: RankedItem; score: number } | null = null;

  for (let i = 0; i < sorted.length; i++) {
    const limit = Math.min(i + W + 1, sorted.length);
    for (let j = i + 1; j < limit; j++) {
      const key = pairKey(sorted[i].itemId, sorted[j].itemId);
      if (recentPairs.has(key)) {
        continue;
      }

      const score = scorePair(sorted[i], sorted[j], avgMatches, ratingRange);
      if (!best || score > best.score) {
        best = { a: sorted[i], b: sorted[j], score };
      }
    }
  }

  return best;
}

/** Fallback: find any non-recent pair across all items. */
function findFallbackPair(sorted: RankedItem[], recentPairs: Set<string>): [RankedItem, RankedItem] {
  for (let i = 0; i < sorted.length; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      const key = pairKey(sorted[i].itemId, sorted[j].itemId);
      if (!recentPairs.has(key)) {
        return [sorted[i], sorted[j]];
      }
    }
  }
  // Absolute fallback: all pairs were recent
  return [sorted[0], sorted[1]];
}

/** Randomly swap the pair order to avoid positional bias. */
function randomizePlacement(a: RankedItem, b: RankedItem): [RankedItem, RankedItem] {
  return Math.random() < 0.5 ? [a, b] : [b, a];
}

/**
 * Select the next pair for a duel.
 *
 * Strategy:
 * 1. Prefer items with fewer matches played (exploration).
 * 2. Prefer items with similar ratings (informative comparison).
 * 3. Avoid repeating any of the last N pairs.
 */
export function selectNextPair(items: RankedItem[], history: DuelResult[]): [RankedItem, RankedItem] | null {
  if (items.length < 2) {
    return null;
  }

  const recentPairs = buildRecentPairs(history);
  const sorted = items.toSorted((a, b) => a.rating - b.rating);

  const avgMatches = items.reduce((sum, it) => sum + it.matchesPlayed, 0) / items.length;
  const maxRating = Math.max(...items.map(it => it.rating));
  const minRating = Math.min(...items.map(it => it.rating));
  const ratingRange = Math.max(maxRating - minRating, 1);

  const best = findBestCandidate(sorted, recentPairs, avgMatches, ratingRange);

  if (!best) {
    return findFallbackPair(sorted, recentPairs);
  }

  return randomizePlacement(best.a, best.b);
}
