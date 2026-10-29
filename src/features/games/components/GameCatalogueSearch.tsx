import { Badge, Drawer, Group, Loader, Stack, Text, TextInput } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconFilter, IconSearch } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameSimpleList } from "@/client";
import { Button } from "@/components/ui/Button";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { VirtualGridList } from "@/components/ui/VirtualGridList";

import { GameGamesListDataQuery } from "../api/game";
import { useGetGamesInfinite } from "../hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";
import { cleanGameFilters } from "../utils/searchFilters";
import GameSearchFilter from "./GameSearchFilter";

interface GameCatalogueSearchProps {
  search: string;
  onSearchChange: (search: string) => void;
  filters: Record<string, unknown>;
  onFiltersChange: (filters: Record<string, unknown>) => void;
  /** Called with the game the user clicked. */
  onSelect: (game: GameSimpleList) => void;
  /** Marks games that are already on the user's list with a badge. */
  isListed?: (game: GameSimpleList) => boolean;
  /** Disables the controls and shows `idleMessage` instead of results. */
  disabled?: boolean;
  idleMessage?: React.ReactNode;
  placeholder?: string;
  columnCount?: number;
  gridHeight?: number | string;
}

/**
 * Catalogue game search with the Search Engine's filters: a text input, a filters
 * drawer and a grid of results to pick from. The search text and filters are
 * owned by the parent.
 */
export const GameCatalogueSearch = ({
  search,
  onSearchChange,
  filters,
  onFiltersChange,
  onSelect,
  isListed,
  disabled = false,
  idleMessage,
  placeholder,
  columnCount = 3,
  gridHeight = 680,
}: GameCatalogueSearchProps) => {
  const { t } = useTranslation("games");
  const [drawerOpen, setDrawerOpen] = React.useState(false);
  const [debouncedSearch] = useDebouncedValue(search.trim(), 300);

  const filterCount = Object.keys(filters).length;
  const canSearch = !disabled && (debouncedSearch.length > 1 || filterCount > 0);

  const {
    data: searchData,
    isLoading: isSearching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetGamesInfinite(
    { ...filters, ...(debouncedSearch.length > 1 ? { title: debouncedSearch } : {}) } as GameGamesListDataQuery,
    { enabled: canSearch },
  );
  const searchResults = React.useMemo(() => searchData?.pages.flatMap(page => page.results) ?? [], [searchData]);

  const renderResults = () => {
    if (disabled) {
      return (
        <Text c="dimmed" ta="center" py={48}>
          {idleMessage}
        </Text>
      );
    }
    if (!canSearch) {
      return (
        <Text c="dimmed" ta="center" py={48}>
          {t("search.typeToSearch")}
        </Text>
      );
    }
    if (isSearching) {
      return (
        <Group justify="center" py={24}>
          <Loader size="sm" />
        </Group>
      );
    }
    if (searchResults.length === 0) {
      return (
        <Text c="dimmed" ta="center" py={48}>
          {t("search.noResultsFound")}
        </Text>
      );
    }
    return (
      <VirtualGridList
        items={searchResults}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        columnCount={columnCount}
        rowHeight={260}
        style={{ height: gridHeight }}
        renderItem={(game: GameSimpleList) => (
          <ItemOverlay
            key={game.id}
            name={game.title}
            itemCoverUrl={
              game.cover_image_id ? getIGDBImageURL(game.cover_image_id, IGDBImageSize.COVER_BIG_264_374) : null
            }
            gameType={game.game_type}
            releaseDate={game.release_date}
            rating={game.average_score}
            onClick={() => onSelect(game)}
            actionSlot={
              isListed?.(game) ? (
                <Badge
                  variant="light"
                  color="gray"
                  size="sm"
                  style={{ position: "absolute", top: 8, right: 8, zIndex: 20 }}
                >
                  {t("import.alreadyInList")}
                </Badge>
              ) : undefined
            }
          />
        )}
      />
    );
  };

  return (
    <Stack gap={24}>
      <Group gap={8} wrap="nowrap">
        <TextInput
          style={{ flex: 1 }}
          placeholder={placeholder ?? t("search.placeholderGames")}
          leftSection={<IconSearch size={16} />}
          value={search}
          onChange={event => onSearchChange(event.currentTarget.value)}
          disabled={disabled}
        />
        <Button
          variant="outline"
          leftSection={<IconFilter size={16} />}
          disabled={disabled}
          onClick={() => setDrawerOpen(true)}
        >
          {filterCount > 0 ? `${t("search.filtersButton")} (${filterCount})` : t("search.filtersButton")}
        </Button>
      </Group>

      {renderResults()}

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
        <GameSearchFilter
          showIgdbId
          initialFilters={filters}
          onSubmitHandlerCallback={data => {
            onFiltersChange(cleanGameFilters(data));
            setDrawerOpen(false);
          }}
        />
      </Drawer>
    </Stack>
  );
};
