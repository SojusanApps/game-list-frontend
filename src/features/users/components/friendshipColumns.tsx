import { Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { Friendship } from "@/client";
import { type PaginatedTableFeatures } from "@/components/ui/PaginatedTable";
import { CoverThumb } from "@/features/games/components/CoverThumb";
import { formatDisplayDate, formatDisplayDateTime } from "@/utils/dateUtils";

const AVATAR_SIZE = 72;
const EMPTY = "—";

const columnHelper = createColumnHelper<PaginatedTableFeatures, Friendship>();

export function createFriendshipColumns(t: TFunction<"users">): ColumnDef<PaginatedTableFeatures, Friendship, any>[] {
  return [
    columnHelper.display({
      id: "avatar",
      header: "",
      cell: ({ row }) => (
        <CoverThumb
          src={row.original.friend.gravatar_url}
          alt={row.original.friend.username}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          radius={9999}
        />
      ),
    }),
    columnHelper.accessor(row => row.friend.username, {
      id: "username",
      header: t("friends.table.username"),
      cell: info => (
        <Link
          to="/profile/$id/$slug"
          params={{ id: String(info.row.original.friend.id), slug: info.row.original.friend.slug }}
          style={{ fontWeight: 600, color: "var(--mantine-color-primary-6)" }}
        >
          {info.getValue()}
        </Link>
      ),
    }),
    columnHelper.accessor(row => row.friend.last_active, {
      id: "lastActive",
      header: t("friends.table.lastActive"),
      cell: info => <Text fz="sm">{formatDisplayDateTime(info.getValue()) ?? EMPTY}</Text>,
    }),
    columnHelper.accessor("created_at", {
      id: "since",
      header: t("friends.table.since"),
      cell: info => <Text fz="sm">{formatDisplayDate(info.getValue()) ?? EMPTY}</Text>,
    }),
  ];
}
