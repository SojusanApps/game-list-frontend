import { SimpleGrid, Stack } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Game } from "@/client";
import { StatCard } from "@/components/ui/StatCard";
import { formatMeanScore, getRatingColor, getRatingTextColor, hasScore } from "@/utils/ratingUtils";

interface GameStatisticsProps {
  gameDetails?: Game;
}

export default function GameStatistics({ gameDetails }: Readonly<GameStatisticsProps>) {
  const { t } = useTranslation("games");
  const averageScore = gameDetails?.average_score;
  return (
    <Stack gap={32}>
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing={{ base: 16, md: 24 }}>
        {/* Coloured like every other score in the app, so 6/10 reads the same in both themes. */}
        <StatCard
          label={t("stats.score")}
          value={hasScore(averageScore) ? formatMeanScore(averageScore) : t("stats.notAvailable")}
          caption={`${gameDetails?.scores_count} ${t("stats.ratings")}`}
          colors={
            hasScore(averageScore)
              ? {
                  background: getRatingColor(averageScore),
                  text: getRatingTextColor(averageScore),
                  border: getRatingColor(averageScore),
                }
              : undefined
          }
        />
        <StatCard label={t("stats.ranked")} value={`#${gameDetails?.rank_position || "-"}`} tone="blue" />
        <StatCard label={t("stats.popularity")} value={`#${gameDetails?.popularity || "-"}`} tone="purple" />
        <StatCard label={t("stats.members")} value={gameDetails?.members_count || "0"} />
      </SimpleGrid>
    </Stack>
  );
}
