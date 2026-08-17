import type { RankedItem } from "../types";

/**
 * Canonical pair key — order-independent, always "smallId-largeId".
 * Used for global deduplication across rounds.
 */
export function pairKey(a: number, b: number): string {
  return a < b ? `${a}-${b}` : `${b}-${a}`;
}

/**
 * Total number of Swiss rounds for n items.
 * Formula: ceil(log₂(n))
 * Examples: n=4→2, n=5→3, n=8→3, n=10→4, n=16→4, n=20→5
 */
export function getTotalRounds(n: number): number {
  if (n <= 1) {
    return 0;
  }
  return Math.ceil(Math.log2(n));
}

/**
 * Total planned duels across all Swiss rounds.
 * Formula: floor(n/2) * getTotalRounds(n)
 * Examples: n=5→6, n=8→12, n=10→20, n=16→32, n=20→50
 *
 * Roughly half of the old Elo estimate (n * ceil(log₂(n))).
 */
export function getTotalDuels(n: number): number {
  if (n <= 1) {
    return 0;
  }
  return Math.floor(n / 2) * getTotalRounds(n);
}

/**
 * Build the pairings for one Swiss round.
/**
 * Find the index of the bye candidate in a rating-sorted array.
 * Prefers the lowest-rated item that has not yet had a bye.
 */
function selectByeIndex(sorted: RankedItem[], byeHistory: number[]): number {
  for (let k = sorted.length - 1; k >= 0; k--) {
    if (!byeHistory.includes(sorted[k].itemId)) {
      return k;
    }
  }
  return sorted.length - 1; // all items have had a bye — pick the last
}

/**
 * Find the index of the nearest unpaired, unseen partner for sorted[afterIdx].
 * Returns -1 if no fresh partner exists.
 */
function findFreshPartnerIndex(
  sorted: RankedItem[],
  used: Set<number>,
  seenPairs: Set<string>,
  afterIdx: number,
): number {
  for (let j = afterIdx + 1; j < sorted.length; j++) {
    if (used.has(sorted[j].itemId)) {
      continue;
    }
    if (!seenPairs.has(pairKey(sorted[afterIdx].itemId, sorted[j].itemId))) {
      return j;
    }
  }
  return -1;
}

/**
 * Fallback: find the nearest unpaired item for sorted[afterIdx], ignoring seenPairs.
 * Returns -1 if no unpaired item exists.
 */
function findAnyPartnerIndex(sorted: RankedItem[], used: Set<number>, afterIdx: number): number {
  for (let j = afterIdx + 1; j < sorted.length; j++) {
    if (!used.has(sorted[j].itemId)) {
      return j;
    }
  }
  return -1;
}

/**
 * Build the pairings for one Swiss round.
 *
 * 1. Sort items by Elo rating descending (highest first).
 * 2. For odd n, select a bye candidate (lowest-rated item not yet byed).
 * 3. Pair items top-down: each item gets the nearest fresh (unseen) partner.
 *    Falls back to the nearest available partner if all options have been seen.
 *
 * Returns an ordered array of [itemIdA, itemIdB] tuples. The bye item is excluded.
 */
export function buildRoundPairings(
  items: RankedItem[],
  seenPairs: Set<string>,
  byeHistory: number[] = [],
): Array<[number, number]> {
  let sorted = items.toSorted((a, b) => b.rating - a.rating);

  if (sorted.length % 2 === 1) {
    const byeIdx = selectByeIndex(sorted, byeHistory);
    sorted = sorted.filter((_, i) => i !== byeIdx);
  }

  const pairings: Array<[number, number]> = [];
  const used = new Set<number>();

  for (let i = 0; i < sorted.length; i++) {
    if (used.has(sorted[i].itemId)) {
      continue;
    }

    const freshIdx = findFreshPartnerIndex(sorted, used, seenPairs, i);
    const partnerIdx = freshIdx === -1 ? findAnyPartnerIndex(sorted, used, i) : freshIdx;

    if (partnerIdx !== -1) {
      pairings.push([sorted[i].itemId, sorted[partnerIdx].itemId]);
      used.add(sorted[i].itemId);
      used.add(sorted[partnerIdx].itemId);
    }
  }

  return pairings;
}

/**
 * Return the itemId of the item that was excluded from pairings (bye),
 * or null when all items are paired (even n).
 */
export function getByeItemId(items: RankedItem[], pairings: Array<[number, number]>): number | null {
  const pairedIds = new Set(pairings.flat());
  return items.find(item => !pairedIds.has(item.itemId))?.itemId ?? null;
}
