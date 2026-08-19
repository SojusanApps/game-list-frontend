import { Box, Group, Loader, ScrollArea, Stack, Text, Title } from "@mantine/core";
import { IconCircleCheck, IconSearchOff } from "@tabler/icons-react";
import { useVirtualizer } from "@tanstack/react-virtual";
import React, { useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";

interface VirtualListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => React.ReactNode;
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  fetchNextPage?: () => void;
  className?: string;
  style?: React.CSSProperties;
  itemHeight?: number;
  overscan?: number;
  getItemKey?: (item: T, index: number) => React.Key;
}

/**
 * A virtualized list component for high-performance rendering of large vertical lists.
 * Handles infinite loading automatically.
 */
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

export const VirtualList = React.forwardRef(function VirtualListComponent<T>(
  {
    items,
    renderItem,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    className,
    style,
    itemHeight = 120,
    overscan = 5,
    getItemKey,
  }: VirtualListProps<T>,
  forwardedRef: React.ForwardedRef<HTMLDivElement>,
) {
  const internalRef = useRef<HTMLDivElement>(null);
  const parentRef = (forwardedRef as React.RefObject<HTMLDivElement>) || internalRef;
  const { t } = useTranslation("common");

  const itemCount = items.length > 0 ? items.length + 1 : 0;

  const virtualizer = useVirtualizer({
    count: itemCount,
    getScrollElement: () => parentRef.current,
    estimateSize: () => itemHeight,
    overscan,
  });

  const virtualItems = virtualizer.getVirtualItems();

  useEffect(() => {
    if (virtualItems.length === 0 || !hasNextPage || isFetchingNextPage || !fetchNextPage) {
      return;
    }

    const lastVirtualItem = virtualItems.at(-1);
    if (lastVirtualItem && lastVirtualItem.index >= itemCount - 2) {
      fetchNextPage();
    }
  }, [virtualItems, hasNextPage, isFetchingNextPage, fetchNextPage, itemCount]);

  return (
    <ScrollArea
      viewportRef={parentRef}
      className={className}
      style={{ height: "100%", ...style }}
      viewportProps={{ style: { contain: "strict" } }}
    >
      <Box
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          width: "100%",
          position: "relative",
        }}
      >
        {virtualItems.map(virtualItem => {
          const isLoaderRow = virtualItem.index >= items.length;
          const item = isLoaderRow ? null : items[virtualItem.index];

          let itemKey: React.Key;
          if (isLoaderRow) {
            itemKey = `loader-${virtualItem.key}`;
          } else if (getItemKey && item) {
            itemKey = getItemKey(item, virtualItem.index);
          } else {
            itemKey = virtualItem.key;
          }

          return (
            <Box
              key={itemKey}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              {isLoaderRow ? (
                <Group justify="center" align="center" style={{ height: "100%", paddingBlock: "16px" }}>
                  {renderTrailingContent(isFetchingNextPage, hasNextPage, t("endOfResults"))}
                </Group>
              ) : (
                item && renderItem(item, virtualItem.index)
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
              background: "var(--mantine-color-primary-0)",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconSearchOff style={{ width: 40, height: 40, color: "var(--mantine-color-primary-5)" }} />
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
}) as <T>(props: VirtualListProps<T> & { ref?: React.ForwardedRef<HTMLDivElement> }) => React.ReactElement;
