import * as React from "react";
import { useTranslation } from "react-i18next";
import ItemOverlay from "@/components/ui/ItemOverlay";
import GameSearchFilter, {
  ValidationSchema as GameSearchFilterValidationSchema,
} from "@/features/games/components/GameSearchFilter";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";
import {
  GameSimpleList,
  Company,
  User,
  PaginatedCompanyList,
  PaginatedGameSimpleListList,
  PaginatedUserList,
} from "@/client";
import { useSearchInfiniteQuery, SearchCategory } from "@/features/games/hooks/useSearchQueries";
import { InfiniteData } from "@tanstack/react-query";
import { Route } from "@/routes/search";
import { useNavigate } from "@tanstack/react-router";
import { PageMeta } from "@/components/ui/PageMeta";
import { Box, Group, Skeleton, Stack, Text, Title, UnstyledButton, TextInput, Drawer } from "@mantine/core";
import { GridList } from "@/components/ui/GridList";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import { IconSearch, IconFilter } from "@tabler/icons-react";
import { Button } from "@/components/ui/Button";

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
          />
        );
      }
      default: {
        return null;
      }
    }
  };

  const columnCount = selectedCategory === "companies" ? 5 : 7;
  const rowHeight = selectedCategory === "companies" ? 220 : 300;

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

  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [searchInput, setSearchInput] = React.useState(searchParams.q ?? "");
  const [prevQ, setPrevQ] = React.useState(searchParams.q);

  if (searchParams.q !== prevQ) {
    setPrevQ(searchParams.q);
    setSearchInput(searchParams.q ?? "");
  }

  const { q, ...otherFilters } = searchParams;

  const queryKey = getQueryKey(selectedCategory);

  const filters: Record<string, unknown> = { ...otherFilters };
  delete filters.category; // prevent category from leaking into query object

  if (q?.trim()) {
    filters[queryKey] = q.trim();
  }

  const hasSearched = Boolean(q?.trim()) || Object.keys(otherFilters).length > 0;

  const {
    data: searchResults,
    error: errorFetchingData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useSearchInfiniteQuery(selectedCategory, filters, { enabled: hasSearched });

  const handleHeroSearch = (e?: React.SyntheticEvent) => {
    if (e) e.preventDefault();

    navigate({
      search: prev => ({
        ...prev,
        q: searchInput.trim() || undefined,
        category: selectedCategory,
      }),
      replace: true,
    });
  };

  const handleCategoryChange = (catId: SearchCategory) => {
    navigate({
      search: { category: catId },
      replace: true,
    });
    setSearchInput("");
  };

  const prepareFiltersForRequest = (data: SearchFilterValidatorsType) => {
    const filterData: Record<string, unknown> = {};

    for (const [key, value] of Object.entries(data)) {
      if (value === "" || value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
        continue;
      }
      Object.assign(filterData, { [key]: value instanceof Date ? value.toISOString().split("T")[0] : value });
    }

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

  const renderSearchContent = () => {
    if (!hasSearched) {
      return (
        <Stack
          align="center"
          justify="center"
          gap={24}
          style={{
            paddingBlock: "80px",
            textAlign: "center",
          }}
        >
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
            <IconSearch style={{ width: 40, height: 40, color: "var(--mantine-color-primary-5)" }} />
          </Box>
          <Stack gap={8}>
            <Title order={3} fz={24} fw={700} c="var(--color-text-900)">
              {t("search.readyToExplore")}
            </Title>
            <Text c="var(--color-text-500)" maw={384} mx="auto">
              {t(descKeys[selectedCategory])}
            </Text>
          </Stack>
        </Stack>
      );
    }

    if (isLoading && !isFetchingNextPage) {
      return (
        <GridList columnCount={selectedCategory === "companies" ? 5 : 7}>
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

    return (
      <Stack align="center" justify="center" c="var(--color-text-400)" style={{ paddingBlock: "80px" }}>
        <Text size="lg" fw={500}>
          {t("search.noResultsFound")}
        </Text>
      </Stack>
    );
  };

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <PageMeta title={t("search.title")} />
      <Stack gap={40} maw={1280} mx="auto" px={16}>
        <Stack align="center" gap={24}>
          <Title fz={36} fw={700} c="var(--color-text-900)" style={{ letterSpacing: "-0.025em" }}>
            {t("search.title")}
          </Title>

          <Group gap={4} p={4} style={{ background: "var(--color-background-300)", borderRadius: "12px" }}>
            {categories.map(cat => (
              <UnstyledButton
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                style={{
                  padding: "10px 32px",
                  fontSize: "14px",
                  fontWeight: 600,
                  borderRadius: "8px",
                  transition: "all 200ms",
                  ...(selectedCategory === cat.id
                    ? {
                        background: "white",
                        color: "var(--mantine-color-primary-6)",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
                      }
                    : { background: "transparent", color: "var(--color-text-600)" }),
                }}
              >
                {cat.label}
              </UnstyledButton>
            ))}
          </Group>

          <Box
            component="form"
            onSubmit={handleHeroSearch}
            style={{ width: "100%", maxWidth: "768px", display: "flex", gap: "12px" }}
          >
            <TextInput
              size="lg"
              placeholder={t(placeholderKeys[selectedCategory])}
              value={searchInput}
              onChange={e => setSearchInput(e.currentTarget.value)}
              leftSection={<IconSearch size={20} color="var(--color-text-400)" />}
              style={{ flex: 1 }}
              styles={{
                input: {
                  background: "white",
                  border: "1px solid var(--color-background-300)",
                  borderRadius: "12px",
                  boxShadow: "0 2px 4px rgba(0,0,0,0.02)",
                },
              }}
            />
            {selectedCategory === "games" && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setDrawerOpen(true)}
                style={{ borderRadius: "12px", padding: "0 24px", background: "white" }}
                leftSection={<IconFilter size={20} />}
              >
                {t("search.filtersButton")}
              </Button>
            )}
            <Button type="submit" size="lg" style={{ borderRadius: "12px", padding: "0 32px" }}>
              {t("search.searchButton")}
            </Button>
          </Box>
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
              initialFilters={otherFilters}
              onSubmitHandlerCallback={data => prepareFiltersForRequest(data)}
            />
          )}
        </Drawer>

        <Box
          style={{
            background: "white",
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid var(--color-background-200)",
            padding: "32px",
            minHeight: "850px",
            position: "relative",
          }}
        >
          {renderSearchContent()}
          {errorFetchingData && (
            <Box
              style={{
                background: "var(--color-error-50)",
                border: "1px solid var(--color-error-200)",
                borderRadius: "12px",
                padding: "16px",
                marginTop: "16px",
              }}
            >
              <Text ta="center" fw={500} c="var(--color-error-600)">
                {t("search.fetchError", { message: errorFetchingData.message })}
              </Text>
            </Box>
          )}
        </Box>
      </Stack>
    </Box>
  );
}
