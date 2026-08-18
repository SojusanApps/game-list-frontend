import { Badge, Box, Text, UnstyledButton } from "@mantine/core";
import { IconArrowsSort, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import {
  createColumnHelper,
  tableFeatures,
  rowSortingFeature,
  createSortedRowModel,
  sortFn_basic,
  ColumnDef,
} from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { GameListCompareRow, UserDetail } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";
import { getRatingColor } from "@/utils/ratingUtils";

import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";
import { getStatusConfig } from "../utils/statusConfig";
import { CompareUserChip } from "./CompareUserChip";

import styles from "./GameListCompareTable.module.css";

export const gameListCompareTableFeatures = tableFeatures({
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
});
export type GameListCompareTableFeatures = typeof gameListCompareTableFeatures;

function CompareStatusCell({ statusCode }: Readonly<{ statusCode: string | null }>) {
  if (!statusCode) {
    return <Text c="var(--color-text-400)">—</Text>;
  }

  const statusConfig = getStatusConfig(statusCode);
  if (!statusConfig) {
    return null;
  }

  return (
    <Badge variant="light" size="sm" style={{ ...statusConfig.badgeStyle, borderWidth: "1px", borderStyle: "solid" }}>
      {statusConfig.emoji} {statusConfig.label}
    </Badge>
  );
}

function ScoreCell({ score }: Readonly<{ score: number | null }>) {
  if (score === null || score === undefined) {
    return <Text c="var(--color-text-400)">—</Text>;
  }

  return (
    <Box className={styles.scoreBadge} style={{ backgroundColor: getRatingColor(score) }}>
      {score}
    </Box>
  );
}

function GameCell({ row }: Readonly<{ row: GameListCompareRow }>) {
  const coverUrl = getIGDBImageURL(row.game_cover_image ?? "", IGDBImageSize.COVER_SMALL_90_128);

  return (
    <Box
      component={Link}
      to={`/game/${row.game_id}/${row.game_slug}`}
      style={{ display: "flex", alignItems: "center", gap: 12, textDecoration: "none", minWidth: 0 }}
    >
      <Box className={styles.coverWrapper}>
        <SafeImage src={coverUrl} alt={row.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Box>
      <Text
        fw={600}
        c="var(--color-text-900)"
        style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}
      >
        {row.title}
      </Text>
    </Box>
  );
}

function SortableColumnHeader({
  label,
  isSorted,
  onToggle,
}: Readonly<{
  label: string;
  isSorted: false | "asc" | "desc";
  onToggle?: (event: unknown) => void;
}>) {
  return (
    <UnstyledButton
      onClick={onToggle}
      style={{ display: "flex", alignItems: "center", gap: 4, fontWeight: 700, fontSize: "var(--mantine-font-size-sm)" }}
    >
      {label}
      {isSorted === "asc" && <IconChevronUp size={14} />}
      {isSorted === "desc" && <IconChevronDown size={14} />}
      {!isSorted && <IconArrowsSort size={14} style={{ opacity: 0.4 }} />}
    </UnstyledButton>
  );
}

const columnHelper = createColumnHelper<GameListCompareTableFeatures, GameListCompareRow>();

interface CreateGameListCompareColumnsArgs {
  t: TFunction<"games">;
  firstUserDetails: UserDetail;
  secondUserDetails: UserDetail;
}

export function createGameListCompareColumns({
  t,
  firstUserDetails,
  secondUserDetails,
}: CreateGameListCompareColumnsArgs): ColumnDef<GameListCompareTableFeatures, GameListCompareRow, any>[] {
  return [
    columnHelper.display({
      id: "game",
      header: t("compare.gameColumn"),
      enableSorting: false,
      cell: ({ row }) => <GameCell row={row.original} />,
    }),
    columnHelper.display({
      id: "firstUserStatus",
      header: () => <CompareUserChip userDetails={firstUserDetails} />,
      enableSorting: false,
      cell: ({ row }) => <CompareStatusCell statusCode={row.original.first_user_status_code} />,
    }),
    columnHelper.accessor("first_user_score", {
      id: "firstUserScore",
      enableSorting: true,
      sortFn: sortFn_basic,
      header: ({ column }) => (
        <SortableColumnHeader
          label={t("compare.scoreColumn")}
          isSorted={column.getIsSorted()}
          onToggle={column.getToggleSortingHandler()}
        />
      ),
      cell: info => <ScoreCell score={info.getValue()} />,
    }),
    columnHelper.display({
      id: "secondUserStatus",
      header: () => <CompareUserChip userDetails={secondUserDetails} />,
      enableSorting: false,
      cell: ({ row }) => <CompareStatusCell statusCode={row.original.second_user_status_code} />,
    }),
    columnHelper.accessor("second_user_score", {
      id: "secondUserScore",
      enableSorting: true,
      sortFn: sortFn_basic,
      header: ({ column }) => (
        <SortableColumnHeader
          label={t("compare.scoreColumn")}
          isSorted={column.getIsSorted()}
          onToggle={column.getToggleSortingHandler()}
        />
      ),
      cell: info => <ScoreCell score={info.getValue()} />,
    }),
  ];
}
