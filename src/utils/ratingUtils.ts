type RatingBucket = "low" | "mid" | "high";

function getRatingBucket(rating: number): RatingBucket {
  if (rating < 5) return "low";
  if (rating < 8) return "mid";
  return "high";
}

/** A score of 0 (or a missing one) means nobody has scored yet, so there is nothing to display. */
export function hasScore(score: number | null | undefined): score is number {
  return typeof score === "number" && score > 0;
}

export function getRatingColor(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return "transparent";
  return `var(--color-rating-${getRatingBucket(rating)}-bg)`;
}

export function getRatingTextColor(rating: number | null | undefined): string {
  if (rating === null || rating === undefined) return "inherit";
  return `var(--color-rating-${getRatingBucket(rating)}-text)`;
}
