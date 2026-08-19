import { Box, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { UserDetail, GameListStatusEnum } from "@/client";
import { getStatusConfig } from "@/features/games/utils/statusConfig";

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
          style={{
            gridColumn: "span 2",
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
            ].map(({ key, label, count }) => {
              const config = getStatusConfig(key);
              return (
                <Group key={key} justify="space-between" align="center">
                  <Group gap={10}>
                    <Text component="span" fz="lg" lh={1}>
                      {config?.emoji}
                    </Text>
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
        <Stack
          align="center"
          justify="center"
          style={{
            padding: 24,
            background: "var(--color-success-tint-bg)",
            borderRadius: 16,
            border: "1px solid var(--color-success-tint-border)",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-success-tint-text)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 8,
            }}
          >
            {t("stats.totalEntries")}
          </Text>
          <Text fz={36} fw={900} c="var(--color-success-tint-text)">
            {userDetails?.game_list_statistics.total}
          </Text>
        </Stack>

        {/* Mean Score Card */}
        <Stack
          align="center"
          justify="center"
          style={{
            padding: 24,
            background: "var(--color-primary-tint-bg)",
            borderRadius: 16,
            border: "1px solid var(--color-primary-tint-border)",
          }}
        >
          <Text
            style={{
              fontSize: 10,
              fontWeight: 700,
              color: "var(--color-primary-tint-text)",
              textTransform: "uppercase",
              letterSpacing: "0.12em",
              marginBottom: 8,
            }}
          >
            {t("stats.meanScore")}
          </Text>
          <Text fz={36} fw={900} c="var(--color-primary-tint-text)">
            {userDetails?.game_list_statistics.mean_score?.toFixed(2) || "0.00"}
          </Text>
        </Stack>
      </SimpleGrid>
    </Stack>
  );
}
