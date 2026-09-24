import { describe, expect, it } from "vitest";

import { LanguageEnum } from "@/client";
import {
  ALL_REVIEW_LANGUAGES,
  getDefaultReviewLanguageFilter,
  isReviewLanguageFilter,
  reviewLanguageQuery,
} from "@/features/games/utils/reviewLanguage";

describe("reviewLanguage", () => {
  describe("getDefaultReviewLanguageFilter", () => {
    it("uses the UI language when reviews can be written in it", () => {
      expect(getDefaultReviewLanguageFilter("en")).toBe(LanguageEnum.EN);
      expect(getDefaultReviewLanguageFilter("pl")).toBe(LanguageEnum.PL);
    });

    it("ignores the region subtag", () => {
      expect(getDefaultReviewLanguageFilter("pl-PL")).toBe(LanguageEnum.PL);
      expect(getDefaultReviewLanguageFilter("en-GB")).toBe(LanguageEnum.EN);
    });

    it("falls back to all languages for an unsupported or missing UI language", () => {
      expect(getDefaultReviewLanguageFilter("de")).toBe(ALL_REVIEW_LANGUAGES);
      expect(getDefaultReviewLanguageFilter()).toBe(ALL_REVIEW_LANGUAGES);
    });
  });

  describe("reviewLanguageQuery", () => {
    it("sends the language for a single-language filter", () => {
      expect(reviewLanguageQuery(LanguageEnum.PL)).toEqual({ language: "pl" });
    });

    it("omits the language for the all filter", () => {
      expect(reviewLanguageQuery(ALL_REVIEW_LANGUAGES)).toEqual({});
    });
  });

  describe("isReviewLanguageFilter", () => {
    it("accepts en, pl and all only", () => {
      expect(isReviewLanguageFilter("en")).toBe(true);
      expect(isReviewLanguageFilter("all")).toBe(true);
      expect(isReviewLanguageFilter("de")).toBe(false);
      expect(isReviewLanguageFilter(null)).toBe(false);
    });
  });
});
