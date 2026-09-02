import { Box, Stack, Title, Text, Group, Badge, Divider, ScrollArea } from "@mantine/core";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameListStatusEnum } from "@/client";

import code_to_value_mapping from "../../utils/GameListStatuses";
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
  const { t, i18n } = useTranslation("games");

  // Status labels are translated at call time (see statusConfig), so this can't
  // live at module scope — but it must be one stable reference shared by every
  // row, otherwise `React.memo` on the row would never hold.
  const statusData = React.useMemo(
    () => code_to_value_mapping().map(item => ({ value: item.code, label: item.value })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [i18n.language],
  );

  // View state only (which rows are expanded); kept out of `useGameRows`, which
  // owns the import payload. Held here rather than in the row so it survives the
  // row unmounting when it scrolls out of the virtualized viewport.
  const [expandedRows, setExpandedRows] = React.useState<Set<number>>(() => new Set());
  const onToggleExpand = React.useCallback((index: number) => {
    setExpandedRows(prev => {
      const next = new Set(prev);
      if (next.has(index)) {
        next.delete(index);
      } else {
        next.add(index);
      }
      return next;
    });
  }, []);

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 92,
    overscan: 5,
    getItemKey: index => rows[index].game.id,
  });

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
          <Badge
            size="lg"
            style={{
              background: "var(--color-success-tint-bg)",
              color: "var(--color-success-tint-text)",
              border: "1px solid var(--color-success-tint-border)",
            }}
          >
            {rows.length}
          </Badge>
        </Group>

        <Group fz="sm" fw={600} c="dimmed" gap={16} style={{ paddingLeft: 64 }}>
          <Text style={{ flex: 1 }}>{t("import.gameTitle")}</Text>
          <Text w={160}>{t("import.status")}</Text>
          <Text w={90}>{t("import.score")}</Text>
          <Text w={100}></Text>
        </Group>
        <Divider />

        {rows.length === 0 ? (
          <Text ta="center" c="dimmed" py={24}>
            {t("import.noMatched")}
          </Text>
        ) : (
          <ScrollArea.Autosize mah={500} viewportRef={scrollRef} className={styles.scrollList}>
            <div style={{ height: virtualizer.getTotalSize(), position: "relative" }}>
              {virtualizer.getVirtualItems().map(virtualItem => {
                const i = virtualItem.index;
                const row = rows[i];
                return (
                  <div
                    key={virtualItem.key}
                    data-index={i}
                    ref={virtualizer.measureElement}
                    style={{
                      position: "absolute",
                      top: 0,
                      left: 0,
                      width: "100%",
                      transform: `translateY(${virtualItem.start}px)`,
                    }}
                  >
                    <GameRowItem
                      row={row}
                      index={i}
                      statusData={statusData}
                      expanded={expandedRows.has(i)}
                      onToggleExpand={onToggleExpand}
                      onStatusChange={onStatusChange}
                      onScoreChange={onScoreChange}
                      onFieldChange={onFieldChange}
                    />
                  </div>
                );
              })}
            </div>
          </ScrollArea.Autosize>
        )}
      </Stack>
    </Box>
  );
};
