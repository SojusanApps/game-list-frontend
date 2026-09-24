import { LanguageEnum } from "@/client";

export const ALL_REVIEW_LANGUAGES = "all";

/** A reader's choice of which Review Languages to see: one language, or every language. */
export type ReviewLanguageFilter = LanguageEnum | typeof ALL_REVIEW_LANGUAGES;

export const REVIEW_LANGUAGE_ORDER: LanguageEnum[] = [LanguageEnum.EN, LanguageEnum.PL];

export const REVIEW_LANGUAGE_FILTER_VALUES: ReviewLanguageFilter[] = [...REVIEW_LANGUAGE_ORDER, ALL_REVIEW_LANGUAGES];

export function isReviewLanguageFilter(value: unknown): value is ReviewLanguageFilter {
  return REVIEW_LANGUAGE_FILTER_VALUES.includes(value as ReviewLanguageFilter);
}

/**
 * The filter a reader starts with: their interface language when reviews can be written in it
 * (`"pl-PL"` counts as `pl`), otherwise every language.
 */
export function getDefaultReviewLanguageFilter(uiLanguage?: string): ReviewLanguageFilter {
  const base = uiLanguage?.split("-")[0]?.toLowerCase();
  return REVIEW_LANGUAGE_ORDER.find(language => language === base) ?? ALL_REVIEW_LANGUAGES;
}

/** The `language` query param for the reviews list; omitted when showing every language. */
export function reviewLanguageQuery(filter: ReviewLanguageFilter): { language?: LanguageEnum } {
  return filter === ALL_REVIEW_LANGUAGES ? {} : { language: filter };
}
