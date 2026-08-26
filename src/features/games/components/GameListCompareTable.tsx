import { ScrollArea, Table, Text } from "@mantine/core";
import { flexRender, useTable } from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { UserDetail } from "@/client";
import { CollapsibleSection } from "@/components/ui/CollapsibleSection";

import { CompareSection } from "../utils/gameListCompare";

import { createGameListCompareColumns, gameListCompareTableFeatures } from "./GameListCompareTable.columns";
import styles from "./GameListCompareTable.module.css";

interface GameListCompareTableProps {
  section: CompareSection;
  firstUserDetails: UserDetail;
  secondUserDetails: UserDetail;
}

const ROW_HEIGHT_ESTIMATE = 88;
const VIRTUALIZER_OVERSCAN = 5;
const MAX_CONTAINER_HEIGHT = 480;

// Keyed by column id (see GameListCompareTable.columns.tsx) — sums to 100%.
const COLUMN_WIDTHS: Record<string, string> = {
  game: "36%",
  firstUserStatus: "18%",
  firstUserScore: "14%",
  secondUserStatus: "18%",
  secondUserScore: "14%",
};

export function GameListCompareTable({
  section,
  firstUserDetails,
  secondUserDetails,
}: Readonly<GameListCompareTableProps>) {
  const { t } = useTranslation("games");
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  let headingUsername = "";
  if (section.key === "firstUserUnique") {
    headingUsername = firstUserDetails.username;
  } else if (section.key === "secondUserUnique") {
    headingUsername = secondUserDetails.username;
  }

  const heading = t(section.headingKey as any, { username: headingUsername });

  const columns = React.useMemo(
    () => createGameListCompareColumns({ t, firstUserDetails, secondUserDetails }),
    [t, firstUserDetails, secondUserDetails],
  );

  const table = useTable({
    features: gameListCompareTableFeatures,
    data: section.rows,
    columns,
    getRowId: row => row.game_id.toString(),
  });

  const { rows } = table.getRowModel();

  const rowVirtualizer = useVirtualizer({
    count: rows.length,
    getScrollElement: () => scrollContainerRef.current,
    estimateSize: () => ROW_HEIGHT_ESTIMATE,
    overscan: VIRTUALIZER_OVERSCAN,
  });

  const sorting = table.state.sorting;
  React.useEffect(() => {
    rowVirtualizer.scrollToOffset(0);
  }, [sorting, rowVirtualizer]);

  React.useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) {
      return;
    }
    // Mantine's Accordion collapses this section via `display: none` on an ancestor, without
    // unmounting it. Our container's height is a fixed constant (MAX_CONTAINER_HEIGHT), so it
    // reports the exact same size before hiding and after revealing — ResizeObserver has
    // nothing "changed" to report, so tanstack-virtual never re-measures and stays frozen on
    // whatever it last computed (often 0 rows, captured mid-collapse-animation). Watch the
    // Accordion panel ancestor's `style` mutation directly (that's what actually toggles
    // visibility) and force a remeasure when it happens.
    const target = container.closest('[role="region"]') ?? container.parentElement ?? container;
    const observer = new MutationObserver(() => rowVirtualizer.measure());
    observer.observe(target, {
      attributes: true,
      attributeFilter: ["style"],
      subtree: true,
    });
    return () => observer.disconnect();
  }, [rowVirtualizer]);

  const virtualRows = rowVirtualizer.getVirtualItems();
  const lastVirtualRow = virtualRows.at(-1);
  const totalSize = rowVirtualizer.getTotalSize();
  const paddingTop = virtualRows.length > 0 ? virtualRows[0].start : 0;
  const paddingBottom = lastVirtualRow ? totalSize - lastVirtualRow.end : 0;
  const columnCount = table.getAllLeafColumns().length;

  return (
    <CollapsibleSection title={heading} count={section.count} defaultOpen>
      {section.rows.length === 0 ? (
        <Text c="var(--color-text-500)" fs="italic">
          {t("compare.emptySection")}
        </Text>
      ) : (
        <ScrollArea viewportRef={scrollContainerRef} style={{ height: MAX_CONTAINER_HEIGHT }}>
          <Table highlightOnHover className={styles.compareTable}>
            <colgroup>
              {table.getAllLeafColumns().map(column => (
                <col key={column.id} style={{ width: COLUMN_WIDTHS[column.id] }} />
              ))}
            </colgroup>
            <Table.Thead>
              {table.getHeaderGroups().map(headerGroup => (
                <Table.Tr key={headerGroup.id}>
                  {headerGroup.headers.map(header => (
                    <Table.Th key={header.id} className={styles.stickyHeaderCell}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </Table.Th>
                  ))}
                </Table.Tr>
              ))}
            </Table.Thead>
            <Table.Tbody>
              {paddingTop > 0 && (
                <tr>
                  {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- virtualization spacer, row is aria-hidden */}
                  <td colSpan={columnCount} style={{ height: paddingTop, padding: 0, border: "none" }} />
                </tr>
              )}
              {virtualRows.map(virtualRow => {
                const row = rows[virtualRow.index];
                return (
                  <Table.Tr key={row.id} ref={rowVirtualizer.measureElement} data-index={virtualRow.index}>
                    {row.getAllCells().map(cell => (
                      <Table.Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Table.Td>
                    ))}
                  </Table.Tr>
                );
              })}
              {paddingBottom > 0 && (
                <tr>
                  {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- virtualization spacer, row is aria-hidden */}
                  <td colSpan={columnCount} style={{ height: paddingBottom, padding: 0, border: "none" }} />
                </tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      )}
    </CollapsibleSection>
  );
}
