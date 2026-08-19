import { Box, Stack, Title, Text, Group, Badge, Divider, ScrollArea } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameListStatusEnum } from "@/client";

import { GameRowItem } from "./GameRowItem";
import { GameRow } from "./types";

import styles from "./ConfigureGameList.module.css";

interface ConfigureGameListProps {
  rows: GameRow[];
  onStatusChange: (index: number, value: GameListStatusEnum) => void;
  onScoreChange: (index: number, value: number | null) => void;
  onFieldChange: (index: number, field: keyof GameRow, value: unknown) => void;
}

/** The "review and configure the games to import" card shared by both flows. */
export const ConfigureGameList = ({ rows, onStatusChange, onScoreChange, onFieldChange }: ConfigureGameListProps) => {
  const { t } = useTranslation("games");

  return (
    <Box className={styles.card}>
      <Stack gap={16}>
        <Group justify="space-between" align="center">
          <Title order={3} fz={20} fw={700} c="var(--color-text-900)">
            {t("import.matchedTitle")}
          </Title>
          <Text fz="sm" c="dimmed">
            {t("import.matchedDescription")}
          </Text>
          <Badge variant="light" color="teal" size="lg">
            {rows.length}
          </Badge>
        </Group>

        <Group fz="sm" fw={600} c="dimmed" gap={16} style={{ paddingLeft: 64 }}>
          <Text style={{ flex: 1 }}>{t("import.gameTitle")}</Text>
          <Text w={160}>{t("import.status")}</Text>
          <Text w={80}>{t("import.score")}</Text>
          <Text w={100}></Text>
        </Group>
        <Divider />

        {rows.length === 0 ? (
          <Text ta="center" c="dimmed" py={24}>
            {t("import.noMatched")}
          </Text>
        ) : (
          <ScrollArea.Autosize mah={500} className={styles.scrollList}>
            {rows.map((row, i) => (
              <GameRowItem
                key={row.game.id}
                row={row}
                index={i}
                onStatusChange={onStatusChange}
                onScoreChange={onScoreChange}
                onFieldChange={onFieldChange}
              />
            ))}
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Box>
  );
};
