import type { Edge } from "@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge";
import { Box, Group, Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconDeviceGamepad2 } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { TierEnum, BlankEnum } from "@/client";

import { CollectionStatsBanner } from "../CollectionStatsBanner";
import { useUpdateCollectionItemTier, useUpdateCollectionItem } from "../../hooks/useCollectionQueries";
import { TierSection } from "./TierSection";

interface TierListViewProps {
  collectionId: number;
  isOwner: boolean;
  onRemove?: (itemId: number, gameTitle: string) => void;
}

export const TIERS: { id: TierEnum | "UNRANKED"; label: string; color: string }[] = [
  { id: TierEnum.S, label: "S", color: "#ef4444" },
  { id: TierEnum.A, label: "A", color: "#f97316" },
  { id: TierEnum.B, label: "B", color: "#eab308" },
  { id: TierEnum.C, label: "C", color: "#22c55e" },
  { id: TierEnum.D, label: "D", color: "#3b82f6" },
  { id: TierEnum.E, label: "E", color: "#a855f7" },
  { id: TierEnum.F, label: "F", color: "#ec4899" },
  { id: "UNRANKED", label: "?", color: "#737373" },
];

export const TierListView = React.memo(function TierListViewInner({
  collectionId,
  isOwner,
  onRemove,
}: Readonly<TierListViewProps>) {
  const { t } = useTranslation("collections");
  const { mutateAsync: updateItemTier } = useUpdateCollectionItemTier();
  const { mutateAsync: updateItem } = useUpdateCollectionItem();

  const [tierCounts, setTierCounts] = React.useState<Record<string, number>>({});

  const handleCountLoad = React.useCallback((tierId: string, count: number) => {
    setTierCounts(prev => {
      if (prev[tierId] === count) return prev;
      return { ...prev, [tierId]: count };
    });
  }, []);

  const handleItemMove = React.useCallback(
    async (itemId: string, sourceTierId: string, targetTierId: string) => {
      if (!isOwner) {
        return;
      }

      const numericItemId = Math.trunc(Number(itemId));
      const tierConfig = TIERS.find(tier => tier.id === targetTierId);
      if (!tierConfig) {
        return;
      }

      const targetTier = tierConfig.id === "UNRANKED" ? BlankEnum[""] : tierConfig.id;

      try {
        await updateItemTier({
          collectionId,
          itemId: numericItemId,
          tier: targetTier,
          oldTier: sourceTierId as TierEnum | "UNRANKED",
        });

        notifications.show({ title: t("tierList.successTitle"), message: t("tierList.itemMoved"), color: "green" });
      } catch (error) {
        notifications.show({ title: t("tierList.errorTitle"), message: t("tierList.failedToMove"), color: "red" });
        console.error(error);
      }
    },
    [isOwner, collectionId, updateItemTier, t],
  );

  const handleReorder = React.useCallback(
    async (
      itemId: string,
      sourceTierId: string,
      targetTierId: string,
      sourceIndex: number,
      targetIndex: number,
      edge: Edge | null,
    ) => {
      if (!isOwner) {
        return;
      }

      const numericItemId = Math.trunc(Number(itemId));
      const tierConfig = TIERS.find(tier => tier.id === targetTierId);
      if (!tierConfig) {
        return;
      }

      const targetTier = tierConfig.id === "UNRANKED" ? BlankEnum[""] : tierConfig.id;

      // Calculate insertion position (0-based for API)
      let position = targetIndex;
      if (edge === "right") {
        position += 1;
      }

      // If moving within the same tier, adjust for the item being removed first
      // (sourceIndex is already absolute, calculated in SortableGameCard)
      if (sourceTierId === targetTierId && sourceIndex < position) {
        position -= 1;
      }

      try {
        await updateItemTier({
          collectionId,
          itemId: numericItemId,
          tier: targetTier,
          position,
          oldTier: sourceTierId as TierEnum | "UNRANKED",
        });

        notifications.show({ title: t("tierList.successTitle"), message: t("tierList.itemReordered"), color: "green" });
      } catch (error) {
        notifications.show({ title: t("tierList.errorTitle"), message: t("tierList.failedToReorder"), color: "red" });
        console.error(error);
      }
    },
    [isOwner, collectionId, updateItemTier, t],
  );

  const handleDescriptionChange = React.useCallback(
    async (itemId: number, newDescription: string) => {
      if (!isOwner) return;

      try {
        await updateItem({ id: itemId, body: { description: newDescription } });
        notifications.show({
          title: t("tierList.successTitle"),
          message: t("tierList.descriptionUpdated"),
          color: "green",
        });
      } catch (error) {
        notifications.show({
          title: t("tierList.errorTitle"),
          message: t("tierList.failedToUpdateDescription"),
          color: "red",
        });
        console.error(error);
      }
    },
    [isOwner, updateItem, t],
  );

  // Calculate total items from API count
  const totalItems = React.useMemo(() => {
    return Object.values(tierCounts).reduce((sum, count) => sum + count, 0);
  }, [tierCounts]);

  return (
    <Stack gap={32}>
      <CollectionStatsBanner
        icon={<IconDeviceGamepad2 size={20} style={{ color: "white" }} />}
        iconBackground="linear-gradient(135deg, #ef4444, #f97316)"
        bannerBackground="linear-gradient(to right, var(--color-error-tint-bg), var(--color-secondary-tint-bg))"
        borderColor="var(--color-secondary-tint-border)"
        textColor="var(--color-secondary-tint-text)"
        count={totalItems}
        label={t("tierList.totalGames")}
        typeLabel={t("type.tierList")}
        extra={
          <Group gap={12}>
            {TIERS.slice(0, -1).map(tier => {
              const count = tierCounts[tier.id] ?? 0;
              return (
                <Group
                  key={tier.id}
                  gap={6}
                  style={{
                    padding: "6px 12px",
                    background: "rgba(var(--color-veil-rgb), 0.9)",
                    borderRadius: 8,
                    border: "1px solid var(--color-background-200)",
                  }}
                >
                  <Box style={{ width: 8, height: 8, borderRadius: "9999px", background: tier.color }} />
                  <Text component="span" size="xs" fw={600} c={tier.color}>
                    {tier.label}
                  </Text>
                  <Text component="span" size="xs" fw={900} c="var(--color-text-600)">
                    {count}
                  </Text>
                </Group>
              );
            })}
            <Group
              key="unranked-count"
              gap={6}
              style={{
                padding: "6px 12px",
                background: "rgba(var(--color-veil-rgb), 0.9)",
                borderRadius: 8,
                border: "1px solid var(--color-background-200)",
              }}
            >
              <Text component="span" size="xs" fw={600} c="var(--color-text-400)">
                ?
              </Text>
              <Text component="span" size="xs" fw={900} c="var(--color-text-600)">
                {tierCounts["UNRANKED"] ?? 0}
              </Text>
            </Group>
          </Group>
        }
      />

      <Stack gap={16}>
        {TIERS.map(tier => (
          <TierSection
            key={tier.id}
            collectionId={collectionId}
            tier={tier}
            isOwner={isOwner}
            onRemove={onRemove}
            onItemMove={handleItemMove}
            onReorder={handleReorder}
            onDescriptionChange={handleDescriptionChange}
            onCountLoad={handleCountLoad}
          />
        ))}
      </Stack>
    </Stack>
  );
});
