import { Skeleton, Stack, Group, Box, Title, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconDeviceGamepad2 } from "@tabler/icons-react";
import { getRouteApi } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { CollectionItem, ModeEnum, TypeEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import { GridList } from "@/components/ui/GridList";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { PageMeta } from "@/components/ui/PageMeta";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import { useCurrentUserId, useIsOwner } from "@/features/auth";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";
import { PairwiseRankingModal } from "@/features/ranking";
import { useConfirm } from "@/hooks/useConfirm";
import { cn } from "@/utils/cn";

import AddGameToCollectionModal from "../components/AddGameToCollectionModal";
import { CollectionHeader } from "../components/CollectionHeader";
import { CollectionStatsBanner } from "../components/CollectionStatsBanner";
import CreateCollectionModal from "../components/CreateCollectionModal";
import { RankingListView } from "../components/RankingList/RankingListView";
import { TierListView } from "../components/TierList/TierListView";
import {
  useCollectionDetail,
  useCollectionItemsInfiniteQuery,
  useRemoveCollectionItem,
} from "../hooks/useCollectionQueries";

import pageStyles from "./CollectionPage.module.css";

const routeApi = getRouteApi("/collection/$id/$slug");

export default function CollectionPage(): React.JSX.Element {
  const { id } = routeApi.useParams();
  const collectionId = Number(id);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isAddGameModalOpen, setIsAddGameModalOpen] = React.useState(false);
  const [isPairwiseModalOpen, setIsPairwiseModalOpen] = React.useState(false);

  const {
    data: collection,
    isLoading: isCollectionLoading,
    error: collectionError,
  } = useCollectionDetail(collectionId);

  const {
    data: itemsResults,
    error: itemsError,
    isLoading: isItemsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCollectionItemsInfiniteQuery(collectionId);

  const { mutate: removeCollectionItem } = useRemoveCollectionItem();

  const skeletonIds = React.useMemo(() => Array.from({ length: 12 }).map((_, i) => `skeleton-${i}`), []);

  const isOwner = useIsOwner(collection?.user.id);
  const currentUserId = useCurrentUserId();

  const canEdit = React.useMemo(() => {
    if (isOwner) {
      return true;
    }
    if (!currentUserId || !collection) {
      return false;
    }

    return collection.mode === ModeEnum.C && collection.collaborators.some(c => Number(c.id) === currentUserId);
  }, [isOwner, currentUserId, collection]);

  const { t } = useTranslation("collections");
  const { confirm, confirmModal } = useConfirm();

  const handleDeleteItem = React.useCallback(
    async (itemId: number, gameTitle: string) => {
      if (!collectionId) {
        return;
      }
      const confirmed = await confirm({
        title: t("detail.removeTitle"),
        message: t("detail.removeConfirm", { title: gameTitle }),
        isDestructive: true,
      });
      if (confirmed) {
        removeCollectionItem(
          { itemId, collectionId },
          {
            onSuccess: () =>
              notifications.show({
                title: t("detail.successTitle"),
                message: t("detail.removeSuccess"),
                color: "green",
              }),
            onError: () =>
              notifications.show({ title: t("detail.errorTitle"), message: t("detail.removeFailed"), color: "red" }),
          },
        );
      }
    },
    [collectionId, removeCollectionItem, t, confirm],
  );

  const allItems = React.useMemo(
    () => (collection?.type === TypeEnum.NOR ? itemsResults?.pages.flatMap(page => page.results) || [] : []),
    [itemsResults, collection?.type],
  );
  const totalCount = itemsResults?.pages[0]?.count ?? 0;

  const renderView = () => {
    if (!collection) {
      return null;
    }

    switch (collection.type) {
      case TypeEnum.TIE: {
        return <TierListView collectionId={collectionId} isOwner={canEdit} onRemove={handleDeleteItem} />;
      }
      case TypeEnum.RNK: {
        return <RankingListView collectionId={collectionId} isOwner={canEdit} onRemove={handleDeleteItem} />;
      }
      default: {
        return isItemsLoading && !isFetchingNextPage ? (
          <GridList columnCount={8}>
            {skeletonIds.map(skeletonId => (
              <Skeleton key={skeletonId} style={{ aspectRatio: "264/374", width: "100%", borderRadius: "12px" }} />
            ))}
          </GridList>
        ) : (
          <>
            <Box mb={24}>
              <CollectionStatsBanner
                icon={<IconDeviceGamepad2 size={20} style={{ color: "white" }} />}
                iconBackground="var(--mantine-color-primary-5)"
                bannerBackground="var(--gradient-collection-stats)"
                borderColor="var(--color-primary-tint-border)"
                textColor="var(--color-collection-stats-text)"
                count={totalCount}
                label={t("detail.totalGames")}
                typeLabel={t("type.normal")}
              />
            </Box>

            <VirtualGridList
              items={allItems}
              hasNextPage={!!hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              fetchNextPage={fetchNextPage}
              columnCount={8}
              rowHeight={280}
              renderItem={(item: CollectionItem) => (
                <Box key={item.id} className={pageStyles.collectionItem}>
                  <ItemOverlay
                    name={item.game.title}
                    itemPageUrl={`/game/${item.game.id}/${item.game.slug}`}
                    itemCoverUrl={getIGDBImageURL(item.game.cover_image_id ?? "", IGDBImageSize.COVER_BIG_264_374)}
                  />

                  {/* Added By Badge - Only show in Collaborative mode */}
                  {collection?.mode === ModeEnum.C && (
                    <Box style={{ position: "absolute", top: "12px", left: "12px", zIndex: 30, pointerEvents: "none" }}>
                      <Text
                        span
                        style={{
                          background: "rgba(79,70,229,0.8)",
                          color: "white",
                          fontSize: "8px",
                          padding: "4px 8px",
                          borderRadius: "6px",
                          textTransform: "uppercase",
                          fontWeight: 900,
                          letterSpacing: "0.05em",
                          backdropFilter: "blur(8px)",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)",
                          border: "1px solid rgba(255,255,255,0.1)",
                          width: "fit-content",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        <Text span style={{ opacity: 0.6 }}>
                          {t("detail.addedByLabel")}
                        </Text>{" "}
                        {item.added_by.username}
                      </Text>
                    </Box>
                  )}

                  {canEdit && (
                    <Box className={pageStyles.collectionItemDelete}>
                      <Button
                        variant="destructive"
                        size="icon"
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "9999px",
                          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)",
                        }}
                        onClick={e => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDeleteItem(item.id, item.game.title);
                        }}
                      >
                        <IconTrash style={{ width: 16, height: 16 }} />
                      </Button>
                    </Box>
                  )}
                </Box>
              )}
            />
          </>
        );
      }
    }
  };

  if (collectionError) {
    return (
      <Group justify="center" style={{ paddingBlock: "80px" }}>
        <Stack align="center" gap={8}>
          <Title order={1} fz={24} fw={700} c="var(--color-error-600)">
            {t("detail.loadError")}
          </Title>
          <Text c="var(--color-text-600)">{collectionError.message}</Text>
        </Stack>
      </Group>
    );
  }

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <PageMeta title={collection?.name ?? t("detail.pageTitle")} />
      <Stack gap={40} maw={1280} mx="auto" px={16}>
        {isCollectionLoading ? (
          <Stack gap={16}>
            <Skeleton style={{ height: "24px", width: "256px", borderRadius: "9999px" }} />
            <Skeleton style={{ height: "48px", width: "384px", borderRadius: "8px" }} />
            <Skeleton style={{ height: "16px", width: "100%", maxWidth: "672px", borderRadius: "8px" }} />
          </Stack>
        ) : (
          collection && (
            <CollectionHeader
              collection={collection}
              onEdit={() => setIsModalOpen(true)}
              onAddGame={() => setIsAddGameModalOpen(true)}
              onPairwiseRank={collection.type === TypeEnum.RNK ? () => setIsPairwiseModalOpen(true) : undefined}
            />
          )
        )}

        <Box
          className={cn(
            "rounded-2xl min-h-212.5 transition-all outline-hidden",
            collection?.type === TypeEnum.NOR || !collection?.type
              ? "bg-white shadow-sm border border-background-200 p-6 md:p-8"
              : "",
          )}
        >
          {renderView()}

          {!isItemsLoading && collection?.type === TypeEnum.NOR && allItems.length === 0 && (
            <Stack align="center" justify="center" gap={16} style={{ paddingBlock: "80px", textAlign: "center" }}>
              <Box
                style={{
                  width: "80px",
                  height: "80px",
                  background: "var(--color-background-50)",
                  borderRadius: "9999px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text span fz={36}>
                  🎮
                </Text>
              </Box>
              <Title order={3} fz="lg" fw={700} c="var(--color-text-900)">
                {t("detail.noGames")}
              </Title>
              <Text c="var(--color-text-500)" maw={320}>
                {t("detail.noGamesDesc")}
              </Text>
            </Stack>
          )}

          {itemsError && (
            <Box
              style={{
                background: "var(--color-error-50)",
                border: "1px solid var(--color-error-200)",
                borderRadius: "12px",
                padding: "16px",
                marginTop: "16px",
              }}
            >
              <Text c="var(--color-error-600)" ta="center" fw={500}>
                {t("detail.itemsLoadError", { message: itemsError.message })}
              </Text>
            </Box>
          )}
        </Box>
      </Stack>

      {isModalOpen && collection && (
        <CreateCollectionModal onClose={() => setIsModalOpen(false)} initialData={collection} mode="edit" />
      )}

      {isAddGameModalOpen && collection && (
        <AddGameToCollectionModal onClose={() => setIsAddGameModalOpen(false)} collectionId={collection.id} />
      )}

      {isPairwiseModalOpen && collection && (
        <PairwiseRankingModal
          collectionId={collection.id}
          collectionItems={collection.items}
          onClose={() => setIsPairwiseModalOpen(false)}
        />
      )}

      {confirmModal}
    </Box>
  );
}
