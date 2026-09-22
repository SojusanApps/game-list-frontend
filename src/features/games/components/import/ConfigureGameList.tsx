import { Box, Stack, Title, Text, Group, Badge, Divider, ScrollArea } from "@mantine/core";
import { IconSelector, IconSortAscending, IconSortDescending } from "@tabler/icons-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameListStatusEnum } from "@/client";
import { Button } from "@/components/ui/Button";

import code_to_value_mapping from "../../utils/GameListStatuses";
import { getSortedRowIndices, SortColumn, SortDirection, SortState } from "../../utils/sortGameRows";
import { GameRowItem } from "./GameRowItem";
import { GameRow } from "./types";

import styles from "./ConfigureGameList.module.css";

interface SortableHeaderProps {
  column: SortColumn;
  label: string;
  active: SortState | null;
  onSort: (column: SortColumn) => void;
  style?: React.CSSProperties;
}

/** A header cell that cycles a column's sort state (ascending -> descending -> unsorted) on click. */
const SortableHeader = ({ column, label, active, onSort, style }: SortableHeaderProps) => {
  const { t } = useTranslation("games");
  const direction = active?.column === column ? active.direction : null;
  let Icon = IconSelector;
  if (direction === "asc") Icon = IconSortAscending;
  else if (direction === "desc") Icon = IconSortDescending;
  const ariaLabelDirection = direction === "asc" ? "import.ascending" : "import.descending";
  const ariaLabel = direction
    ? `${t("import.sortBy", { column: label })}, ${t(ariaLabelDirection)}`
    : t("import.sortBy", { column: label });

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className={styles.sortableHeader}
      style={style}
      rightSection={<Icon size={14} />}
      onClick={() => onSort(column)}
      aria-label={ariaLabel}
    >
      {label}
    </Button>
  );
};

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

  // A snapshot of the display order (original `rows` indices), recomputed only
  // when a header is clicked — not live, so editing a row's status/score while
  // sorted doesn't yank it to a new position mid-edit.
  const [activeSort, setActiveSort] = React.useState<(SortState & { order: number[] }) | null>(null);
  const handleSort = React.useCallback(
    (column: SortColumn) => {
      setActiveSort(prev => {
        let direction: SortDirection | null = "asc";
        if (prev?.column === column) {
          if (prev.direction === "asc") direction = "desc";
          else if (prev.direction === "desc") direction = null;
        }
        if (direction === null) return null;
        return { column, direction, order: getSortedRowIndices(rows, { column, direction }) };
      });
    },
    [rows],
  );
  const toOriginalIndex = React.useCallback(
    (displayIndex: number) => (activeSort ? activeSort.order[displayIndex] : displayIndex),
    [activeSort],
  );

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const virtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 92,
    overscan: 5,
    getItemKey: index => rows[toOriginalIndex(index)].game.id,
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
          <SortableHeader
            column="title"
            label={t("import.gameTitle")}
            active={activeSort}
            onSort={handleSort}
            style={{ flex: 1 }}
          />
          <SortableHeader
            column="status"
            label={t("import.status")}
            active={activeSort}
            onSort={handleSort}
            style={{ width: 160 }}
          />
          <SortableHeader
            column="score"
            label={t("import.score")}
            active={activeSort}
            onSort={handleSort}
            style={{ width: 90 }}
          />
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
                const i = toOriginalIndex(virtualItem.index);
                const row = rows[i];
                return (
                  <div
                    key={virtualItem.key}
                    data-index={virtualItem.index}
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
