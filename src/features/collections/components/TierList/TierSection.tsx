import { autoScrollForElements } from "@atlaskit/pragmatic-drag-and-drop-auto-scroll/element";
import type { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Box, Group, Stack, Text } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { CollectionItem, TierEnum } from "@/client";
import { VirtualGridList } from "@/components/ui/VirtualGridList";

import { useCollectionItemsByTierInfiniteQuery } from "../../hooks/useCollectionQueries";
import { SortableGameCard } from "./SortableGameCard";
import { TierDropZone } from "./TierDropZone";

interface TierSectionProps {
  collectionId: number;
  tier: { id: TierEnum | "UNRANKED"; label: string; color: string };
  isOwner: boolean;
  onRemove?: (itemId: number, gameTitle: string) => void;
  onItemMove: (itemId: string, sourceTierId: string, targetTierId: string) => void;
  onReorder: (
    itemId: string,
    sourceTierId: string,
    targetTierId: string,
    sourceIndex: number,
    targetIndex: number,
    edge: Edge | null,
  ) => void;
  onDescriptionChange: (itemId: number, newDescription: string) => void;
  onCountLoad: (tierId: TierEnum | "UNRANKED", count: number) => void;
}

export const TierSection = React.memo(function TierSectionInner({
  collectionId,
  tier,
  isOwner,
  onRemove,
  onItemMove,
  onReorder,
  onDescriptionChange,
  onCountLoad,
}: Readonly<TierSectionProps>) {
  const { t } = useTranslation("collections");
  const virtualListRef = React.useRef<HTMLDivElement>(null);

  const {
    data,
    isLoading,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useCollectionItemsByTierInfiniteQuery(collectionId, tier.id);

  const items = React.useMemo(() => data?.pages.flatMap(page => page.results) || [], [data]);
  const totalCount = data?.pages[0]?.count ?? 0;

  React.useEffect(() => {
    if (data?.pages[0]?.count !== undefined) {
      onCountLoad(tier.id, data.pages[0].count);
    }
  }, [data?.pages, tier.id, onCountLoad]);

  // Enable auto-scroll for drag and drop within the virtualized panel
  React.useEffect(() => {
    const element = virtualListRef.current;
    if (!element || !isOwner) {
      return;
    }

    return autoScrollForElements({
      element,
      canScroll: ({ source }) => source.data.type === "tier-item",
    });
  }, [isOwner]);

  // Render function for individual game cards
  const renderGameCard = React.useCallback(
    (item: CollectionItem, index: number) => {
      return (
        <SortableGameCard
          key={item.id}
          id={String(item.id)}
          collectionItemId={item.id}
          addedBy={item.added_by}
          gameId={item.game.id}
          gameSlug={item.game.slug || ""}
          tierId={tier.id}
          index={index}
          title={item.game.title}
          coverImageId={item.game.cover_image_id}
          description={item.description}
          isOwner={isOwner}
          onRemove={onRemove ? () => onRemove(item.id, item.game.title) : undefined}
          onReorder={onReorder}
          onDescriptionChange={newDesc => onDescriptionChange(item.id, newDesc)}
          onMoveToTier={targetTierId => onItemMove(String(item.id), tier.id, targetTierId)}
        />
      );
    },
    [tier.id, isOwner, onRemove, onReorder, onDescriptionChange, onItemMove],
  );

  return (
    <Stack gap={16}>
      <Group justify="space-between" align="center" style={{ paddingInline: 16 }}>
        <Group gap={16} style={{ flex: 1 }}>
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 56,
              height: 56,
              borderRadius: 16,
              background: `linear-gradient(135deg, ${tier.color} 0%, rgba(255,255,255,0.2) 100%)`,
              backgroundColor: tier.color, // Fallback
              boxShadow: `0 8px 16px ${tier.color}40, inset 0 2px 4px rgba(255,255,255,0.3)`,
              border: "1px solid rgba(255,255,255,0.4)",
            }}
          >
            <Text component="span" fz="h2" fw={900} c="white" style={{ textShadow: "0 2px 4px rgba(0,0,0,0.2)" }}>
              {tier.label}
            </Text>
          </Box>
          <Group gap={8}>
            <Text fw={800} size="lg" c="var(--color-text-800)">
              {t("tierList.tierName", { label: tier.label })}
            </Text>
            <Box
              style={{
                background: "var(--color-background-200)",
                padding: "2px 8px",
                borderRadius: 12,
                fontSize: 12,
                fontWeight: 600,
                color: "var(--color-text-600)",
              }}
            >
              {t("tierList.itemCount", { count: totalCount })}
            </Box>
          </Group>
          <Box
            style={{ flex: 1, height: 2, background: "var(--color-background-200)", borderRadius: 9999, opacity: 0.5 }}
          />
        </Group>
      </Group>

      <TierDropZone tierId={tier.id} isEmpty={items.length === 0} isOwner={isOwner} onItemMove={onItemMove}>
        {(() => {
          if (isLoading) {
            return (
              <Group justify="center" align="center" style={{ height: 256 }}>
                <Box
                  style={{
                    animation: "spin 1s linear infinite",
                    borderRadius: "9999px",
                    width: 32,
                    height: 32,
                    borderBottom: "2px solid var(--color-primary-600)",
                  }}
                />
              </Group>
            );
          }

          if (items.length === 0) {
            return (
              <Group justify="center" align="center" style={{ height: 128 }} c="var(--color-text-400)" fz="sm">
                {t("tierList.dragHint")}
              </Group>
            );
          }

          return (
            <VirtualGridList
              ref={virtualListRef}
              items={items}
              renderItem={renderGameCard}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              columnCount={7}
              style={{ height: 480, padding: "16px", margin: 0 }}
            />
          );
        })()}
      </TierDropZone>
    </Stack>
  );
});
