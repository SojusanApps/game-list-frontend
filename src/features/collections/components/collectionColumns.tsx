import { Group, Text } from "@mantine/core";
import { IconHeartFilled } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { Collection, ModeEnum, TypeEnum, VisibilityEnum } from "@/client";
import { type PaginatedTableFeatures } from "@/components/ui/PaginatedTable";
import { CoverThumb } from "@/features/games/components/CoverThumb";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";
import { formatDisplayDate } from "@/utils/dateUtils";

import {
  COLLECTION_BADGE_STYLE,
  getModeBadgeStyle,
  getTypeBadgeStyle,
  getVisibilityBadgeStyle,
} from "../utils/collectionBadgeStyles";

const COVER_WIDTH = 72;
const COVER_HEIGHT = 96;
const EMPTY = "—";

const TYPE_KEY: Record<TypeEnum, "type.normal" | "type.ranking" | "type.tierList"> = {
  [TypeEnum.NOR]: "type.normal",
  [TypeEnum.RNK]: "type.ranking",
  [TypeEnum.TIE]: "type.tierList",
};

const VISIBILITY_KEY: Record<VisibilityEnum, "visibility.public" | "visibility.friends" | "visibility.private"> = {
  [VisibilityEnum.PUB]: "visibility.public",
  [VisibilityEnum.FRI]: "visibility.friends",
  [VisibilityEnum.PRI]: "visibility.private",
};

const MODE_KEY: Record<ModeEnum, "mode.solo" | "mode.collaborative"> = {
  [ModeEnum.S]: "mode.solo",
  [ModeEnum.C]: "mode.collaborative",
};

function BadgePill({ label, style }: Readonly<{ label: string; style: React.CSSProperties }>): React.JSX.Element {
  return (
    <Text span style={{ ...COLLECTION_BADGE_STYLE, ...style, whiteSpace: "nowrap" }}>
      {label}
    </Text>
  );
}

const columnHelper = createColumnHelper<PaginatedTableFeatures, Collection>();

export function createCollectionColumns(
  t: TFunction<"collections">,
): ColumnDef<PaginatedTableFeatures, Collection, any>[] {
  return [
    columnHelper.display({
      id: "cover",
      header: "",
      cell: ({ row }) => (
        <CoverThumb
          src={
            getIGDBImageURL(row.original.items_cover_image_ids?.[0] ?? "", IGDBImageSize.COVER_SMALL_90_128) ||
            undefined
          }
          alt={row.original.name}
          width={COVER_WIDTH}
          height={COVER_HEIGHT}
        />
      ),
    }),
    columnHelper.accessor("name", {
      id: "name",
      header: t("list.table.name"),
      cell: info => (
        <Group gap={6} wrap="nowrap">
          <Link
            to="/collection/$id/$slug"
            params={{ id: String(info.row.original.id), slug: info.row.original.slug ?? "" }}
            style={{ fontWeight: 600, color: "var(--mantine-color-primary-6)" }}
          >
            {info.getValue()}
          </Link>
          {info.row.original.is_favorite && (
            <IconHeartFilled size={14} style={{ color: "var(--mantine-color-red-6)", flexShrink: 0 }} />
          )}
        </Group>
      ),
    }),
    columnHelper.accessor("items_count", {
      id: "games",
      header: t("list.table.games"),
      cell: info => <Text fz="sm">{info.getValue()}</Text>,
    }),
    columnHelper.accessor("type", {
      id: "type",
      header: t("list.table.type"),
      cell: info => {
        const type = info.getValue() as TypeEnum | undefined;
        const label = type ? t(TYPE_KEY[type]) : info.row.original.type_display || EMPTY;
        return <BadgePill label={label} style={getTypeBadgeStyle(type)} />;
      },
    }),
    columnHelper.accessor("visibility", {
      id: "visibility",
      header: t("list.table.visibility"),
      cell: info => {
        const visibility = info.getValue() as VisibilityEnum | undefined;
        const label = visibility ? t(VISIBILITY_KEY[visibility]) : info.row.original.visibility_display || EMPTY;
        return <BadgePill label={label} style={getVisibilityBadgeStyle(visibility)} />;
      },
    }),
    columnHelper.accessor("mode", {
      id: "mode",
      header: t("list.table.mode"),
      cell: info => {
        const mode = info.getValue() as ModeEnum | undefined;
        const label = mode ? t(MODE_KEY[mode]) : info.row.original.mode_display || EMPTY;
        return <BadgePill label={label} style={getModeBadgeStyle(mode)} />;
      },
    }),
    columnHelper.accessor("last_modified_at", {
      id: "updated",
      header: t("list.table.updated"),
      cell: info => <Text fz="sm">{formatDisplayDate(info.getValue()) ?? EMPTY}</Text>,
    }),
  ];
}
