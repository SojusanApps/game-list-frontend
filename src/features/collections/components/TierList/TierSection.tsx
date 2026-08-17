import type { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Box, Group, Stack, Text, ActionIcon } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { CollectionItem, TierEnum } from "@/client";
import { GridList } from "@/components/ui/GridList";

import { useCollectionItemsByTierQuery } from "../../hooks/useCollectionQueries";
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
    targetPage: number,
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
  const [page, setPage] = React.useState(1);
  const { data, isLoading, isFetching } = useCollectionItemsByTierQuery(collectionId, tier.id, page);

  const items = data?.results || [];
  const totalCount = data?.count ?? 0;
  const hasNext = !!data?.next;
  const hasPrevious = !!data?.previous;
  const totalPages = Math.ceil(totalCount / 25);

  React.useEffect(() => {
    if (data?.count !== undefined) {
      onCountLoad(tier.id, data.count);
    }
  }, [data?.count, tier.id, onCountLoad]);

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
          page={page}
          title={item.game.title}
          coverImageId={item.game.cover_image_id}
          description={item.description}
          isOwner={isOwner}
          onRemove={onRemove ? () => onRemove(item.id, item.game.title) : undefined}
          onReorder={(itemId, sourceTierId, targetTierId, sourceIndex, targetIndex, edge) =>
            onReorder(itemId, sourceTierId, targetTierId, sourceIndex, targetIndex, edge, page)
          }
          onDescriptionChange={newDesc => onDescriptionChange(item.id, newDesc)}
          onMoveToTier={targetTierId => onItemMove(String(item.id), tier.id, targetTierId)}
        />
      );
    },
    [tier.id, page, isOwner, onRemove, onReorder, onDescriptionChange, onItemMove],
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

      <Box style={{ position: "relative" }}>
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
              <Box p="md" style={{ position: "relative" }}>
                <GridList columnCount={7}>{items.map((item, index) => renderGameCard(item, index))}</GridList>
              </Box>
            );
          })()}
        </TierDropZone>

        {/* Overlay Navigation Chevrons inside the Drop Zone Area */}
        {hasPrevious && !isLoading && (
          <Box style={{ position: "absolute", left: -8, top: "50%", transform: "translateY(-50%)", zIndex: 10 }}>
            <ActionIcon
              variant="filled"
              radius="xl"
              size="lg"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={isFetching}
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                background: "var(--color-background-100)",
                color: "var(--color-text-800)",
                border: "1px solid var(--color-background-200)",
              }}
            >
              <IconChevronLeft size={24} />
            </ActionIcon>
          </Box>
        )}

        {hasNext && !isLoading && (
          <Box style={{ position: "absolute", right: -8, top: "50%", transform: "translateY(-50%)", zIndex: 10 }}>
            <ActionIcon
              variant="filled"
              radius="xl"
              size="lg"
              onClick={() => setPage(p => p + 1)}
              disabled={isFetching}
              style={{
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                background: "var(--color-background-100)",
                color: "var(--color-text-800)",
                border: "1px solid var(--color-background-200)",
              }}
            >
              <IconChevronRight size={24} />
            </ActionIcon>
          </Box>
        )}
      </Box>

      {/* Subtle Dot Pagination */}
      {totalPages > 1 && !isLoading && (
        <Group justify="center" gap={8} style={{ marginTop: -8 }}>
          {Array.from({ length: totalPages }).map((_, i) => {
            const pageNum = i + 1;
            return (
              <Box
                key={`page-dot-${pageNum}`}
                onClick={() => !isFetching && setPage(pageNum)}
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: page === pageNum ? "var(--color-primary-500)" : "var(--color-background-300)",
                  transition: "all 200ms ease",
                  cursor: isFetching ? "default" : "pointer",
                  transform: page === pageNum ? "scale(1.2)" : "scale(1)",
                }}
              />
            );
          })}
        </Group>
      )}
    </Stack>
  );
});
