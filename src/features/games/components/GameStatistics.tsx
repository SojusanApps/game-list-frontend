import { SimpleGrid, Stack, Text } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Game } from "@/client";

interface GameStatisticsProps {
  gameDetails?: Game;
}

export default function GameStatistics({ gameDetails }: Readonly<GameStatisticsProps>) {
  const { t } = useTranslation("games");
  return (
    <Stack gap={32}>
      <SimpleGrid cols={{ base: 2, md: 4 }} spacing={{ base: 16, md: 24 }}>
        {/* Score Card */}
        <Stack
          align="center"
          justify="center"
          p="lg"
          style={{
            background: "var(--color-secondary-tint-bg)",
            borderRadius: "16px",
            border: "1px solid var(--color-secondary-tint-border)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            transition: "transform 200ms",
          }}
        >
          <Text
            fz={11}
            fw={700}
            c="var(--color-secondary-tint-text)"
            tt="uppercase"
            style={{ letterSpacing: "0.1em", marginBottom: "8px" }}
          >
            {t("stats.score")}
          </Text>
          <Text fz={36} fw={900} c="var(--color-secondary-tint-text)">
            {gameDetails?.average_score || "N/A"}
          </Text>
          <Text fz={10} c="var(--color-secondary-tint-text)" fw={600} mt={4}>
            {gameDetails?.scores_count} {t("stats.ratings")}
          </Text>
        </Stack>

        {/* Ranked Card */}
        <Stack
          align="center"
          justify="center"
          p="lg"
          style={{
            background: "var(--color-success-tint-bg)",
            borderRadius: "16px",
            border: "1px solid var(--color-success-tint-border)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            transition: "transform 200ms",
          }}
        >
          <Text
            fz={11}
            fw={700}
            c="var(--color-success-tint-text)"
            tt="uppercase"
            style={{ letterSpacing: "0.1em", marginBottom: "8px" }}
          >
            {t("stats.ranked")}
          </Text>
          <Text fz={36} fw={900} c="var(--color-success-tint-text)">
            #{gameDetails?.rank_position || "-"}
          </Text>
        </Stack>

        {/* Popularity Card */}
        <Stack
          align="center"
          justify="center"
          p="lg"
          style={{
            background: "var(--color-primary-tint-bg)",
            borderRadius: "16px",
            border: "1px solid var(--color-primary-tint-border)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            transition: "transform 200ms",
          }}
        >
          <Text
            fz={11}
            fw={700}
            c="var(--color-primary-tint-text)"
            tt="uppercase"
            style={{ letterSpacing: "0.1em", marginBottom: "8px" }}
          >
            {t("stats.popularity")}
          </Text>
          <Text fz={36} fw={900} c="var(--color-primary-tint-text)">
            #{gameDetails?.popularity || "-"}
          </Text>
        </Stack>

        {/* Members Card */}
        <Stack
          align="center"
          justify="center"
          p="lg"
          style={{
            background: "rgba(var(--color-veil-rgb), 0.5)",
            borderRadius: "16px",
            border: "1px solid rgba(203,213,225,0.5)",
            boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
            transition: "transform 200ms",
          }}
        >
          <Text
            fz={11}
            fw={700}
            c="var(--color-text-500)"
            tt="uppercase"
            style={{ letterSpacing: "0.1em", marginBottom: "8px" }}
          >
            {t("stats.members")}
          </Text>
          <Text fz={36} fw={900} c="var(--color-text-900)">
            {gameDetails?.members_count || "0"}
          </Text>
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
