import { Link } from "@tanstack/react-router";
import { type ColumnDef, createColumnHelper } from "@tanstack/react-table";

import { CompanyGame } from "@/client";
import { type PaginatedTableFeatures } from "@/components/ui/PaginatedTable";
import { CoverThumb } from "@/features/games/components/CoverThumb";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";

const COVER_WIDTH = 72;
const COVER_HEIGHT = 96;

const columnHelper = createColumnHelper<PaginatedTableFeatures, CompanyGame>();

/**
 * Columns for a client-paginated table of {@link CompanyGame} rows (company
 * developed/published lists, a game's related titles). Thumbnail + title only —
 * the source objects carry nothing else.
 */
export function createCompanyGameColumns(): ColumnDef<PaginatedTableFeatures, CompanyGame, any>[] {
  return [
    columnHelper.display({
      id: "cover",
      header: "",
      cell: ({ row }) => (
        <CoverThumb
          src={
            row.original.cover_image_id
              ? getIGDBImageURL(row.original.cover_image_id, IGDBImageSize.COVER_SMALL_90_128)
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
      header: "",
      cell: info => (
        <Link
          to="/game/$id/$slug"
          params={{ id: String(info.row.original.id), slug: info.row.original.slug ?? "" }}
          style={{ fontWeight: 600, color: "var(--mantine-color-primary-6)" }}
        >
          {info.getValue()}
        </Link>
      ),
    }),
  ];
}
