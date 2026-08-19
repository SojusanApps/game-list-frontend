import type React from "react";

import { RecommendationEnum } from "@/client";
import i18n from "@/lib/i18n";

export interface RecommendationConfig {
  label: string;
  badgeStyle: React.CSSProperties;
  color: string;
}

export const RECOMMENDATION_ORDER: RecommendationEnum[] = [
  RecommendationEnum.RECOMMENDED,
  RecommendationEnum.UNDECIDED,
  RecommendationEnum.NOT_RECOMMENDED,
];

const BADGE_STYLES: Record<RecommendationEnum, React.CSSProperties> = {
  [RecommendationEnum.RECOMMENDED]: {
    background: "var(--color-success-100)",
    color: "var(--color-success-900)",
    border: "1px solid var(--color-success-200)",
  },
  [RecommendationEnum.NOT_RECOMMENDED]: {
    background: "var(--color-error-100)",
    color: "var(--color-error-900)",
    border: "1px solid var(--color-error-200)",
  },
  [RecommendationEnum.UNDECIDED]: {
    background: "var(--color-secondary-100)",
    color: "var(--color-secondary-900)",
    border: "1px solid var(--color-secondary-200)",
  },
};

const SOLID_COLORS: Record<RecommendationEnum, string> = {
  [RecommendationEnum.RECOMMENDED]: "var(--color-success-500)",
  [RecommendationEnum.NOT_RECOMMENDED]: "var(--color-error-500)",
  [RecommendationEnum.UNDECIDED]: "var(--color-secondary-500)",
};

const TRANSLATION_KEYS: Record<RecommendationEnum, string> = {
  [RecommendationEnum.RECOMMENDED]: "games:recommendation.recommended",
  [RecommendationEnum.NOT_RECOMMENDED]: "games:recommendation.notRecommended",
  [RecommendationEnum.UNDECIDED]: "games:recommendation.undecided",
};

/** Returns a fresh RecommendationConfig reading the current i18n language at call time. */
export const getRecommendationConfig = (
  recommendation: RecommendationEnum | string | undefined,
): RecommendationConfig | undefined => {
  if (!recommendation || !(recommendation in TRANSLATION_KEYS)) {
    return undefined;
  }
  const key = recommendation as RecommendationEnum;
  return {
    label: i18n.t(TRANSLATION_KEYS[key] as any),
    badgeStyle: BADGE_STYLES[key],
    color: SOLID_COLORS[key],
  };
};
