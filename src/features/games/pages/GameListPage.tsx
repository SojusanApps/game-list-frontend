import {
  Box,
  Drawer,
  Group,
  Indicator,
  Menu,
  Select,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  ActionIcon,
  Tooltip,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { notifications } from "@mantine/notifications";
import {
  IconDice5,
  IconDots,
  IconDownload,
  IconEdit,
  IconFilter,
  IconSearch,
  IconUpload,
  IconX,
} from "@tabler/icons-react";
import { keepPreviousData } from "@tanstack/react-query";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation, Trans } from "react-i18next";

import { GameList, GameListStatusEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { GridList } from "@/components/ui/GridList";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { ListViewModeToggle } from "@/components/ui/ListViewModeToggle";
import { PageMeta } from "@/components/ui/PageMeta";
import { PageShell } from "@/components/ui/PageShell";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { Panel } from "@/components/ui/Panel";
import { SafeImage } from "@/components/ui/SafeImage";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import { useIsOwner } from "@/features/auth";
import { useGetUserDetails } from "@/features/users/hooks/userQueries";
import { useUrlState } from "@/hooks/useUrlState";
import { useListViewStore } from "@/lib/listViewStore";
import { GRID_BOX_STYLE } from "@/utils/gridLayout";
import { formatMeanScore } from "@/utils/ratingUtils";

import { exportGameList } from "../api/game";
import { ActiveFilterChips } from "../components/ActiveFilterChips";
import { createGameListColumns } from "../components/gameListColumns";
import { GameListModal } from "../components/GameListModal";
import { GameListNote } from "../components/GameListNote";
import { GameListStatusTabs } from "../components/GameListStatusTabs";
import GameSearchFilter, { ValidationSchema as GameSearchFilterSchema } from "../components/GameSearchFilter";
import { RandomPtpModal } from "../components/RandomPtpModal";
import { useGetGameListsList, usePartialUpdateGameList } from "../hooks/gameQueries";
import { useGameListInfiniteQuery, GameListGameFilters } from "../hooks/useGameListQueries";
import {
  buildGameListFilters,
  countActiveGameListFilters,
  DEFAULT_GAME_LIST_ORDERING,
  isGameListOrdering,
} from "../utils/gameListOrdering";
import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";
import { STATUS_CONFIG } from "../utils/statusConfig";
import { StatusIcon } from "../utils/StatusIcon";

const STATUS_VALUES = Object.values(GameListStatusEnum) as GameListStatusEnum[];

interface GameListItemProps {
  gameListItem: GameList;
  isOwner: boolean;
  ownerUsername?: string;
  onEdit: (gameId: number) => void;
}

interface QuickActionsProps {
  gameListItem: GameList;
  onEdit: (gameId: number) => void;
}

/** Quick status change plus the full edit modal, so the common case doesn't need the modal. */
function QuickActions({ gameListItem, onEdit }: Readonly<QuickActionsProps>) {
  const { t } = useTranslation("games");
  const { mutate: updateEntry } = usePartialUpdateGameList();

  return (
    <Menu position="top-end" withinPortal shadow="md" width={220}>
      <Menu.Target>
        <ActionIcon
          variant="filled"
          color="var(--mantine-color-primary-6)"
          size="md"
          radius="xl"
          aria-label={t("modal.editTitle")}
          onClick={e => {
            e.preventDefault();
            e.stopPropagation();
          }}
          style={{
            position: "absolute",
            bottom: "16px",
            right: "16px",
            zIndex: 20,
            boxShadow: "0 4px 6px rgba(0,0,0,0.3)",
          }}
        >
          <IconEdit size={16} />
        </ActionIcon>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Label>{t("gameList.quick.changeStatus")}</Menu.Label>
        {STATUS_VALUES.map(status => (
          <Menu.Item
            key={status}
            disabled={status === gameListItem.status_code}
            leftSection={<StatusIcon status={status} size={16} neon />}
            onClick={() => updateEntry({ id: gameListItem.id, body: { status }, title: gameListItem.title })}
          >
            {STATUS_CONFIG[status].label}
          </Menu.Item>
        ))}
        <Menu.Divider />
        <Menu.Item leftSection={<IconEdit size={16} />} onClick={() => onEdit(gameListItem.game_id)}>
          {t("gameList.quick.editDetails")}
        </Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}

const GameListGridItem = React.memo(({ gameListItem, isOwner, ownerUsername, onEdit }: GameListItemProps) => {
  return (
    <ItemOverlay
      name={gameListItem.title}
      itemPageUrl={`/game/${gameListItem.game_id}/${gameListItem.game_slug}`}
      itemCoverUrl={getIGDBImageURL(gameListItem.game_cover_image, IGDBImageSize.COVER_BIG_264_374)}
      status={gameListItem.status_code}
      rating={gameListItem.score}
      actionSlot={
        gameListItem.description ? (
          <Box style={{ position: "absolute", bottom: 16, left: 16, zIndex: 20 }}>
            <GameListNote gameListItem={gameListItem} isOwner={isOwner} ownerUsername={ownerUsername} />
          </Box>
        ) : undefined
      }
      revealedActionSlot={isOwner ? <QuickActions gameListItem={gameListItem} onEdit={onEdit} /> : undefined}
    />
  );
});
GameListGridItem.displayName = "GameListGridItem";

const routeApi = getRouteApi("/game-list/$id/$slug");

const FILTER_KEYS = [
  "developer",
  "publisher",
  "platforms",
  "genres",
  "game_engines",
  "game_modes",
  "game_status",
  "game_type",
  "player_perspectives",
  "release_date_after",
  "release_date_before",
] as const;

export default function GameListPage(): React.JSX.Element {
  const { id } = routeApi.useParams();
  const userId = Number(id);
  const isOwner = useIsOwner(userId);

  const { data: userDetails, isLoading: isUserLoading } = useGetUserDetails(userId);
  const { search, update } = useUrlState();
  const selectedGameStatus = (search.status as GameListStatusEnum | undefined) ?? null;
  const setSelectedGameStatus = (status: GameListStatusEnum | null) => update({ status: status ?? undefined });
  const { t } = useTranslation("games");
  const navigate = useNavigate();
  const renderMode = useListViewStore(state => state.mode);
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);
  const searchSnapshot = JSON.stringify(search);
  const gameFilters = React.useMemo<GameListGameFilters>(() => {
    const current = JSON.parse(searchSnapshot) as Record<string, unknown>;
    const filters: Record<string, unknown> = {};
    for (const key of FILTER_KEYS) {
      if (current[key] !== undefined) filters[key] = current[key];
    }
    filters.ordering = isGameListOrdering(current.ordering) ? current.ordering : DEFAULT_GAME_LIST_ORDERING;
    return filters as GameListGameFilters;
  }, [searchSnapshot]);
  // Replaces every filter at once (the drawer applies them together); `undefined` clears a key from the URL.
  const setGameFilters = (next: GameListGameFilters) =>
    update({
      ...Object.fromEntries(FILTER_KEYS.map(key => [key, undefined])),
      ...next,
      ordering: next.ordering === DEFAULT_GAME_LIST_ORDERING ? undefined : next.ordering,
    });
  const [titleInput, setTitleInput] = React.useState(typeof search.q === "string" ? search.q : "");
  const [debouncedTitle] = useDebouncedValue(titleInput, 300);
  React.useEffect(() => {
    const next = debouncedTitle.trim() || undefined;
    if (next !== (search.q as string | undefined)) update({ q: next });
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only the debounced input should drive the URL
  }, [debouncedTitle]);
  const queryFilters = React.useMemo(
    () => ({ ...gameFilters, title: debouncedTitle.trim() || undefined }),
    [gameFilters, debouncedTitle],
  );
  // Status, filter and title changes drop `page` from the URL, which restarts pagination.
  const page = typeof search.page === "number" ? search.page : 1;
  const setPage = (next: number) => update({ page: next === 1 ? undefined : next }, { keepPage: true });

  const {
    data: gameListResults,
    error: errorFetchingData,
    refetch,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGameListInfiniteQuery(userId, selectedGameStatus, queryFilters, { enabled: renderMode === "infinite" });

  const tableQuery = useGetGameListsList(
    { user: String(userId), status: selectedGameStatus ?? undefined, ...queryFilters, page },
    { enabled: renderMode === "table" && !!userId, placeholderData: keepPreviousData },
  );

  const activeFilterCount = countActiveGameListFilters(gameFilters);
  const isNarrowed = activeFilterCount > 0 || !!selectedGameStatus || !!queryFilters.title;
  const resultCount = renderMode === "table" ? tableQuery.data?.count : gameListResults?.pages[0]?.count;

  const handleApplyFilters = (data: GameSearchFilterSchema) => {
    setGameFilters(buildGameListFilters(data));
    setFilterDrawerOpen(false);
  };

  const clearFilters = () => {
    update({ ...Object.fromEntries(FILTER_KEYS.map(key => [key, undefined])), status: undefined, q: undefined });
    setTitleInput("");
  };

  const removeFilter = (key: keyof GameListGameFilters) => {
    update({ [key]: undefined });
  };

  const [isExporting, setIsExporting] = React.useState(false);
  const handleExport = async () => {
    setIsExporting(true);
    try {
      const data = await exportGameList();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "game-list.json";
      link.click();
      URL.revokeObjectURL(url);
      notifications.show({ message: t("export.success"), color: "green" });
    } catch {
      notifications.show({ message: t("export.failed"), color: "red" });
    } finally {
      setIsExporting(false);
    }
  };

  const [randomModalOpen, setRandomModalOpen] = React.useState(false);
  const [editingGameId, setEditingGameId] = React.useState<number | null>(null);

  const pageTitle = isUserLoading
    ? t("gameList.loading")
    : t("gameList.pageTitle", { username: userDetails?.username });

  const allItems = gameListResults?.pages.flatMap(resultPage => resultPage.results) || [];

  const listColumns = React.useMemo(
    () => createGameListColumns({ t, isOwner, ownerUsername: userDetails?.username, onEdit: setEditingGameId }),
    [t, isOwner, userDetails?.username],
  );

  const displayError = renderMode === "table" ? tableQuery.error : errorFetchingData;

  const orderingOptions = [
    { value: "title", label: t("filter.titleAsc") },
    { value: "-title", label: t("filter.titleDesc") },
    { value: "-score", label: t("filter.scoreDesc") },
    { value: "score", label: t("filter.scoreAsc") },
  ];

  const renderEmptyState = () => {
    if (isNarrowed) {
      return (
        <Stack align="center" gap={16} py={64}>
          <Text fw={600} fz="lg" c="var(--color-text-900)">
            {t("gameList.noMatch.title")}
          </Text>
          <Button variant="light" onClick={clearFilters}>
            {t("gameList.noMatch.clear")}
          </Button>
        </Stack>
      );
    }
    if (!isOwner) {
      return (
        <Text ta="center" c="dimmed" py={64}>
          {t("gameList.empty.otherUser")}
        </Text>
      );
    }
    return (
      <Stack align="center" gap={16} py={64}>
        <Text fw={700} fz="xl" c="var(--color-text-900)">
          {t("gameList.empty.title")}
        </Text>
        <Text c="dimmed" ta="center" maw={420}>
          {t("gameList.empty.description")}
        </Text>
        <Group>
          <Button component={Link} to="/search">
            {t("gameList.empty.browse")}
          </Button>
          <Button component={Link} to="/import" variant="light">
            {t("gameList.empty.import")}
          </Button>
        </Group>
      </Stack>
    );
  };

  const renderContent = () => {
    if (renderMode === "table") {
      return (
        <PaginatedTable
          columns={listColumns}
          data={tableQuery.data?.results ?? []}
          count={tableQuery.data?.count ?? 0}
          page={page}
          onPageChange={setPage}
          getRowId={row => String(row.id)}
          isLoading={tableQuery.isLoading}
          isFetching={tableQuery.isFetching}
          emptyLabel={t("gameList.table.empty")}
          onRowClick={row =>
            navigate({ to: "/game/$id/$slug", params: { id: String(row.game_id), slug: row.game_slug } })
          }
        />
      );
    }

    if (isLoading && !isFetchingNextPage) {
      return (
        <GridList>
          {Array.from({ length: 21 }).map((_, i) => {
            const skeletonKey = `game-skeleton-${i}`;
            return (
              <Skeleton key={skeletonKey} style={{ aspectRatio: "264/374", width: "100%", borderRadius: "12px" }} />
            );
          })}
        </GridList>
      );
    }

    if (allItems.length === 0 && !displayError) {
      return renderEmptyState();
    }

    return (
      <VirtualGridList
        items={allItems}
        hasNextPage={!!hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={fetchNextPage}
        renderItem={(gameListItem: GameList) => (
          <GameListGridItem
            key={gameListItem.id}
            gameListItem={gameListItem}
            isOwner={isOwner}
            ownerUsername={userDetails?.username}
            onEdit={setEditingGameId}
          />
        )}
      />
    );
  };

  return (
    <PageShell width="wide">
      <PageMeta title={pageTitle} />
      <Stack gap={32}>
        <Stack align="center" gap={20}>
          <Title
            order={1}
            fz={{ base: 30, md: 36 }}
            fw={700}
            c="var(--color-text-900)"
            ta="center"
            style={{ letterSpacing: "-0.025em" }}
          >
            <Trans
              i18nKey="gameList.title"
              ns="games"
              values={{ username: userDetails?.username }}
              components={[<span style={{ color: "var(--mantine-color-primary-6)" }} key="username" />]}
            />
          </Title>

          {userDetails && (
            <Group gap={12} justify="center">
              <SafeImage
                src={userDetails.gravatar_url || undefined}
                alt={t("gameList.stats.avatarAlt", { username: userDetails.username })}
                style={{ width: 40, height: 40, borderRadius: 9999 }}
              />
              <Text size="sm" c="dimmed">
                {t("gameList.resultCount", { count: userDetails.game_list_statistics.total })}
                {userDetails.game_list_statistics.mean_score > 0 &&
                  ` · ${t("gameList.stats.mean", { score: formatMeanScore(userDetails.game_list_statistics.mean_score) })}`}
              </Text>
            </Group>
          )}

          <GameListStatusTabs
            value={selectedGameStatus}
            onChange={setSelectedGameStatus}
            statistics={userDetails?.game_list_statistics}
          />

          <Group w="100%" gap={12} align="center" wrap="wrap">
            <TextInput
              style={{ flex: "1 1 240px" }}
              placeholder={t("filter.titlePlaceholder")}
              aria-label={t("filter.titlePlaceholder")}
              value={titleInput}
              onChange={e => setTitleInput(e.currentTarget.value)}
              leftSection={<IconSearch size={18} color="var(--color-text-400)" />}
              rightSection={
                titleInput ? (
                  <ActionIcon
                    variant="subtle"
                    color="gray"
                    size="sm"
                    aria-label={t("searchBar.clear")}
                    onClick={() => setTitleInput("")}
                  >
                    <IconX size={16} />
                  </ActionIcon>
                ) : null
              }
              styles={{
                input: {
                  background: "var(--color-background-100)",
                  border: "1px solid var(--color-background-300)",
                  borderRadius: "12px",
                },
              }}
            />
            <Select
              aria-label={t("gameList.sortLabel")}
              value={gameFilters.ordering ?? DEFAULT_GAME_LIST_ORDERING}
              onChange={value =>
                update({
                  ordering: isGameListOrdering(value) && value !== DEFAULT_GAME_LIST_ORDERING ? value : undefined,
                })
              }
              data={orderingOptions}
              allowDeselect={false}
              w={{ base: "100%", sm: 220 }}
              styles={{
                input: {
                  background: "var(--color-background-100)",
                  border: "1px solid var(--color-background-300)",
                  borderRadius: "12px",
                },
              }}
            />
            <Group gap={8} wrap="nowrap">
              <Indicator
                label={activeFilterCount}
                size={16}
                disabled={activeFilterCount === 0}
                color="var(--mantine-color-primary-6)"
              >
                <Tooltip label={t("search.filtersButton")} withArrow>
                  <ActionIcon
                    variant={activeFilterCount > 0 ? "filled" : "light"}
                    color={activeFilterCount > 0 ? "indigo" : "gray"}
                    size="lg"
                    radius="md"
                    aria-label={t("search.filtersButton")}
                    onClick={() => setFilterDrawerOpen(true)}
                  >
                    <IconFilter size={20} />
                  </ActionIcon>
                </Tooltip>
              </Indicator>
              <ListViewModeToggle />
              {isOwner && (
                <>
                  <Tooltip label={t("gameList.pickRandom")} withArrow>
                    <ActionIcon
                      variant="light"
                      color="gray"
                      size="lg"
                      radius="md"
                      aria-label={t("gameList.pickRandom")}
                      onClick={() => setRandomModalOpen(true)}
                    >
                      <IconDice5 size={20} />
                    </ActionIcon>
                  </Tooltip>
                  <Menu position="bottom-end" shadow="md">
                    <Menu.Target>
                      <Tooltip label={t("gameList.moreActions")} withArrow>
                        <ActionIcon
                          variant="light"
                          color="gray"
                          size="lg"
                          radius="md"
                          loading={isExporting}
                          aria-label={t("gameList.moreActions")}
                        >
                          <IconDots size={20} />
                        </ActionIcon>
                      </Tooltip>
                    </Menu.Target>
                    <Menu.Dropdown>
                      <Menu.Item component={Link} to="/import" leftSection={<IconUpload size={16} />}>
                        {t("import.title")}
                      </Menu.Item>
                      <Menu.Item leftSection={<IconDownload size={16} />} onClick={handleExport}>
                        {t("export.title")}
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </>
              )}
            </Group>
          </Group>

          <ActiveFilterChips filters={gameFilters} onRemove={removeFilter} onClearAll={clearFilters} />

          {resultCount !== undefined && (
            <Text size="sm" c="dimmed" aria-live="polite">
              {t("gameList.resultCount", { count: resultCount })}
            </Text>
          )}
        </Stack>

        <Panel
          style={{
            ...GRID_BOX_STYLE,
          }}
        >
          {displayError ? (
            <ErrorState onRetry={() => (renderMode === "table" ? tableQuery.refetch() : refetch())} />
          ) : (
            renderContent()
          )}
        </Panel>
      </Stack>

      <Drawer
        opened={filterDrawerOpen}
        onClose={() => setFilterDrawerOpen(false)}
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
          orderingOptions={orderingOptions}
          orderingClearable={false}
          datePickerWithinPortal
          initialFilters={gameFilters as Record<string, unknown>}
          onSubmitHandlerCallback={handleApplyFilters}
        />
      </Drawer>

      {isOwner && <RandomPtpModal userId={userId} opened={randomModalOpen} onClose={() => setRandomModalOpen(false)} />}

      {editingGameId && <GameListModal gameId={editingGameId} opened={true} onClose={() => setEditingGameId(null)} />}
    </PageShell>
  );
}
