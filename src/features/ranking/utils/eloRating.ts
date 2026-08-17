import type { DuelChoice } from "../types";

/** Default K-factor controlling how much ratings change per duel. */
export const DEFAULT_K_FACTOR = 32;

/** Default starting rating for new items. */
export const DEFAULT_RATING = 1000;

/**
 * Calculate the expected score for a player given both ratings.
 * E = 1 / (1 + 10^((opponentRating - rating) / 400))
 */
export function calculateExpectedScore(rating: number, opponentRating: number): number {
  return 1 / (1 + Math.pow(10, (opponentRating - rating) / 400));
}

interface EloUpdateResult {
  newRatingA: number;
  newRatingB: number;
}

/**
 * Update Elo ratings for two items after a duel.
 *
 * - choice "A"   → A wins  (scoreA = 1, scoreB = 0)
 * - choice "B"   → B wins  (scoreA = 0, scoreB = 1)
 * - choice "tie" → draw    (scoreA = 0.5, scoreB = 0.5)
 */
export function updateEloRatings(
  ratingA: number,
  ratingB: number,
  choice: DuelChoice,
  kFactor: number = DEFAULT_K_FACTOR,
): EloUpdateResult {
  const expectedA = calculateExpectedScore(ratingA, ratingB);
  const expectedB = calculateExpectedScore(ratingB, ratingA);

  let scoreA: number;
  let scoreB: number;

  switch (choice) {
    case "A": {
      scoreA = 1;
      scoreB = 0;
      break;
    }
    case "B": {
      scoreA = 0;
      scoreB = 1;
      break;
    }
    case "tie": {
      scoreA = 0.5;
      scoreB = 0.5;
      break;
    }
  }

  return {
    newRatingA: Math.round(ratingA + kFactor * (scoreA - expectedA)),
    newRatingB: Math.round(ratingB + kFactor * (scoreB - expectedB)),
  };
}
