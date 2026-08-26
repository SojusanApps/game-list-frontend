import { Box, Group, ScrollArea, Stack, Text, Title } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { SafeImage } from "@/components/ui/SafeImage";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";

import type { RankedItem } from "../types";
import { getConfidenceLevel } from "../utils/rankingSort";

import styles from "./PairwiseRankingResults.module.css";

interface PairwiseRankingResultsProps {
  items: RankedItem[];
  onContinueDueling: () => void;
  onApplyToCollection: () => void;
  isApplying: boolean;
}

const CONFIDENCE_COLORS: Record<string, string> = {
  low: "var(--color-error-400)",
  medium: "var(--color-warning-400)",
  high: "var(--color-success-400)",
};

export const PairwiseRankingResults = React.memo(function ({
  items,
  onContinueDueling,
  onApplyToCollection,
  isApplying,
}: Readonly<PairwiseRankingResultsProps>) {
  const { t } = useTranslation("ranking");
  const totalItems = items.length;

  return (
    <Stack gap={16} style={{ animation: "fade-in 300ms ease-in-out" }}>
      {/* Actions */}
      <Group justify="space-between" align="center">
        <Title
          order={3}
          fz="lg"
          fw={900}
          c="var(--color-text-900)"
          style={{ textTransform: "uppercase", letterSpacing: "-0.025em" }}
        >
          {t("results.title")}
        </Title>
        <Group gap={8}>
          <Button
            onClick={onContinueDueling}
            variant="outline"
            size="sm"
            style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}
          >
            {t("results.continueDueling")}
          </Button>
          <Button
            onClick={onApplyToCollection}
            size="sm"
            style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em" }}
            disabled={isApplying}
          >
            {isApplying ? t("results.applying") : t("results.applyToCollection")}
          </Button>
        </Group>
      </Group>

      {/* Confidence legend */}
      <Group gap={16} fz="xs" c="var(--color-text-500)">
        <Text component="span" fw={600}>
          {t("results.confidenceLabel")}
        </Text>
        {(["high", "medium", "low"] as const).map(level => (
          <Group key={level} gap={4}>
            <Box w={8} h={8} bg={CONFIDENCE_COLORS[level]} style={{ borderRadius: "9999px" }} />
            {t(`results.${level}Confidence`)}
          </Group>
        ))}
      </Group>

      {/* Ranked list */}
      <ScrollArea
        style={{ maxHeight: "55vh", display: "flex", flexDirection: "column" }}
        viewportProps={{ style: { flex: 1, height: "auto", minHeight: 0, paddingRight: 4 } }}
      >
        <Stack gap={8}>
          {items.map((item, index) => {
            const confidence = getConfidenceLevel(item, totalItems);
            return (
              <Group key={item.itemId} gap={16} align="center" className={styles.resultRow}>
                {/* Rank */}
                <Box className={styles.rankBadge}>#{index + 1}</Box>

                {/* Confidence dot */}
                <Box
                  w={10}
                  h={10}
                  bg={CONFIDENCE_COLORS[confidence]}
                  style={{ borderRadius: "9999px", flexShrink: 0 }}
                  title={t(`results.${confidence}Confidence`)}
                />

                {/* Cover */}
                <Box className={styles.coverImage}>
                  <SafeImage
                    src={getIGDBImageURL(item.coverImageId ?? "", IGDBImageSize.COVER_SMALL_90_128)}
                    alt={item.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </Box>

                {/* Title */}
                <Box style={{ flex: 1, minWidth: 0 }}>
                  <Text fw={700} c="var(--color-text-900)" lineClamp={1} fz="sm">
                    {item.title}
                  </Text>
                </Box>

                {/* Stats */}
                <Group gap={12} fz="xs" style={{ flexShrink: 0 }}>
                  <Text
                    component="span"
                    fw={900}
                    c="var(--color-primary-600)"
                    bg="var(--color-primary-50)"
                    style={{ padding: "4px 8px", borderRadius: 8 }}
                  >
                    {item.rating}
                  </Text>
                  <Text component="span" c="var(--color-text-400)">
                    {item.wins}W / {item.losses}L / {item.draws}D
                  </Text>
                  <Text component="span" c="var(--color-text-300)">
                    {t("results.match", { count: item.matchesPlayed })}
                  </Text>
                </Group>
              </Group>
            );
          })}
        </Stack>
      </ScrollArea>
    </Stack>
  );
});

PairwiseRankingResults.displayName = "PairwiseRankingResults";
