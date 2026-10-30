import { Skeleton, Stack, Group, Box, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconTrash, IconDeviceGamepad2 } from "@tabler/icons-react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { CollectionItem, ModeEnum, TypeEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { GridList } from "@/components/ui/GridList";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { ListViewModeToggle } from "@/components/ui/ListViewModeToggle";
import { PageMeta } from "@/components/ui/PageMeta";
import { PageShell } from "@/components/ui/PageShell";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { Panel } from "@/components/ui/Panel";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import { useCurrentUserId, useIsOwner } from "@/features/auth";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";
import { PairwiseRankingModal } from "@/features/ranking";
import { useConfirm } from "@/hooks/useConfirm";
import { useUrlState } from "@/hooks/useUrlState";
import { useListViewStore } from "@/lib/listViewStore";
import { GRID_BOX_STYLE } from "@/utils/gridLayout";
import { fireAndForget } from "@/utils/promiseUtils";

import AddGameToCollectionModal from "../components/AddGameToCollectionModal";
import { CollectionHeader } from "../components/CollectionHeader";
import { createCollectionItemColumns } from "../components/collectionItemColumns";
import { CollectionStatsBanner } from "../components/CollectionStatsBanner";
import CreateCollectionModal from "../components/CreateCollectionModal";
import { RankingListView } from "../components/RankingList/RankingListView";
import { TierListView } from "../components/TierList/TierListView";
import {
  useCollectionDetail,
  useCollectionItemsInfiniteQuery,
  useCollectionItemsQuery,
  useRemoveCollectionItem,
} from "../hooks/useCollectionQueries";

import pageStyles from "./CollectionPage.module.css";

const routeApi = getRouteApi("/collection/$id/$slug");

function ContentSurface({ surfaced, children }: Readonly<{ surfaced: boolean; children: React.ReactNode }>) {
  return surfaced ? <Panel style={GRID_BOX_STYLE}>{children}</Panel> : <Box style={GRID_BOX_STYLE}>{children}</Box>;
}

export default function CollectionPage(): React.JSX.Element {
  const { id } = routeApi.useParams();
  const collectionId = Number(id);

  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isAddGameModalOpen, setIsAddGameModalOpen] = React.useState(false);
  const [isPairwiseModalOpen, setIsPairwiseModalOpen] = React.useState(false);

  const renderMode = useListViewStore(state => state.mode);
  const navigate = useNavigate();
  const { search, update } = useUrlState();
  const page = typeof search.page === "number" ? search.page : 1;
  const setPage = (next: number) => update({ page: next === 1 ? undefined : next }, { keepPage: true });

  const {
    data: collection,
    isLoading: isCollectionLoading,
    error: collectionError,
    refetch: refetchCollection,
  } = useCollectionDetail(collectionId);

  const isNormalCollection = collection?.type === TypeEnum.NOR;

  const {
    data: itemsResults,
    error: itemsError,
    refetch: refetchItems,
    isLoading: isItemsLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCollectionItemsInfiniteQuery(collectionId, {}, { enabled: renderMode === "infinite" });

  const tableQuery = useCollectionItemsQuery(
    collectionId,
    page,
    {},
    { enabled: renderMode === "table" && isNormalCollection },
  );

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
    () => (isNormalCollection ? itemsResults?.pages.flatMap(resultPage => resultPage.results) || [] : []),
    [itemsResults, isNormalCollection],
  );
  const totalCount = renderMode === "table" ? (tableQuery.data?.count ?? 0) : (itemsResults?.pages[0]?.count ?? 0);

  const itemColumns = React.useMemo(
    () =>
      createCollectionItemColumns({
        t,
        canEdit,
        showAddedBy: collection?.mode === ModeEnum.C,
        onRemove: handleDeleteItem,
      }),
    [t, canEdit, collection?.mode, handleDeleteItem],
  );

  const displayItemsError = renderMode === "table" ? tableQuery.error : itemsError;

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
        const statsBanner = (
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
        );

        if (renderMode === "table") {
          return (
            <>
              {statsBanner}
              <PaginatedTable
                columns={itemColumns}
                data={tableQuery.data?.results ?? []}
                count={tableQuery.data?.count ?? 0}
                page={page}
                onPageChange={setPage}
                getRowId={row => String(row.id)}
                isLoading={tableQuery.isLoading}
                isFetching={tableQuery.isFetching}
                emptyLabel={t("detail.table.empty")}
                onRowClick={row =>
                  navigate({
                    to: "/game/$id/$slug",
                    params: { id: String(row.game.id), slug: row.game.slug ?? "" },
                  })
                }
              />
            </>
          );
        }

        return isItemsLoading && !isFetchingNextPage ? (
          <GridList columnCount={8}>
            {skeletonIds.map(skeletonId => (
              <Skeleton key={skeletonId} style={{ aspectRatio: "264/374", width: "100%", borderRadius: "12px" }} />
            ))}
          </GridList>
        ) : (
          <>
            {statsBanner}

            {/* Empty state is handled by the "no games in this collection" notice below,
                so skip the grid (and its own "no results found" message) when empty. */}
            {allItems.length > 0 && (
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
                      <Box
                        style={{ position: "absolute", top: "12px", left: "12px", zIndex: 30, pointerEvents: "none" }}
                      >
                        <Text
                          span
                          style={{
                            background: "rgba(0,0,0,0.75)",
                            color: "white",
                            fontSize: "12px",
                            padding: "4px 8px",
                            borderRadius: "6px",
                            fontWeight: 700,
                            backdropFilter: "blur(8px)",
                            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            width: "fit-content",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                          }}
                        >
                          <Text span inherit style={{ opacity: 0.6 }}>
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
                          aria-label={t("rankingRow.removeGame")}
                          onClick={e => {
                            e.preventDefault();
                            e.stopPropagation();
                            fireAndForget(handleDeleteItem(item.id, item.game.title));
                          }}
                        >
                          <IconTrash style={{ width: 16, height: 16 }} />
                        </Button>
                      </Box>
                    )}
                  </Box>
                )}
              />
            )}
          </>
        );
      }
    }
  };

  if (collectionError) {
    return (
      <Box p="xl" maw={560} mx="auto">
        <ErrorState title={t("detail.loadError")} onRetry={() => refetchCollection()} />
      </Box>
    );
  }

  return (
    <PageShell width="wide">
      <PageMeta title={collection?.name ?? t("detail.pageTitle")} />
      <Stack gap={40}>
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

        {isNormalCollection && (
          <Group justify="flex-end">
            <ListViewModeToggle />
          </Group>
        )}

        {/* Normal collections sit on the standard Panel surface; tier lists and rankings draw their own. */}
        <ContentSurface surfaced={collection?.type === TypeEnum.NOR || !collection?.type}>
          {displayItemsError ? (
            <ErrorState onRetry={() => (renderMode === "table" ? tableQuery.refetch() : refetchItems())} />
          ) : (
            renderView()
          )}

          {renderMode === "infinite" &&
            !isItemsLoading &&
            !displayItemsError &&
            isNormalCollection &&
            allItems.length === 0 && (
              <EmptyState
                icon={<IconDeviceGamepad2 size={40} />}
                title={t("detail.noGames")}
                description={t("detail.noGamesDesc")}
              />
            )}
        </ContentSurface>
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
    </PageShell>
  );
}
