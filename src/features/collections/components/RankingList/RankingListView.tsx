import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import { Box, Group, Loader, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { CollectionItem } from "@/client";
import { VirtualList } from "@/components/ui/VirtualList";

import {
  useReorderCollectionItem,
  useUpdateCollectionItem,
  useCollectionItemsInfiniteQuery,
} from "../../hooks/useCollectionQueries";
import EditDescriptionModal from "./EditDescriptionModal";
import { SortableRankingRow } from "./SortableRankingRow";

interface RankingListViewProps {
  collectionId: number;
  isOwner: boolean;
  onRemove?: (itemId: number, gameTitle: string) => void;
}

export const RankingListView = React.memo(function RankingListViewInner({
  collectionId,
  isOwner,
  onRemove,
}: Readonly<RankingListViewProps>) {
  const { t } = useTranslation("collections");
  const virtualListRef = React.useRef<HTMLDivElement>(null);
  const [editingItem, setEditingItem] = React.useState<{ id: number; title: string; description?: string } | null>(
    null,
  );

  const {
    data: itemsResults,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useCollectionItemsInfiniteQuery(collectionId);

  const totalCount = itemsResults?.pages[0]?.count ?? 0;

  // Flatten all pages into a single array
  const allItems = React.useMemo(() => itemsResults?.pages.flatMap(page => page.results) || [], [itemsResults]);

  // Sort by order initially
  const sortedInitialItems = React.useMemo(() => {
    return allItems.toSorted((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));
  }, [allItems]);

  const [items, setItems] = React.useState<CollectionItem[]>(sortedInitialItems);

  const { mutateAsync: reorderItem, isPending: isReordering } = useReorderCollectionItem();
  const { mutateAsync: updateItem } = useUpdateCollectionItem();

  // Track if we're doing an optimistic update to prevent overwriting during mutations
  const isOptimisticUpdateRef = React.useRef(false);

  // Update local state when query data changes (after refetch)
  React.useEffect(() => {
    // Only sync from query data when we're not in the middle of an optimistic update
    if (!isOptimisticUpdateRef.current && sortedInitialItems.length > 0) {
      setItems(sortedInitialItems);
    }
  }, [sortedInitialItems]);

  // Enable auto-scroll for drag and drop
  React.useEffect(() => {
    const element = virtualListRef.current;
    if (!element || !isOwner) {
      return;
    }

    return autoScrollForElements({
      element,
      canScroll: ({ source }) => source.data.type === "ranking-item",
    });
  }, [isOwner]);

  const handleDescriptionSave = React.useCallback(
    async (description: string) => {
      if (!editingItem) {
        return;
      }

      try {
        await updateItem({ id: editingItem.id, body: { description } });
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
    [editingItem, updateItem],
  );

  const handleItemMove = React.useCallback(
    async (draggedId: string, targetIndex: number) => {
      if (!isOwner || isReordering) {
        return;
      }

      const itemId = Math.trunc(Number(draggedId));
      const currentIndex = items.findIndex(i => i.id === itemId);
      if (currentIndex === -1 || currentIndex === targetIndex) {
        return;
      }

      // Save previous state for potential revert
      const previousItems = items;

      // Optimistic update
      isOptimisticUpdateRef.current = true;
      const newItems = [...items];
      const [removed] = newItems.splice(currentIndex, 1);
      newItems.splice(targetIndex, 0, removed);
      setItems(newItems);

      // Call API with new position (0-based)
      const newPosition = targetIndex;

      try {
        await reorderItem({ collectionId, itemId, position: newPosition });
        // Allow query refetch to update the state
        isOptimisticUpdateRef.current = false;
      } catch (error) {
        notifications.show({
          title: t("rankingList.errorTitle"),
          message: t("rankingList.failedToReorder"),
          color: "red",
        });
        // Revert on error
        isOptimisticUpdateRef.current = false;
        setItems(previousItems);
        console.error(error);
      }
    },
    [isOwner, isReordering, items, collectionId, reorderItem, t],
  );

  const handleMoveUp = React.useCallback(
    async (id: number) => {
      if (!isOwner || isReordering) {
        return;
      }

      const currentIndex = items.findIndex(i => i.id === id);
      if (currentIndex <= 0) {
        return;
      }

      // Save previous state for potential revert
      const previousItems = items;

      // Optimistic update
      isOptimisticUpdateRef.current = true;
      const newItems = [...items];
      const [removed] = newItems.splice(currentIndex, 1);
      newItems.splice(currentIndex - 1, 0, removed);
      setItems(newItems);

      // Call API with new position (0-based)
      const newPosition = currentIndex - 1; // Moving up decreases position by 1

      try {
        await reorderItem({ collectionId, itemId: id, position: newPosition });
        // Allow query refetch to update the state
        isOptimisticUpdateRef.current = false;
      } catch (error) {
        notifications.show({
          title: t("rankingList.errorTitle"),
          message: t("rankingList.failedToMoveUp"),
          color: "red",
        });
        // Revert on error
        isOptimisticUpdateRef.current = false;
        setItems(previousItems);
        console.error(error);
      }
    },
    [isOwner, isReordering, items, collectionId, reorderItem, t],
  );

  const handleMoveDown = React.useCallback(
    async (id: number) => {
      if (!isOwner || isReordering) {
        return;
      }

      const currentIndex = items.findIndex(i => i.id === id);
      if (currentIndex === -1 || currentIndex >= items.length - 1) {
        return;
      }

      // Save previous state for potential revert
      const previousItems = items;

      // Optimistic update
      isOptimisticUpdateRef.current = true;
      const newItems = [...items];
      const [removed] = newItems.splice(currentIndex, 1);
      newItems.splice(currentIndex + 1, 0, removed);
      setItems(newItems);

      // Call API with new position (0-based)
      const newPosition = currentIndex + 1; // Moving down increases position by 1

      try {
        await reorderItem({ collectionId, itemId: id, position: newPosition });
        // Allow query refetch to update the state
        isOptimisticUpdateRef.current = false;
      } catch (error) {
        notifications.show({
          title: t("rankingList.errorTitle"),
          message: t("rankingList.failedToMoveDown"),
          color: "red",
        });
        // Revert on error
        isOptimisticUpdateRef.current = false;
        setItems(previousItems);
        console.error(error);
      }
    },
    [isOwner, isReordering, items, collectionId, reorderItem, t],
  );

  // Helper: Fetch additional pages if needed
  const fetchPagesIfNeeded = React.useCallback(
    async (targetPosition: number) => {
      const currentLoadedCount = allItems.length;
      if (targetPosition <= currentLoadedCount || !hasNextPage) {
        return itemsResults;
      }

      const loadingId = "loading-items";
      notifications.show({
        id: loadingId,
        title: t("rankingList.loadingTitle"),
        message: t("rankingList.loadingMessage"),
        loading: true,
        autoClose: false,
        withCloseButton: false,
      });
      try {
        const itemsPerPage = itemsResults?.pages[0]?.results.length || 25;
        const pagesNeeded = Math.ceil(targetPosition / itemsPerPage);
        const currentPages = itemsResults?.pages.length || 0;
        const pagesToFetch = pagesNeeded - currentPages;

        let latestQueryResult = itemsResults;
        for (let i = 0; i < pagesToFetch && hasNextPage; i++) {
          const result = await fetchNextPage();
          if (result.data) {
            latestQueryResult = result.data;
          }
        }

        notifications.update({
          id: loadingId,
          title: t("rankingList.successTitle"),
          message: t("rankingList.itemsLoaded"),
          color: "green",
          loading: false,
          autoClose: 3000,
        });
        return latestQueryResult;
      } catch (error) {
        notifications.update({
          id: loadingId,
          title: t("rankingList.errorTitle"),
          message: t("rankingList.failedToLoad"),
          color: "red",
          loading: false,
          autoClose: 3000,
        });
        throw error;
      }
    },
    [allItems.length, hasNextPage, itemsResults, fetchNextPage, t],
  );

  // Helper: Validate and prepare reorder operation
  const validateReorder = React.useCallback(
    (sortedItems: CollectionItem[], itemId: number, targetPosition: number) => {
      const currentIndex = sortedItems.findIndex(i => i.id === itemId);
      if (currentIndex === -1) {
        notifications.show({
          title: t("rankingList.errorTitle"),
          message: t("rankingList.itemNotFound"),
          color: "red",
        });
        return null;
      }

      const targetIndex = targetPosition - 1; // Convert 1-based to 0-based
      if (targetIndex === currentIndex) {
        return null;
      }

      if (targetIndex >= sortedItems.length) {
        notifications.show({
          title: t("rankingList.errorTitle"),
          message: t("rankingList.cannotMoveToPosition", { position: targetPosition, count: sortedItems.length }),
          color: "red",
        });
        return null;
      }

      return { currentIndex, targetIndex };
    },
    [t],
  );

  // Helper: Execute reorder with optimistic update
  const executeReorder = React.useCallback(
    async (sortedItems: CollectionItem[], itemId: number, currentIndex: number, targetIndex: number) => {
      const previousItems = items;

      try {
        isOptimisticUpdateRef.current = true;
        const newItems = [...sortedItems];
        const [removed] = newItems.splice(currentIndex, 1);
        newItems.splice(targetIndex, 0, removed);
        setItems(newItems);

        await reorderItem({ collectionId, itemId, position: targetIndex });
        isOptimisticUpdateRef.current = false;
      } catch (error) {
        notifications.show({
          title: t("rankingList.errorTitle"),
          message: t("rankingList.failedToReorder"),
          color: "red",
        });
        isOptimisticUpdateRef.current = false;
        setItems(previousItems);
        console.error(error);
      }
    },
    [items, collectionId, reorderItem, t],
  );

  const handlePositionChange = React.useCallback(
    async (id: number, newPosition: number) => {
      if (!isOwner || isReordering) {
        return;
      }

      try {
        const queryResult = await fetchPagesIfNeeded(newPosition);
        const currentAllItems = queryResult?.pages.flatMap(page => page.results) || [];
        const sortedItems = currentAllItems.toSorted((a, b) => Number(a.order ?? 0) - Number(b.order ?? 0));

        const validation = validateReorder(sortedItems, id, newPosition);
        if (!validation) {
          return;
        }

        await executeReorder(sortedItems, id, validation.currentIndex, validation.targetIndex);
      } catch (error) {
        console.error(error);
      }
    },
    [isOwner, isReordering, fetchPagesIfNeeded, validateReorder, executeReorder],
  );

  const renderItem = React.useCallback(
    (item: CollectionItem, index: number) => (
      <SortableRankingRow
        key={item.id}
        id={String(item.id)}
        itemId={item.id}
        addedBy={item.added_by}
        gameId={item.game.id}
        gameSlug={item.game.slug || ""}
        rank={index + 1}
        totalItems={totalCount}
        title={item.game.title}
        coverImageId={item.game.cover_image_id}
        description={item.description}
        onDescriptionClick={
          isOwner
            ? () =>
                setEditingItem({
                  id: item.id,
                  title: item.game.title,
                  description: item.description,
                })
            : undefined
        }
        isOwner={isOwner}
        onRemove={onRemove ? () => onRemove(item.id, item.game.title) : undefined}
        onItemMove={handleItemMove}
        onMoveUp={() => handleMoveUp(item.id)}
        onMoveDown={() => handleMoveDown(item.id)}
        onPositionChange={(newPosition: number) => handlePositionChange(item.id, newPosition)}
      />
    ),
    [totalCount, handleItemMove, handleMoveUp, handleMoveDown, handlePositionChange, isOwner, onRemove],
  );

  if (isLoading) {
    return (
      <Group justify="center" align="center" style={{ height: 256 }}>
        <Loader size="lg" />
      </Group>
    );
  }

  return (
    <Stack gap={24} style={{ height: "calc(100vh - 200px)" }}>
      {/* Collection Stats - Clean minimalist header */}
      <Group
        justify="space-between"
        align="center"
        style={{
          padding: "8px 16px",
          borderBottom: "2px solid var(--color-background-200)",
        }}
      >
        <Box>
          <Text fw={900} fz={28} c="var(--color-text-900)" style={{ letterSpacing: "-0.02em" }}>
            {t("rankingList.title")}
          </Text>
          <Text size="sm" c="var(--color-text-500)">
            {t("rankingList.gamesInList", { count: totalCount })}
          </Text>
        </Box>
      </Group>

      <VirtualList
        ref={virtualListRef}
        items={items}
        renderItem={renderItem}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        itemHeight={110}
        overscan={5}
        getItemKey={item => item.id}
        style={{ flex: 1 }}
      />

      {editingItem && (
        <EditDescriptionModal
          gameTitle={editingItem.title}
          currentDescription={editingItem.description}
          onClose={() => setEditingItem(null)}
          onSave={handleDescriptionSave}
        />
      )}
    </Stack>
  );
});
