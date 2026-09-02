import { Badge, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { Company, GameSimpleList, User } from "@/client";
import { type PaginatedTableFeatures } from "@/components/ui/PaginatedTable";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";
import { formatDisplayDate, formatDisplayDateTime } from "@/utils/dateUtils";

import { CoverThumb } from "./CoverThumb";
import { ScoreBadge } from "./ScoreBadge";

const AVATAR_SIZE = 96;
const LOGO_WIDTH = 150;
const LOGO_HEIGHT = 84;
const COVER_WIDTH = 96;
const COVER_HEIGHT = 128;
const EMPTY = "—";

const linkStyle: React.CSSProperties = { fontWeight: 600, color: "var(--mantine-color-primary-6)" };

const gameColumnHelper = createColumnHelper<PaginatedTableFeatures, GameSimpleList>();

export function createGameColumns(t: TFunction<"games">): ColumnDef<PaginatedTableFeatures, GameSimpleList, any>[] {
  return [
    gameColumnHelper.display({
      id: "cover",
      header: "",
      cell: ({ row }) => (
        <CoverThumb
          src={
            row.original.cover_image_id
              ? getIGDBImageURL(row.original.cover_image_id, IGDBImageSize.COVER_BIG_264_374)
              : undefined
          }
          alt={row.original.title}
          width={COVER_WIDTH}
          height={COVER_HEIGHT}
        />
      ),
    }),
    gameColumnHelper.accessor("title", {
      id: "title",
      header: t("search.table.title"),
      cell: info => (
        <Link
          to="/game/$id/$slug"
          params={{ id: String(info.row.original.id), slug: info.row.original.slug ?? "" }}
          style={linkStyle}
        >
          {info.getValue()}
        </Link>
      ),
    }),
    gameColumnHelper.accessor("release_date", {
      id: "releaseDate",
      header: t("search.table.releaseDate"),
      cell: info => <Text fz="sm">{formatDisplayDate(info.getValue()) ?? EMPTY}</Text>,
    }),
    gameColumnHelper.accessor("game_type", {
      id: "type",
      header: t("search.table.type"),
      cell: info => <Text fz="sm">{info.getValue() || EMPTY}</Text>,
    }),
    gameColumnHelper.accessor("game_status", {
      id: "status",
      header: t("search.table.status"),
      cell: info =>
        info.getValue() ? (
          <Badge size="sm" variant="light">
            {info.getValue()}
          </Badge>
        ) : (
          <Text fz="sm">{EMPTY}</Text>
        ),
    }),
    gameColumnHelper.accessor("average_score", {
      id: "score",
      header: t("search.table.score"),
      cell: info => <ScoreBadge score={info.getValue()} />,
    }),
  ];
}

const companyColumnHelper = createColumnHelper<PaginatedTableFeatures, Company>();

export function createCompanyColumns(t: TFunction<"games">): ColumnDef<PaginatedTableFeatures, Company, any>[] {
  return [
    companyColumnHelper.display({
      id: "logo",
      header: "",
      cell: ({ row }) => (
        <CoverThumb
          src={
            row.original.company_logo_id
              ? getIGDBImageURL(row.original.company_logo_id, IGDBImageSize.LOGO_MED_284_160)
              : undefined
          }
          alt={row.original.name}
          width={LOGO_WIDTH}
          height={LOGO_HEIGHT}
          fit="contain"
          background="#fff"
        />
      ),
    }),
    companyColumnHelper.accessor("name", {
      id: "name",
      header: t("search.table.name"),
      cell: info => (
        <Link
          to="/company/$id/$slug"
          params={{ id: String(info.row.original.id), slug: info.row.original.slug ?? "" }}
          style={linkStyle}
        >
          {info.getValue()}
        </Link>
      ),
    }),
  ];
}

const userColumnHelper = createColumnHelper<PaginatedTableFeatures, User>();

export function createUserColumns(t: TFunction<"games">): ColumnDef<PaginatedTableFeatures, User, any>[] {
  return [
    userColumnHelper.display({
      id: "avatar",
      header: "",
      cell: ({ row }) => (
        <CoverThumb
          src={row.original.gravatar_url}
          alt={row.original.username}
          width={AVATAR_SIZE}
          height={AVATAR_SIZE}
          radius={9999}
        />
      ),
    }),
    userColumnHelper.accessor("username", {
      id: "username",
      header: t("search.table.username"),
      cell: info => (
        <Link
          to="/profile/$id/$slug"
          params={{ id: String(info.row.original.id), slug: info.row.original.slug }}
          style={linkStyle}
        >
          {info.getValue()}
        </Link>
      ),
    }),
    userColumnHelper.accessor("date_joined", {
      id: "joined",
      header: t("search.table.joined"),
      cell: info => <Text fz="sm">{formatDisplayDate(info.getValue()) ?? EMPTY}</Text>,
    }),
    userColumnHelper.accessor("last_active", {
      id: "lastActive",
      header: t("search.table.lastActive"),
      cell: info => <Text fz="sm">{formatDisplayDateTime(info.getValue()) ?? EMPTY}</Text>,
    }),
    userColumnHelper.accessor("is_active", {
      id: "accountStatus",
      header: t("search.table.accountStatus"),
      cell: info => (
        <Badge size="sm" variant="light" color={info.getValue() === false ? "gray" : "green"}>
          {info.getValue() === false ? t("search.table.inactive") : t("search.table.active")}
        </Badge>
      ),
    }),
  ];
}
