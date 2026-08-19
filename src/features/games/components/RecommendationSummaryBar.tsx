import { Box, Group, Tooltip } from "@mantine/core";
import * as React from "react";

import { RecommendationEnum } from "@/client";

import { getRecommendationConfig, RECOMMENDATION_ORDER } from "../utils/recommendationConfig";

type RecommendationCounts = {
  recommended?: number;
  not_recommended?: number;
  undecided?: number;
} | null;

type RecommendationSummaryBarProps = {
  counts?: RecommendationCounts;
};

const COUNT_KEY_BY_RECOMMENDATION: Record<RecommendationEnum, keyof NonNullable<RecommendationCounts>> = {
  [RecommendationEnum.RECOMMENDED]: "recommended",
  [RecommendationEnum.NOT_RECOMMENDED]: "not_recommended",
  [RecommendationEnum.UNDECIDED]: "undecided",
};

export default function RecommendationSummaryBar({
  counts,
}: Readonly<RecommendationSummaryBarProps>): React.JSX.Element | null {
  const segments = RECOMMENDATION_ORDER.map(recommendation => ({
    recommendation,
    count: counts?.[COUNT_KEY_BY_RECOMMENDATION[recommendation]] ?? 0,
  })).filter(segment => segment.count > 0);

  const total = segments.reduce((sum, segment) => sum + segment.count, 0);

  if (total === 0) {
    return null;
  }

  return (
    <Group
      gap={0}
      style={{
        width: "100%",
        height: 32,
        borderRadius: 8,
        overflow: "hidden",
        border: "1px solid var(--color-background-300)",
      }}
    >
      {segments.map(({ recommendation, count }) => {
        const config = getRecommendationConfig(recommendation);
        return (
          <Tooltip key={recommendation} label={config?.label}>
            <Box
              style={{
                width: `${(count / total) * 100}%`,
                height: "100%",
                background: config?.color,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "white",
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              {count}
            </Box>
          </Tooltip>
        );
      })}
    </Group>
  );
}
