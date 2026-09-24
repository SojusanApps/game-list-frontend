import { Box, Group, Loader, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { useElementSize, useMergedRef, useViewportSize } from "@mantine/hooks";
import { IconCircleCheck, IconSearchOff } from "@tabler/icons-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

import { computeCardRowHeight } from "@/utils/gridLayout";

interface VirtualGridListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  className?: string;
  style?: React.CSSProperties;
  columnCount?: number;
  /** Fixed row height for cards that are not 264/374 posters. Omit to size rows from the real card height. */
  rowHeight?: number;
  gap?: number;
}

const BREAKPOINTS = [
  { minWidth: 1408, maxCols8: 8, maxCols7: 7, maxCols5: 5, maxCols4: 4 },
  { minWidth: 1200, maxCols8: 6, maxCols7: 5, maxCols5: 5, maxCols4: 4 },
  { minWidth: 992, maxCols8: 4, maxCols7: 4, maxCols5: 4, maxCols4: 3 },
  { minWidth: 768, maxCols8: 3, maxCols7: 3, maxCols5: 3, maxCols4: 2 },
  { minWidth: 0, maxCols8: 2, maxCols7: 2, maxCols5: 2, maxCols4: 1 },
];

function renderTrailingContent(
  isFetchingNextPage: boolean | undefined,
  hasNextPage: boolean | undefined,
  endOfResultsText: string,
): React.ReactNode {
  if (isFetchingNextPage) {
    return <Loader size="md" />;
  }
  if (!hasNextPage) {
    return (
      <Group gap={8}>
        <IconCircleCheck size={18} style={{ color: "var(--mantine-color-primary-5)" }} />
        <Text size="sm" c="var(--color-text-500)">
          {endOfResultsText}
        </Text>
      </Group>
    );
  }
  return <Box style={{ height: "16px" }} />;
}

/**
 * A virtualized grid list component for high-performance rendering of large datasets.
 * Encapsulates TanStack Virtual logic and handles infinite loading.
 *
 * Without `style.height` the grid fills its parent, which must be a flex column with a height
 * (see `GRID_BOX_STYLE`). Pass `style.height` when there is no such parent, e.g. in a modal or tab.
 */
export const VirtualGridList = React.forwardRef(function VirtualGridListComponent<T>(
  {
    items,
    renderItem,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    className,
    style,
    columnCount: propColumnCount,
    rowHeight: propRowHeight,
    gap = 6,
  }: VirtualGridListProps<T>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const internalRef = useRef<HTMLDivElement>(null);
  const parentRef = (forwardedRef as React.RefObject<HTMLDivElement>) || internalRef;
  const { ref: sizeRef, width: gridWidth } = useElementSize();
  const viewportRef = useMergedRef(parentRef, sizeRef);
  const { width: viewportWidth } = useViewportSize();
  const { t } = useTranslation("common");

  const getCols = () => {
    const defaultCols = propColumnCount ?? 7;
    const breakpoint = BREAKPOINTS.find(bp => viewportWidth >= bp.minWidth);

    if (!breakpoint || viewportWidth === 0) return defaultCols;

    switch (defaultCols) {
      case 8: {
        return breakpoint.maxCols8;
      }
      case 7: {
        return breakpoint.maxCols7;
      }
      case 5: {
        return breakpoint.maxCols5;
      }
      case 4: {
        return breakpoint.maxCols4;
      }
      default: {
        return defaultCols;
      }
    }
  };
  const columnCount = getCols();

  // px, so the row height can be computed from the same value the CSS grid uses
  const columnGap = gap * 4;

  const getRowHeight = () => {
    if (propRowHeight) {
      if (viewportWidth === 0) return propRowHeight;

      // Assume max width container of roughly 1280px minus padding
      const containerWidth = Math.min(viewportWidth, 1280) - 32;
      const itemWidth = containerWidth / columnCount;
      const desktopCols = propColumnCount ?? 7;
      // 1248 is a typical 1280 max-width wrapper minus 32px padding
      const expectedDesktopWidth = 1248 / desktopCols;
      // Deduced ratio using rowHeight and expected desktop width
      const ratio = propRowHeight / expectedDesktopWidth;
      return itemWidth * ratio;
    }

    // Poster cards: the real card height plus one gap, from the measured grid width.
    // Falls back to a rough height until the grid has been measured.
    return computeCardRowHeight({ gridWidth, columnCount, columnGap }) || 300;
  };
  const rowHeight = getRowHeight();

  const rowCount = items.length > 0 ? Math.ceil(items.length / columnCount) + 1 : 0;

  // oxlint-disable-next-line react/incompatible-library -- only matters under React Compiler, which this app does not use.
  const rowVirtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => rowHeight,
    overscan: 3,
  });

  // Row sizes are cached by the virtualizer, so drop them when the row height changes (resize).
  useEffect(() => {
    rowVirtualizer.measure();
  }, [rowVirtualizer, rowHeight]);

  const virtualRows = rowVirtualizer.getVirtualItems();

  useEffect(() => {
    if (virtualRows.length === 0 || !hasNextPage || isFetchingNextPage || !fetchNextPage) return;

    const lastVirtualRow = virtualRows.at(-1);
    if (lastVirtualRow && lastVirtualRow.index >= rowCount - 2) {
      fetchNextPage();
    }
  }, [virtualRows, hasNextPage, isFetchingNextPage, fetchNextPage, rowCount]);

  // The padding leaves room for the hover zoom of the cards; the negative margin cancels it out.
  // When filling the parent, the margin reaches the parent's own padding so no space is left unused.
  const fillsParent = style?.height === undefined;

  return (
    <ScrollArea
      viewportRef={viewportRef}
      className={className}
      style={{
        ...(fillsParent ? { flex: "1 1 0", minHeight: 0, margin: "-24px" } : { margin: "-32px -24px" }),
        padding: "32px",
        ...style,
      }}
      viewportProps={{ style: { contain: "strict" } }}
    >
      <Box
        style={{
          height: `${rowVirtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualRows.map(virtualRow => {
          const isLoaderRow = virtualRow.index >= Math.ceil(items.length / columnCount);

          return (
            <Box
              key={virtualRow.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              {isLoaderRow ? (
                <Group justify="center" align="center" style={{ height: "100%", paddingBlock: "16px" }}>
                  {renderTrailingContent(isFetchingNextPage, hasNextPage, t("endOfResults"))}
                </Group>
              ) : (
                <Box
                  style={{
                    display: "grid",
                    gridTemplateColumns: `repeat(${columnCount}, minmax(0, 1fr))`,
                    gap: `${columnGap}px`,
                    paddingBlock: propRowHeight ? "8px" : `${columnGap / 2}px`,
                  }}
                >
                  {items
                    .slice(virtualRow.index * columnCount, (virtualRow.index + 1) * columnCount)
                    .map((item, index) => {
                      const absoluteIndex = virtualRow.index * columnCount + index;
                      return <Box key={`v-grid-item-${absoluteIndex}`}>{renderItem(item, absoluteIndex)}</Box>;
                    })}
                </Box>
              )}
            </Box>
          );
        })}
      </Box>
      {items.length === 0 && !isFetchingNextPage && (
        <Stack align="center" justify="center" gap={24} style={{ paddingBlock: "80px", textAlign: "center" }}>
          <Box
            style={{
              width: "80px",
              height: "80px",
              background: "var(--color-primary-tint-bg)",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconSearchOff style={{ width: 40, height: 40, color: "var(--color-primary-tint-text)" }} />
          </Box>
          <Stack gap={8}>
            <Title order={3} fz={24} fw={700} c="var(--color-text-900)">
              {t("noResults")}
            </Title>
            <Text c="var(--color-text-500)" maw={384} mx="auto">
              {t("noResultsDescription")}
            </Text>
          </Stack>
        </Stack>
      )}
    </ScrollArea>
  );
}) as <T>(props: VirtualGridListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }) => React.ReactElement;
