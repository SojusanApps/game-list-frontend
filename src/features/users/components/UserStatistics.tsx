import { Box, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { UserDetail, GameListStatusEnum } from "@/client";
import { StatCard } from "@/components/ui/StatCard";
import { StatusIcon } from "@/features/games/utils/StatusIcon";
import { formatMeanScore } from "@/utils/ratingUtils";

import styles from "./UserStatistics.module.css";

interface UserStatisticsProps {
  userDetails?: UserDetail;
}

export default function UserStatistics({ userDetails }: Readonly<UserStatisticsProps>) {
  const { t } = useTranslation("users");
  return (
    <Stack gap={32}>
      <SimpleGrid cols={{ base: 1, md: 4 }} spacing={16}>
        {/* Status Breakdown Card */}
        <Box
          className={styles.breakdown}
          style={{
            padding: 20,
            background: "var(--color-background-100)",
            borderRadius: 16,
            border: "1px solid var(--color-background-300)",
          }}
        >
          <Stack gap={14}>
            {[
              {
                key: GameListStatusEnum.P,
                label: t("stats.currentlyPlaying"),
                count: userDetails?.game_list_statistics.playing,
              },
              {
                key: GameListStatusEnum.OH,
                label: t("stats.onHold"),
                count: userDetails?.game_list_statistics.on_hold,
              },
              {
                key: GameListStatusEnum.D,
                label: t("stats.dropped"),
                count: userDetails?.game_list_statistics.dropped,
              },
              {
                key: GameListStatusEnum.C,
                label: t("stats.completed"),
                count: userDetails?.game_list_statistics.completed,
              },
              {
                key: GameListStatusEnum.PTP,
                label: t("stats.planToPlay"),
                count: userDetails?.game_list_statistics.plan_to_play,
              },
              {
                key: GameListStatusEnum.NP,
                label: t("stats.notPlanned"),
                count: userDetails?.game_list_statistics.not_planned,
              },
            ].map(({ key, label, count }) => {
              return (
                <Group key={key} justify="space-between" align="center">
                  <Group gap={10}>
                    <StatusIcon status={key} size={18} neon />
                    <Text component="span" size="sm" fw={600} c="var(--color-text-500)">
                      {label}
                    </Text>
                  </Group>
                  <Text component="span" size="sm" fw={700} c="var(--color-text-900)">
                    {count}
                  </Text>
                </Group>
              );
            })}
          </Stack>
        </Box>

        {/* Total Entries Card */}
        <StatCard label={t("stats.totalEntries")} value={userDetails?.game_list_statistics.total} tone="success" />

        <StatCard
          label={t("stats.meanScore")}
          value={
            userDetails?.game_list_statistics.mean_score
              ? formatMeanScore(userDetails.game_list_statistics.mean_score)
              : "0.0"
          }
          tone="primary"
        />
      </SimpleGrid>
    </Stack>
  );
}
