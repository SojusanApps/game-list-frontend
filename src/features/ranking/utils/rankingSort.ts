import type { RankedItem, ConfidenceLevel } from "../types";

/**
 * Sort ranked items by Elo rating descending.
 * Ties broken by: more wins → fewer losses → more matches played.
 */
export function sortByRating(items: RankedItem[]): RankedItem[] {
  return items.toSorted((a, b) => {
    if (b.rating !== a.rating) {
      return b.rating - a.rating;
    }
    if (b.wins !== a.wins) {
      return b.wins - a.wins;
    }
    if (a.losses !== b.losses) {
      return a.losses - b.losses;
    }
    return b.matchesPlayed - a.matchesPlayed;
  });
}

/**
 * Determine confidence level for a single item's rating based on how many
 * matches it has played relative to the total number of items.
 *
 * Thresholds based on log₂(n):
 *   - low:    matchesPlayed < log₂(n)
 *   - medium: matchesPlayed < 2 * log₂(n)
 *   - high:   matchesPlayed >= 2 * log₂(n)
 */
export function getConfidenceLevel(item: RankedItem, totalItems: number): ConfidenceLevel {
  const logN = Math.max(Math.log2(totalItems), 1);

  if (item.matchesPlayed < logN) {
    return "low";
  }
  if (item.matchesPlayed < 2 * logN) {
    return "medium";
  }
  return "high";
}

/**
 * Calculate a suggested minimum number of duels for a reasonable ranking.
 * Formula: n * ceil(log₂(n)) — analogous to the number of comparisons
 * needed by an efficient comparison sort.
 */
export function getSuggestedMinimumDuels(itemCount: number): number {
  if (itemCount <= 1) return 0;
  return itemCount * Math.ceil(Math.log2(itemCount));
}
