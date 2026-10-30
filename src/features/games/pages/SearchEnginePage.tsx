import { Box, Group, SegmentedControl, Skeleton, Stack, Text, Title, TextInput, Drawer } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconSearch, IconSearchOff, IconFilter } from "@tabler/icons-react";
import { InfiniteData } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import {
  GameSimpleList,
  Company,
  User,
  PaginatedCompanyList,
  PaginatedGameSimpleListList,
  PaginatedUserList,
} from "@/client";
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
import { ActiveFilterChips } from "@/features/games/components/ActiveFilterChips";
import GameSearchFilter, {
  ValidationSchema as GameSearchFilterValidationSchema,
} from "@/features/games/components/GameSearchFilter";
import { useSearchInfiniteQuery, useSearchQuery, SearchCategory } from "@/features/games/hooks/useSearchQueries";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";
import { cleanGameFilters } from "@/features/games/utils/searchFilters";
import { useListViewStore } from "@/lib/listViewStore";
import { Route } from "@/routes/search";
import { GRID_BOX_STYLE } from "@/utils/gridLayout";

import { createCompanyColumns, createGameColumns, createUserColumns } from "../components/gameSearchColumns";

import styles from "./SearchEnginePage.module.css";

type searchResultsType = PaginatedCompanyList | PaginatedGameSimpleListList | PaginatedUserList | undefined;

type SearchFilterValidatorsType = GameSearchFilterValidationSchema;

function DisplaySearchResults({
  selectedCategory,
  searchResults,
  fetchNextPage,
  hasNextPage,
  isFetchingNextPage,
}: Readonly<{
  selectedCategory: string | null;
  searchResults: InfiniteData<searchResultsType>;
  fetchNextPage: () => void;
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
}>): React.JSX.Element {
  const { t } = useTranslation("games");
  if (searchResults === undefined || searchResults.pages.length === 0) {
    return <Text>{t("search.noResults")}</Text>;
  }

  const allItems = searchResults.pages
    .map(page => page?.results)
    .filter(Boolean)
    .flat();

  const renderItem = (item: unknown) => {
    switch (selectedCategory) {
      case "games": {
        const game = item as GameSimpleList;
        return (
          <ItemOverlay
            key={game.id}
            name={game.title}
            itemPageUrl={`/game/${game.id}/${game.slug}`}
            itemCoverUrl={
              game.cover_image_id ? getIGDBImageURL(game.cover_image_id, IGDBImageSize.COVER_BIG_264_374) : null
            }
            gameType={game.game_type}
            releaseDate={game.release_date}
            rating={game.average_score}
          />
        );
      }
      case "companies": {
        const company = item as Company;
        return (
          <ItemOverlay
            key={company.id}
            variant="logo"
            name={company.name}
            itemPageUrl={`/company/${company.id}/${company.slug}`}
            itemCoverUrl={
              company.company_logo_id ? getIGDBImageURL(company.company_logo_id, IGDBImageSize.COVER_BIG_264_374) : null
            }
          />
        );
      }
      case "users": {
        const user = item as User;
        return (
          <ItemOverlay
            key={user.id}
            name={user.username}
            itemPageUrl={`/profile/${user.id}/${user.slug}`}
            itemCoverUrl={user.gravatar_url}
            isInactive={user.is_active === false}
          />
        );
      }
      default: {
        return null;
      }
    }
  };

  const columnCount = 5;
  // Poster cards size their rows from the measured card; only the 3:2 company logos need a fixed height.
  const rowHeight = selectedCategory === "companies" ? 220 : undefined;

  return (
    <VirtualGridList
      items={allItems}
      renderItem={renderItem}
      hasNextPage={hasNextPage}
      isFetchingNextPage={isFetchingNextPage}
      fetchNextPage={fetchNextPage}
      columnCount={columnCount}
      rowHeight={rowHeight}
    />
  );
}

function getQueryKey(cat: SearchCategory | null) {
  if (cat === "users") return "username";
  if (cat === "companies") return "name";
  return "title";
}

export default function SearchEnginePage(): React.JSX.Element {
  const { t } = useTranslation("games");
  const searchParams = Route.useSearch();
  const navigate = useNavigate({ from: Route.id });

  const selectedCategory = searchParams.category ?? "games";
  const viewMode = useListViewStore(state => state.mode);
  const page = searchParams.page ?? 1;

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState(searchParams.q ?? "");
  const [prevQ, setPrevQ] = React.useState(searchParams.q);

  if (searchParams.q !== prevQ) {
    setPrevQ(searchParams.q);
    setSearchInput(searchParams.q ?? "");
  }

  const { q, page: _page, ...otherFilters } = searchParams;

  const queryKey = getQueryKey(selectedCategory);

  const filters: Record<string, unknown> = { ...otherFilters };
  delete filters.category; // prevent category from leaking into query object

  if (q?.trim()) {
    filters[queryKey] = q.trim();
  }

  const { category: _category, ordering: _ordering, igdb_id: _igdbId, ...chipFilters } = otherFilters;
  const hasActiveGameFilters = Object.keys(chipFilters).length > 0;

  const hasSearched = Boolean(q?.trim()) || Object.keys(otherFilters).length > 0;

  // With nothing searched yet, the Games category shows a browsable grid instead of an empty prompt.
  const isBrowsing = !hasSearched && selectedCategory === "games";
  const queryEnabled = hasSearched || isBrowsing;
  const queryFilters = isBrowsing ? { ordering: "rank_position" } : filters;

  const {
    data: searchResults,
    error: errorFetchingData,
    refetch,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchInfiniteQuery(selectedCategory, queryFilters, { enabled: queryEnabled && viewMode === "infinite" });

  const {
    data: pagedData,
    error: pagedError,
    refetch: refetchPaged,
    isLoading: isPagedLoading,
    isFetching: isPagedFetching,
  } = useSearchQuery(selectedCategory, queryFilters, page, { enabled: queryEnabled && viewMode === "table" });

  const gameColumns = React.useMemo(() => createGameColumns(t), [t]);
  const companyColumns = React.useMemo(() => createCompanyColumns(t), [t]);
  const userColumns = React.useMemo(() => createUserColumns(t), [t]);

  // `page` is a table-mode-only concern; drop it from the URL when infinite scroll is active.
  React.useEffect(() => {
    if (viewMode === "infinite" && searchParams.page !== undefined) {
      navigate({ search: prev => ({ ...prev, page: undefined }), replace: true });
    }
  }, [viewMode, searchParams.page, navigate]);

  const setPage = (next: number) => {
    navigate({ search: prev => ({ ...prev, page: next <= 1 ? undefined : next }) });
  };

  const handleHeroSearch = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();

    navigate({
      search: prev => ({
        ...prev,
        q: searchInput.trim() || undefined,
        category: selectedCategory,
        page: undefined,
      }),
      replace: true,
    });
  };

  const handleCategoryChange = (catId: SearchCategory) => {
    // Filters only exist for games, so leaving the category drops them; say so instead of doing it silently.
    if (catId !== selectedCategory && hasActiveGameFilters) {
      notifications.show({ message: t("search.filtersCleared") });
    }
    navigate({
      search: prev => ({ q: prev.q, category: catId }),
      replace: true,
    });
  };

  const prepareFiltersForRequest = (data: SearchFilterValidatorsType) => {
    const filterData = cleanGameFilters(data);

    navigate({
      search: prev => ({
        ...filterData,
        q: prev.q,
        category: prev.category,
      }),
      replace: true,
    });
    setDrawerOpen(false);
  };

  const categories = [
    { id: "games", label: t("search.categoryGames") },
    { id: "companies", label: t("search.categoryCompanies") },
    { id: "users", label: t("search.categoryUsers") },
  ] as const;

  const placeholderKeys = {
    games: "search.placeholderGames",
    companies: "search.placeholderCompanies",
    users: "search.placeholderUsers",
  } as const;

  const descKeys = {
    games: "search.readyToExploreDescGames",
    companies: "search.readyToExploreDescCompanies",
    users: "search.readyToExploreDescUsers",
  } as const;

  const displayError = viewMode === "table" ? pagedError : errorFetchingData;

  const renderResultsTable = () => {
    const shared = {
      count: pagedData?.count ?? 0,
      page,
      onPageChange: setPage,
      isLoading: isPagedLoading,
      isFetching: isPagedFetching,
      emptyLabel: t("search.noResultsFound"),
    };

    if (selectedCategory === "companies") {
      const rows = (pagedData?.results ?? []) as Company[];
      return (
        <PaginatedTable
          {...shared}
          columns={companyColumns}
          data={rows}
          getRowId={row => String(row.id)}
          onRowClick={row =>
            navigate({ to: "/company/$id/$slug", params: { id: String(row.id), slug: row.slug ?? "" } })
          }
        />
      );
    }

    if (selectedCategory === "users") {
      const rows = (pagedData?.results ?? []) as User[];
      return (
        <PaginatedTable
          {...shared}
          columns={userColumns}
          data={rows}
          getRowId={row => String(row.id)}
          onRowClick={row => navigate({ to: "/profile/$id/$slug", params: { id: String(row.id), slug: row.slug } })}
        />
      );
    }

    const rows = (pagedData?.results ?? []) as GameSimpleList[];
    return (
      <PaginatedTable
        {...shared}
        columns={gameColumns}
        data={rows}
        getRowId={row => String(row.id)}
        onRowClick={row => navigate({ to: "/game/$id/$slug", params: { id: String(row.id), slug: row.slug ?? "" } })}
      />
    );
  };

  const renderSearchContent = () => {
    if (displayError) {
      return <ErrorState onRetry={() => (viewMode === "table" ? refetchPaged() : refetch())} />;
    }
    if (!hasSearched && !isBrowsing) {
      return (
        <EmptyState
          icon={<IconSearch size={40} />}
          title={t("search.readyToExplore")}
          description={t(descKeys[selectedCategory])}
        />
      );
    }

    if (viewMode === "table") {
      return renderResultsTable();
    }

    if (isLoading && !isFetchingNextPage) {
      return (
        <GridList columnCount={5}>
          {Array.from({ length: 21 }).map((_, i) => {
            const skeletonKey = `search-skeleton-${i}`;
            return (
              <Skeleton
                key={skeletonKey}
                style={{
                  width: "100%",
                  borderRadius: "12px",
                  aspectRatio: selectedCategory === "companies" ? "3/2" : "264/374",
                }}
              />
            );
          })}
        </GridList>
      );
    }

    if (searchResults) {
      return (
        <DisplaySearchResults
          selectedCategory={selectedCategory}
          searchResults={searchResults}
          fetchNextPage={fetchNextPage}
          hasNextPage={!!hasNextPage}
          isFetchingNextPage={isFetchingNextPage}
        />
      );
    }

    return <EmptyState icon={<IconSearchOff size={40} />} title={t("search.noResultsFound")} />;
  };

  return (
    <PageShell width="wide">
      <PageMeta title={t("search.title")} />
      <Stack gap={40}>
        <Stack align="center" gap={24}>
          <Title fz={36} fw={700} c="var(--color-text-900)" style={{ letterSpacing: "-0.025em" }}>
            {t("search.title")}
          </Title>

          <SegmentedControl
            size="md"
            radius="md"
            aria-label={t("search.categoryLabel")}
            className={styles.categoryTabs}
            value={selectedCategory}
            onChange={value => handleCategoryChange(value as SearchCategory)}
            data={categories.map(cat => ({ value: cat.id, label: cat.label }))}
          />

          <Box component="form" onSubmit={handleHeroSearch} className={styles.heroSearchForm}>
            <TextInput
              size="lg"
              placeholder={t(placeholderKeys[selectedCategory])}
              aria-label={t(placeholderKeys[selectedCategory])}
              value={searchInput}
              onChange={e => setSearchInput(e.currentTarget.value)}
              leftSection={<IconSearch size={20} color="var(--color-text-400)" />}
              style={{ flex: 1 }}
              styles={{
                input: {
                  background: "var(--color-background-100)",
                  border: "1px solid var(--color-background-300)",
                  borderRadius: "12px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                },
              }}
            />
            {selectedCategory === "games" && (
              <Box hiddenFrom="lg">
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => setDrawerOpen(true)}
                  style={{ borderRadius: "12px", padding: "0 16px", background: "var(--color-background-100)" }}
                  leftSection={<IconFilter size={20} />}
                >
                  {t("search.filtersButton")}
                </Button>
              </Box>
            )}
            <Button type="submit" size="lg" style={{ borderRadius: "12px", padding: "0 20px" }}>
              {t("search.searchButton")}
            </Button>
          </Box>

          {selectedCategory === "games" && hasActiveGameFilters && (
            <ActiveFilterChips
              filters={chipFilters}
              onRemove={key =>
                navigate({ search: prev => ({ ...prev, [key]: undefined, page: undefined }), replace: true })
              }
              onClearAll={() => navigate({ search: prev => ({ q: prev.q, category: prev.category }), replace: true })}
            />
          )}
        </Stack>

        <Drawer
          opened={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          position="right"
          size="md"
          title={
            <Text fw={700} fz="xl" c="var(--color-text-900)">
              {t("search.filtersButton")}
            </Text>
          }
          padding="xl"
          styles={{ body: { paddingBottom: "120px" } }}
        >
          {selectedCategory === "games" && (
            <GameSearchFilter
              showIgdbId
              initialFilters={otherFilters}
              onSubmitHandlerCallback={data => prepareFiltersForRequest(data)}
            />
          )}
        </Drawer>

        <Group align="flex-start" gap={24} wrap="nowrap">
          {selectedCategory === "games" && (
            <Panel visibleFrom="lg" w={320} style={{ flexShrink: 0 }}>
              <Text fw={700} fz="lg" c="var(--color-text-900)" mb={16}>
                {t("search.filtersButton")}
              </Text>
              <GameSearchFilter
                key={JSON.stringify(otherFilters)}
                showIgdbId
                initialFilters={otherFilters}
                onSubmitHandlerCallback={data => prepareFiltersForRequest(data)}
              />
            </Panel>
          )}
          <Stack gap={16} style={{ flex: 1, minWidth: 0 }}>
            <Group justify="flex-end">
              <ListViewModeToggle />
            </Group>

            <Panel
              p={"32px"}
              style={{
                ...GRID_BOX_STYLE,
                position: "relative",
              }}
            >
              {renderSearchContent()}
            </Panel>
          </Stack>
        </Group>
      </Stack>
    </PageShell>
  );
}
