import { Skeleton, Stack, Group, Box, Title, Text, Select, SegmentedControl, TextInput } from "@mantine/core";
import { IconFolder, IconSearch } from "@tabler/icons-react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation, Trans } from "react-i18next";

import { Collection, CollectionCollectionsListData } from "@/client";
import { Button } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { ErrorState } from "@/components/ui/ErrorState";
import { FilterChips } from "@/components/ui/FilterChips";
import { GridList } from "@/components/ui/GridList";
import { ListViewModeToggle } from "@/components/ui/ListViewModeToggle";
import { PageMeta } from "@/components/ui/PageMeta";
import { PageShell } from "@/components/ui/PageShell";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { Panel } from "@/components/ui/Panel";
import { TagChip } from "@/components/ui/TagChip";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import { useAuthStore, useIsOwner } from "@/features/auth";
import { useGetUserDetails } from "@/features/users/hooks/userQueries";
import { useUrlState } from "@/hooks/useUrlState";
import { useListViewStore } from "@/lib/listViewStore";
import type { CollectionListScope } from "@/lib/queryKeys";
import { GRID_BOX_STYLE } from "@/utils/gridLayout";

import CollectionCard from "../components/CollectionCard";
import { createCollectionColumns } from "../components/collectionColumns";
import CreateCollectionModal from "../components/CreateCollectionModal";
import { useCollectionsInfiniteQuery, useCollectionsQuery } from "../hooks/useCollectionQueries";
import { buildCollectionFilterChips, getCollectionFilterOptions } from "../utils/collectionFilterChips";

const routeApi = getRouteApi("/profile_/$id/$slug/collections");

export default function CollectionsPage(): React.JSX.Element {
  const { id } = routeApi.useParams();
  const userId = Number(id);

  const [isModalOpen, setIsModalOpen] = React.useState(false);

  const { data: userDetails, isLoading: isUserLoading } = useGetUserDetails(userId);

  const isOwner = useIsOwner(userId);
  // Favorites are per user, so anonymous visitors have none and the filter would only ever return nothing.
  const isAuthenticated = useAuthStore(state => state.isAuthenticated);
  const { t } = useTranslation("collections");
  const navigate = useNavigate();
  const renderMode = useListViewStore(state => state.mode);

  const skeletonIds = React.useMemo(() => Array.from({ length: 8 }).map((_, i) => `skeleton-${i}`), []);

  const { search, update } = useUrlState();
  const isFavoriteFilter = search.favorites === true ? true : null;
  const visibilityFilter = typeof search.visibility === "string" ? search.visibility : null;
  const modeFilter = typeof search.mode === "string" ? search.mode : null;
  const typeFilter = typeof search.type === "string" ? search.type : null;
  const useMember = search.shared === true;
  const nameFilter = typeof search.name === "string" ? search.name : "";
  const [nameInput, setNameInput] = React.useState(nameFilter);
  const page = typeof search.page === "number" ? search.page : 1;
  const setPage = (next: number) => update({ page: next === 1 ? undefined : next }, { keepPage: true });

  // On your own profile the favorites filter lists everything you've favorited, whoever owns it. Favorites are
  // private, so on someone else's profile it stays scoped to that user's collections you've favorited.
  const isAllFavorites = isOwner && isFavoriteFilter === true;
  const sharedScope: CollectionListScope = useMember ? "member" : "user";
  const scope: CollectionListScope = isAllFavorites ? "any" : sharedScope;

  const commitNameFilter = () => update({ name: nameInput.trim() || undefined });

  const queryFilters = React.useMemo(() => {
    const filters: Required<CollectionCollectionsListData>["query"] = {};
    if (isFavoriteFilter !== null) {
      filters.is_favorite = String(isFavoriteFilter);
    }
    if (visibilityFilter !== null) {
      filters.visibility = visibilityFilter;
    }
    if (modeFilter !== null) {
      filters.mode = modeFilter;
    }
    if (typeFilter !== null) {
      filters.type = typeFilter;
    }
    if (nameFilter !== "") {
      filters.name = nameFilter;
    }
    return filters;
  }, [isFavoriteFilter, visibilityFilter, modeFilter, typeFilter, nameFilter]);

  const {
    data: collectionsResults,
    error: errorFetchingData,
    refetch,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useCollectionsInfiniteQuery(userId, queryFilters, scope, { enabled: renderMode === "infinite" });

  const tableQuery = useCollectionsQuery(userId, page, queryFilters, scope, {
    enabled: renderMode === "table",
  });

  const collectionColumns = React.useMemo(() => createCollectionColumns(t), [t]);

  const allItems = collectionsResults?.pages.flatMap(resultPage => resultPage.results) || [];

  const displayError = renderMode === "table" ? tableQuery.error : errorFetchingData;

  const renderResults = () => {
    if (renderMode === "table") {
      return (
        <PaginatedTable
          columns={collectionColumns}
          data={tableQuery.data?.results ?? []}
          count={tableQuery.data?.count ?? 0}
          page={page}
          onPageChange={setPage}
          getRowId={row => String(row.id)}
          isLoading={tableQuery.isLoading}
          isFetching={tableQuery.isFetching}
          emptyLabel={t("list.noCollections")}
          onRowClick={row =>
            navigate({ to: "/collection/$id/$slug", params: { id: String(row.id), slug: row.slug ?? "" } })
          }
        />
      );
    }

    if (isLoading && !isFetchingNextPage) {
      return (
        <GridList columnCount={5}>
          {skeletonIds.map(skeletonId => (
            <Skeleton key={skeletonId} style={{ aspectRatio: "3/4", width: "100%", borderRadius: "24px" }} />
          ))}
        </GridList>
      );
    }

    // Empty state is handled by the "no collections" notice below, so skip the
    // grid (and its own "no results found" message) when empty.
    if (allItems.length === 0) {
      return null;
    }

    return (
      <VirtualGridList
        items={allItems}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        columnCount={5}
        rowHeight={450}
        renderItem={(collection: Collection) => <CollectionCard key={collection.id} collection={collection} />}
      />
    );
  };

  const pageTitle = isUserLoading
    ? t("list.loading")
    : t("list.collectionsPageTitle", { username: userDetails?.username });

  const { visibilityOptions, modeOptions, typeOptions } = getCollectionFilterOptions(t);
  const filterChips = buildCollectionFilterChips(t, {
    name: nameFilter,
    favorites: !!isFavoriteFilter,
    shared: useMember,
    visibility: visibilityFilter,
    mode: modeFilter,
    type: typeFilter,
  });

  return (
    <PageShell width="wide">
      <PageMeta title={pageTitle} />
      <Stack gap={40}>
        <Stack align="center" gap={32}>
          <Stack align="center">
            <Title
              order={1}
              fz={{ base: 30, md: 36 }}
              fw={900}
              c="var(--color-text-900)"
              ta="center"
              style={{ letterSpacing: "-0.025em" }}
            >
              <Trans
                i18nKey="list.collectionsTitle"
                ns="collections"
                values={{ username: userDetails?.username }}
                components={[<span style={{ color: "var(--mantine-color-primary-6)" }} key="username" />]}
              />
            </Title>
            {isOwner && <TagChip style={{ marginTop: 8 }}>{t("list.ownerView")}</TagChip>}
          </Stack>

          <Stack w="100%" gap={16}>
            {isOwner && (
              <Group justify="center">
                <Button
                  onClick={() => setIsModalOpen(true)}
                  size="sm"
                  style={{
                    fontWeight: 700,
                    letterSpacing: "0.05em",
                    borderRadius: 12,
                  }}
                >
                  {t("list.createNew")}
                </Button>
              </Group>
            )}

            <Box
              component="form"
              w="100%"
              maw={480}
              mx="auto"
              onSubmit={e => {
                e.preventDefault();
                commitNameFilter();
              }}
            >
              <TextInput
                id="name-filter"
                placeholder={t("list.namePlaceholder")}
                aria-label={t("list.namePlaceholder")}
                value={nameInput}
                onChange={e => setNameInput(e.currentTarget.value)}
                onBlur={commitNameFilter}
                leftSection={<IconSearch size={18} color="var(--color-text-400)" />}
                styles={{
                  input: {
                    background: "var(--color-background-100)",
                    border: "1px solid var(--color-background-300)",
                    borderRadius: "12px",
                  },
                }}
              />
            </Box>
            <Box
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "24px",
                paddingBlock: "8px",
              }}
            >
              {isAuthenticated && (
                <Stack gap={4}>
                  <Text fz="sm" fw={500} id="collections-show-label">
                    {t("list.filterShow")}
                  </Text>
                  <SegmentedControl
                    aria-labelledby="collections-show-label"
                    value={isFavoriteFilter ? "favorites" : "all"}
                    onChange={value => update({ favorites: value === "favorites" ? true : undefined })}
                    data={[
                      { value: "all", label: t("list.filterAll") },
                      { value: "favorites", label: t("list.filterFavorites") },
                    ]}
                  />
                </Stack>
              )}

              <Stack gap={4}>
                <Text fz="sm" fw={500} id="collections-scope-label">
                  {t("list.filterScope")}
                </Text>
                <SegmentedControl
                  aria-labelledby="collections-scope-label"
                  value={useMember ? "shared" : "mine"}
                  onChange={value => update({ shared: value === "shared" ? true : undefined })}
                  disabled={isAllFavorites}
                  data={[
                    { value: "mine", label: t("list.filterMyOnly") },
                    { value: "shared", label: t("list.filterIncludeShared") },
                  ]}
                />
              </Stack>

              <Select
                id="visibility-filter"
                label={t("list.filterVisibility")}
                value={visibilityFilter}
                onChange={value => update({ visibility: value ?? undefined })}
                clearable
                placeholder={t("list.anyVisibility")}
                data={visibilityOptions}
              />

              <Select
                id="mode-filter"
                label={t("list.filterMode")}
                value={modeFilter}
                onChange={value => update({ mode: value ?? undefined })}
                clearable
                placeholder={t("list.anyMode")}
                data={modeOptions}
              />

              <Select
                id="type-filter"
                label={t("list.filterType")}
                value={typeFilter}
                onChange={value => update({ type: value ?? undefined })}
                clearable
                placeholder={t("list.anyType")}
                data={typeOptions}
              />
            </Box>

            <FilterChips
              chips={filterChips}
              onRemove={key => {
                if (key === "name") setNameInput("");
                update({ [key]: undefined });
              }}
              onClearAll={() => {
                setNameInput("");
                update({
                  name: undefined,
                  favorites: undefined,
                  shared: undefined,
                  visibility: undefined,
                  mode: undefined,
                  type: undefined,
                });
              }}
            />
          </Stack>
        </Stack>

        <Group justify="flex-end">
          <ListViewModeToggle />
        </Group>

        <Panel
          style={{
            ...GRID_BOX_STYLE,
          }}
        >
          {displayError ? (
            <ErrorState onRetry={() => (renderMode === "table" ? tableQuery.refetch() : refetch())} />
          ) : (
            renderResults()
          )}
          {renderMode === "infinite" && !isLoading && !displayError && allItems.length === 0 && (
            <EmptyState
              icon={<IconFolder size={40} />}
              title={t("list.noCollections")}
              description={t("list.noCollectionsDesc")}
              action={
                isOwner ? (
                  <Button variant="outline" onClick={() => setIsModalOpen(true)} style={{ fontWeight: 700 }}>
                    {t("list.createFirst")}
                  </Button>
                ) : undefined
              }
            />
          )}
        </Panel>
      </Stack>

      {isModalOpen && <CreateCollectionModal onClose={() => setIsModalOpen(false)} />}
    </PageShell>
  );
}
