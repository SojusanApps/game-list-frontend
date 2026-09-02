import { Box, Center, Group, Loader, NumberInput, Pagination, ScrollArea, Skeleton, Table, Text } from "@mantine/core";
import { type ColumnDef, flexRender, tableFeatures, useTable } from "@tanstack/react-table";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "./Button";

export const paginatedTableFeatures = tableFeatures({});
export type PaginatedTableFeatures = typeof paginatedTableFeatures;

/**
 * Backend page size for the list endpoints this table paginates. DRF's
 * `DEFAULT_PAGINATION` `PAGE_SIZE` in `game_list/settings/base.py` — there is no
 * `page_size` query param, so this must stay in sync by hand. See
 * `docs/adr/0007-offset-pagination-for-search-results.md`.
 */
export const LIST_PAGE_SIZE = 25;

const SKELETON_ROWS = 10;
// Mantine's <Pagination> starts collapsing numbered buttons into an ellipsis
// past this many pages — that's when a "go to page" input earns its place.
const GO_TO_PAGE_THRESHOLD = 7;

/**
 * Total page count from a paginated response. Prefers exact math (`count` /
 * `pageSize`); falls back to the `next` / `previous` flags when the total is
 * unknown (some list endpoints are consumed without a page size).
 */
export function derivePageCount({
  count,
  pageSize,
  page,
  hasNext,
  hasPrevious,
}: {
  count?: number | null;
  pageSize?: number;
  page: number;
  hasNext?: boolean;
  hasPrevious?: boolean;
}): number {
  if (count != null && pageSize) {
    return Math.max(1, Math.ceil(count / pageSize));
  }
  if (hasNext) {
    return page + 1;
  }
  if (hasPrevious) {
    return page;
  }
  return 1;
}

interface GoToPageProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

function GoToPage({ page, totalPages, onPageChange }: Readonly<GoToPageProps>): React.JSX.Element {
  const { t } = useTranslation("common");
  const [value, setValue] = React.useState<string | number>(page);

  React.useEffect(() => {
    setValue(page);
  }, [page]);

  const commit = () => {
    const parsed = typeof value === "number" ? value : Math.trunc(Number(value));
    if (Number.isNaN(parsed)) {
      setValue(page);
      return;
    }
    const clamped = Math.min(Math.max(1, parsed), totalPages);
    setValue(clamped);
    if (clamped !== page) {
      onPageChange(clamped);
    }
  };

  return (
    <Group gap={6} wrap="nowrap">
      <Text fz="sm" c="dimmed">
        {t("pagination.goToPage")}
      </Text>
      <NumberInput
        size="xs"
        w={72}
        min={1}
        max={totalPages}
        value={value}
        onChange={setValue}
        onBlur={commit}
        onKeyDown={event => {
          if (event.key === "Enter") {
            event.preventDefault();
            commit();
          }
        }}
        hideControls
        aria-label={t("pagination.goToPage")}
      />
      <Button size="sm" variant="outline" onClick={commit}>
        {t("pagination.go")}
      </Button>
    </Group>
  );
}

interface PaginationControlsProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  disabled?: boolean;
  /** Force the "go to page" input on/off; defaults to showing it past {@link GO_TO_PAGE_THRESHOLD} pages. */
  showGoToPage?: boolean;
}

/**
 * Numbered pager (first / prev / pages / next) plus an optional "go to page N"
 * input. Renders nothing when there is only one page.
 */
export function PaginationControls({
  page,
  totalPages,
  onPageChange,
  disabled = false,
  showGoToPage,
}: Readonly<PaginationControlsProps>): React.JSX.Element | null {
  if (totalPages <= 1) {
    return null;
  }

  const withGoTo = showGoToPage ?? totalPages > GO_TO_PAGE_THRESHOLD;

  return (
    <Group justify="space-between" mt={16} wrap="wrap" gap={12}>
      <Pagination
        total={totalPages}
        value={page}
        onChange={onPageChange}
        siblings={1}
        boundaries={1}
        disabled={disabled}
      />
      {withGoTo && (
        <Center>
          <GoToPage page={page} totalPages={totalPages} onPageChange={onPageChange} />
        </Center>
      )}
    </Group>
  );
}

interface PaginatedTableProps<TData extends Record<string, any>> {
  columns: ColumnDef<PaginatedTableFeatures, TData, any>[];
  data: TData[];
  /** Total row count across all pages (from the paginated response's `count`). */
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  getRowId: (row: TData) => string;
  pageSize?: number;
  /** First load — no data to show yet. Renders skeleton rows. */
  isLoading?: boolean;
  /** Background refetch (e.g. page change) — keeps current data, shows a spinner. */
  isFetching?: boolean;
  onRowClick?: (row: TData) => void;
  rowStyle?: (row: TData) => React.CSSProperties | undefined;
  emptyLabel?: string;
}

/**
 * Presentational page-number-paginated table. Does no data fetching — the caller
 * owns `page`, `data`, `count` and the query. Built on TanStack Table + Mantine
 * `<Table>` / `<Pagination>`, no row virtualization (bounded page size).
 *
 * For an in-memory array with no server pagination, use {@link ClientPaginatedTable}.
 */
export function PaginatedTable<TData extends Record<string, any>>({
  columns,
  data,
  count,
  page,
  onPageChange,
  getRowId,
  pageSize = LIST_PAGE_SIZE,
  isLoading = false,
  isFetching = false,
  onRowClick,
  rowStyle,
  emptyLabel,
}: Readonly<PaginatedTableProps<TData>>): React.JSX.Element {
  const { t } = useTranslation("common");

  const table = useTable({
    features: paginatedTableFeatures,
    data,
    columns,
    getRowId,
  });

  const columnCount = table.getAllLeafColumns().length;
  const totalPages = Math.max(1, Math.ceil(count / pageSize));

  const renderBody = () => {
    if (isLoading) {
      return Array.from({ length: SKELETON_ROWS }).map((_, rowIndex) => {
        const rowKey = `skeleton-row-${rowIndex}`;
        return (
          <Table.Tr key={rowKey}>
            {Array.from({ length: columnCount }).map((__, cellIndex) => {
              const cellKey = `${rowKey}-cell-${cellIndex}`;
              return (
                <Table.Td key={cellKey}>
                  <Skeleton height={20} />
                </Table.Td>
              );
            })}
          </Table.Tr>
        );
      });
    }

    if (data.length === 0) {
      return (
        <Table.Tr>
          <Table.Td
            colSpan={columnCount}
            style={{ textAlign: "center", paddingBlock: 32, color: "var(--color-text-400)" }}
          >
            {emptyLabel ?? t("noResults")}
          </Table.Td>
        </Table.Tr>
      );
    }

    return table.getRowModel().rows.map(row => (
      <Table.Tr
        key={row.id}
        onClick={
          onRowClick
            ? event => {
                if (!(event.target as HTMLElement).closest("a,button")) {
                  onRowClick(row.original);
                }
              }
            : undefined
        }
        style={{ ...(onRowClick ? { cursor: "pointer" } : undefined), ...rowStyle?.(row.original) }}
      >
        {row.getAllCells().map(cell => (
          <Table.Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Table.Td>
        ))}
      </Table.Tr>
    ));
  };

  return (
    <Box pos="relative">
      {isFetching && !isLoading && <Loader size="sm" style={{ position: "absolute", top: 8, right: 8, zIndex: 2 }} />}

      <ScrollArea scrollbars="x" style={{ background: "var(--color-background-100)", borderRadius: 8 }}>
        <Table highlightOnHover>
          <Table.Thead>
            {table.getHeaderGroups().map(headerGroup => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <Table.Th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>{renderBody()}</Table.Tbody>
        </Table>
      </ScrollArea>

      <PaginationControls page={page} totalPages={totalPages} onPageChange={onPageChange} disabled={isFetching} />
    </Box>
  );
}

type ClientPaginatedTableProps<TData extends Record<string, any>> = Omit<
  PaginatedTableProps<TData>,
  "data" | "count" | "page" | "onPageChange" | "isFetching"
> & {
  /** The full, already-loaded dataset. Paginated in the browser. */
  rows: TData[];
};

/**
 * {@link PaginatedTable} for an in-memory array (an endpoint with no server-side
 * pagination). Holds its own page state and slices `rows` per page; resets to
 * page 1 whenever the row count changes.
 */
export function ClientPaginatedTable<TData extends Record<string, any>>({
  rows,
  pageSize = LIST_PAGE_SIZE,
  ...rest
}: Readonly<ClientPaginatedTableProps<TData>>): React.JSX.Element {
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [rows.length]);

  const pageCount = Math.max(1, Math.ceil(rows.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const start = (safePage - 1) * pageSize;
  const pageRows = rows.slice(start, start + pageSize);

  return (
    <PaginatedTable
      {...rest}
      data={pageRows}
      count={rows.length}
      page={safePage}
      onPageChange={setPage}
      pageSize={pageSize}
    />
  );
}
