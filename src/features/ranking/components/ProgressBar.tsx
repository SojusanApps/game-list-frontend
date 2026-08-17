import { Box, Group, Stack, Text } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import type { RankingProgress } from "../types";

interface ProgressBarProps {
  progress: RankingProgress;
}

function getRoundDotColor(isDone: boolean, isActive: boolean): string {
  if (isDone) return "var(--color-success-400)";
  if (isActive) return "var(--color-primary-400)";
  return "var(--color-background-200)";
}

export const ProgressBar = React.memo(function ({ progress }: Readonly<ProgressBarProps>) {
  const { t } = useTranslation("ranking");
  const { duelsCompleted, totalDuels, completionPercent, currentRound, totalRounds, duelInRound, duelsInRound } =
    progress;

  // Per-round progress (0–100)
  const roundPercent = duelsInRound > 0 ? Math.round((duelInRound / duelsInRound) * 100) : 0;
  const isBonus = currentRound > totalRounds;

  return (
    <Stack gap={6} style={{ width: "100%" }}>
      {/* Round label */}
      <Group justify="space-between" align="center" fz="xs" wrap="nowrap">
        <Text component="span" fw={600} c="var(--color-text-600)" style={{ whiteSpace: "nowrap" }}>
          {isBonus
            ? t("progress.bonusRound", { round: currentRound - totalRounds })
            : t("progress.round", { current: currentRound, total: totalRounds })}
          <Text component="span" c="var(--color-text-400)" fw={400} style={{ marginLeft: "6px" }}>
            {t("progress.duel", { current: duelInRound + 1, total: duelsInRound })}
          </Text>
        </Text>
        <Text
          component="span"
          fw={700}
          style={{
            fontVariantNumeric: "tabular-nums",
            color: completionPercent >= 100 ? "var(--color-success-600)" : "var(--color-primary-500)",
            whiteSpace: "nowrap",
          }}
        >
          {duelsCompleted}/{totalDuels}
        </Text>
      </Group>

      {/* Per-round progress bar */}
      <Box
        style={{
          width: "100%",
          height: "8px",
          background: "var(--color-background-100)",
          borderRadius: "9999px",
          overflow: "hidden",
        }}
      >
        <Box
          style={{
            width: `${Math.min(roundPercent, 100)}%`,
            height: "100%",
            borderRadius: "9999px",
            transition: "all 500ms ease-out",
            background: completionPercent >= 100 ? "var(--color-success-500)" : "var(--color-primary-500)",
          }}
        />
      </Box>

      {/* Overall progress dots for each round */}
      {totalRounds > 1 && (
        <Group gap={4}>
          {Array.from({ length: totalRounds }, (_, i) => {
            const round = i + 1;
            const isDone = round < currentRound;
            const isActive = round === currentRound;
            return (
              <Box
                key={round}
                style={{
                  height: "4px",
                  flex: 1,
                  borderRadius: "9999px",
                  transition: "all 300ms",
                  background: getRoundDotColor(isDone, isActive),
                }}
              />
            );
          })}
        </Group>
      )}
    </Stack>
  );
});

ProgressBar.displayName = "ProgressBar";
