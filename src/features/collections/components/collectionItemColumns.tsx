import { ActionIcon, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { CollectionItem } from "@/client";
import { type PaginatedTableFeatures } from "@/components/ui/PaginatedTable";
import { CoverThumb } from "@/features/games/components/CoverThumb";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";

const COVER_WIDTH = 96;
const COVER_HEIGHT = 128;

const columnHelper = createColumnHelper<PaginatedTableFeatures, CollectionItem>();

interface CreateCollectionItemColumnsArgs {
  t: TFunction<"collections">;
  canEdit: boolean;
  showAddedBy: boolean;
  onRemove: (itemId: number, gameTitle: string) => void;
}

export function createCollectionItemColumns({
  t,
  canEdit,
  showAddedBy,
  onRemove,
}: CreateCollectionItemColumnsArgs): ColumnDef<PaginatedTableFeatures, CollectionItem, any>[] {
  const columns: ColumnDef<PaginatedTableFeatures, CollectionItem, any>[] = [
    columnHelper.display({
      id: "cover",
      header: "",
      cell: ({ row }) => (
        <CoverThumb
          src={getIGDBImageURL(row.original.game.cover_image_id ?? "", IGDBImageSize.COVER_BIG_264_374) || undefined}
          alt={row.original.game.title}
          width={COVER_WIDTH}
          height={COVER_HEIGHT}
        />
      ),
    }),
    columnHelper.accessor(row => row.game.title, {
      id: "title",
      header: t("detail.table.title"),
      cell: info => (
        <Link
          to="/game/$id/$slug"
          params={{ id: String(info.row.original.game.id), slug: info.row.original.game.slug ?? "" }}
          style={{ fontWeight: 600, color: "var(--mantine-color-primary-6)" }}
        >
          {info.getValue()}
        </Link>
      ),
    }),
  ];

  if (showAddedBy) {
    columns.push(
      columnHelper.accessor(row => row.added_by.username, {
        id: "addedBy",
        header: t("detail.table.addedBy"),
        cell: info => (
          <Text fz="sm" c="dimmed">
            {info.getValue()}
          </Text>
        ),
      }),
    );
  }

  if (canEdit) {
    columns.push(
      columnHelper.display({
        id: "actions",
        header: t("detail.table.actions"),
        cell: ({ row }) => (
          <ActionIcon
            variant="subtle"
            color="red"
            size="lg"
            aria-label={t("detail.table.remove")}
            onClick={event => {
              event.stopPropagation();
              onRemove(row.original.id, row.original.game.title);
            }}
          >
            <IconTrash size={18} />
          </ActionIcon>
        ),
      }),
    );
  }

  return columns;
}
