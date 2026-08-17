import { describe, expect, it } from "vitest";

import {
  calculateExpectedScore,
  updateEloRatings,
  DEFAULT_K_FACTOR,
  DEFAULT_RATING,
} from "@/features/ranking/utils/eloRating";

describe("eloRating", () => {
  describe("calculateExpectedScore", () => {
    it("returns 0.5 for equal ratings", () => {
      expect(calculateExpectedScore(1000, 1000)).toBeCloseTo(0.5);
    });

    it("returns higher score for higher-rated player", () => {
      const score = calculateExpectedScore(1200, 1000);
      expect(score).toBeGreaterThan(0.5);
      expect(score).toBeLessThan(1);
    });

    it("returns lower score for lower-rated player", () => {
      const score = calculateExpectedScore(800, 1000);
      expect(score).toBeLessThan(0.5);
      expect(score).toBeGreaterThan(0);
    });

    it("expected scores for both players sum to 1", () => {
      const scoreA = calculateExpectedScore(1200, 900);
      const scoreB = calculateExpectedScore(900, 1200);
      expect(scoreA + scoreB).toBeCloseTo(1);
    });

    it("400 point difference gives ~0.91 expected score for stronger player", () => {
      const score = calculateExpectedScore(1400, 1000);
      expect(score).toBeCloseTo(0.9091, 3);
    });
  });

  describe("updateEloRatings", () => {
    it("winner gains and loser loses rating (A wins)", () => {
      const { newRatingA, newRatingB } = updateEloRatings(1000, 1000, "A");
      expect(newRatingA).toBeGreaterThan(1000);
      expect(newRatingB).toBeLessThan(1000);
    });

    it("winner gains and loser loses rating (B wins)", () => {
      const { newRatingA, newRatingB } = updateEloRatings(1000, 1000, "B");
      expect(newRatingA).toBeLessThan(1000);
      expect(newRatingB).toBeGreaterThan(1000);
    });

    it("tie keeps ratings close to original for equal players", () => {
      const { newRatingA, newRatingB } = updateEloRatings(1000, 1000, "tie");
      expect(newRatingA).toBe(1000);
      expect(newRatingB).toBe(1000);
    });

    it("strong upset produces larger rating change", () => {
      const { newRatingA } = updateEloRatings(800, 1200, "A");
      // B was expected to win, so A winning produces a big gain
      const { newRatingA: smallGain } = updateEloRatings(1000, 1000, "A");
      const gainFromUpset = newRatingA - 800;
      const gainFromEvenMatch = smallGain - 1000;
      expect(gainFromUpset).toBeGreaterThan(gainFromEvenMatch);
    });

    it("uses custom K-factor", () => {
      const defaultK = updateEloRatings(1000, 1000, "A", DEFAULT_K_FACTOR);
      const doubleK = updateEloRatings(1000, 1000, "A", 64);
      expect(doubleK.newRatingA - 1000).toBeGreaterThan(defaultK.newRatingA - 1000);
    });

    it("total rating is conserved (zero-sum)", () => {
      const { newRatingA, newRatingB } = updateEloRatings(1100, 900, "A");
      expect(newRatingA + newRatingB).toBe(1100 + 900);
    });
  });

  describe("constants", () => {
    it("DEFAULT_K_FACTOR is 32", () => {
      expect(DEFAULT_K_FACTOR).toBe(32);
    });

    it("DEFAULT_RATING is 1000", () => {
      expect(DEFAULT_RATING).toBe(1000);
    });
  });
});
