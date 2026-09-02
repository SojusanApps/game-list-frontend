import { ActionIcon, Badge, Text } from "@mantine/core";
import { IconEdit } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { GameList } from "@/client";
import { type PaginatedTableFeatures } from "@/components/ui/PaginatedTable";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";
import { getStatusConfig } from "@/features/games/utils/statusConfig";
import { StatusIcon } from "@/features/games/utils/StatusIcon";

import { CoverThumb } from "./CoverThumb";
import { ScoreBadge } from "./ScoreBadge";

const COVER_WIDTH = 96;
const COVER_HEIGHT = 128;
const EMPTY = "—";

const columnHelper = createColumnHelper<PaginatedTableFeatures, GameList>();

interface CreateGameListColumnsArgs {
  t: TFunction<"games">;
  isOwner: boolean;
  onEdit: (gameId: number) => void;
}

export function createGameListColumns({
  t,
  isOwner,
  onEdit,
}: CreateGameListColumnsArgs): ColumnDef<PaginatedTableFeatures, GameList, any>[] {
  const columns: ColumnDef<PaginatedTableFeatures, GameList, any>[] = [
    columnHelper.display({
      id: "cover",
      header: "",
      cell: ({ row }) => (
        <CoverThumb
          src={
            row.original.game_cover_image
              ? getIGDBImageURL(row.original.game_cover_image, IGDBImageSize.COVER_BIG_264_374)
              : undefined
          }
          alt={row.original.title}
          width={COVER_WIDTH}
          height={COVER_HEIGHT}
        />
      ),
    }),
    columnHelper.accessor("title", {
      id: "title",
      header: t("gameList.table.title"),
      cell: info => (
        <Link
          to="/game/$id/$slug"
          params={{ id: String(info.row.original.game_id), slug: info.row.original.game_slug }}
          style={{ fontWeight: 600, color: "var(--mantine-color-primary-6)" }}
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor("status_code", {
      id: "status",
      header: t("gameList.table.status"),
      cell: info => {
        const config = getStatusConfig(info.getValue());
        if (!config) {
          return <Text fz="sm">{EMPTY}</Text>;
        }
        return (
          <Badge
            variant="light"
            size="sm"
            leftSection={<StatusIcon status={info.getValue()} size={12} />}
            style={{ ...config.badgeStyle, borderWidth: 1, borderStyle: "solid" }}
          >
            {config.label}
          </Badge>
        );
      },
    }),
    columnHelper.accessor("score", {
      id: "score",
      header: t("gameList.table.score"),
      cell: info => <ScoreBadge score={info.getValue()} />,
    }),
  ];

  if (isOwner) {
    columns.push(
      columnHelper.display({
        id: "actions",
        header: t("gameList.table.actions"),
        cell: ({ row }) => (
          <ActionIcon
            variant="subtle"
            color="gray"
            size="lg"
            aria-label={t("gameList.table.edit")}
            onClick={event => {
              event.stopPropagation();
              onEdit(row.original.game_id);
            }}
          >
            <IconEdit size={18} />
          </ActionIcon>
        ),
      }),
    );
  }

  return columns;
}
