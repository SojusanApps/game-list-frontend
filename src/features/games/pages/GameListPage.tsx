import {
  Box,
  Button,
  Divider,
  Drawer,
  Group,
  Indicator,
  Skeleton,
  Stack,
  Text,
  TextInput,
  Title,
  ActionIcon,
} from "@mantine/core";
import { IconEdit, IconFilter, IconDownload, IconSearch, IconUpload } from "@tabler/icons-react";
import { keepPreviousData } from "@tanstack/react-query";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation, Trans } from "react-i18next";

import { GameList, GameListStatusEnum } from "@/client";
import { GridList } from "@/components/ui/GridList";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { ListViewModeToggle } from "@/components/ui/ListViewModeToggle";
import { PageMeta } from "@/components/ui/PageMeta";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import { useIsOwner } from "@/features/auth";
import { useGetUserDetails } from "@/features/users/hooks/userQueries";
import { useListViewStore } from "@/lib/listViewStore";

import { exportGameList } from "../api/game";
import { createGameListColumns } from "../components/gameListColumns";
import { GameListModal } from "../components/GameListModal";
import GameSearchFilter, { ValidationSchema as GameSearchFilterSchema } from "../components/GameSearchFilter";
import { useGetGameListsList } from "../hooks/gameQueries";
import { useGameListInfiniteQuery, useRandomPtpGame, GameListGameFilters } from "../hooks/useGameListQueries";
import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";
import { STATUS_CONFIG } from "../utils/statusConfig";

interface GameListItemProps {
  gameListItem: GameList;
  isOwner: boolean;
  onEdit: (gameId: number) => void;
}

interface EditActionProps {
  gameId: number;
  onEdit: (gameId: number) => void;
}

function EditAction({ gameId, onEdit }: Readonly<EditActionProps>) {
  return (
    <ActionIcon
      variant="filled"
      color="var(--mantine-color-primary-6)"
      size="md"
      radius="xl"
      onClick={e => {
        e.preventDefault();
        e.stopPropagation();
        onEdit(gameId);
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
  );
}

function renderEditActionSlot(hovered: boolean, gameId: number, onEdit: (id: number) => void) {
  return hovered ? <EditAction gameId={gameId} onEdit={onEdit} /> : null;
}

const GameListGridItem = React.memo(({ gameListItem, isOwner, onEdit }: GameListItemProps) => {
  return (
    <ItemOverlay
      name={gameListItem.title}
      itemPageUrl={`/game/${gameListItem.game_id}/${gameListItem.game_slug}`}
      itemCoverUrl={getIGDBImageURL(gameListItem.game_cover_image, IGDBImageSize.COVER_BIG_264_374)}
      status={gameListItem.status_code}
      rating={gameListItem.score}
      actionSlot={isOwner ? hovered => renderEditActionSlot(hovered, gameListItem.game_id, onEdit) : undefined}
    />
  );
});
GameListGridItem.displayName = "GameListGridItem";

const routeApi = getRouteApi("/game-list/$id/$slug");

export default function GameListPage(): React.JSX.Element {
  const { id } = routeApi.useParams();
  const userId = Number(id);
  const isOwner = useIsOwner(userId);

  const { data: userDetails, isLoading: isUserLoading } = useGetUserDetails(userId);
  const [selectedGameStatus, setSelectedGameStatus] = React.useState<GameListStatusEnum | null>(null);
  const { t } = useTranslation("games");
  const navigate = useNavigate();
  const renderMode = useListViewStore(state => state.mode);
  const [filterDrawerOpen, setFilterDrawerOpen] = React.useState(false);
  const [gameFilters, setGameFilters] = React.useState<GameListGameFilters>({});
  const [titleInput, setTitleInput] = React.useState("");
  const [page, setPage] = React.useState(1);

  // Any status or filter change restarts pagination.
  React.useEffect(() => {
    setPage(1);
  }, [selectedGameStatus, gameFilters]);

  const {
    data: gameListResults,
    error: errorFetchingData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGameListInfiniteQuery(userId, selectedGameStatus, gameFilters, { enabled: renderMode === "infinite" });

  const tableQuery = useGetGameListsList(
    { user: String(userId), status: selectedGameStatus ?? undefined, ...gameFilters, page },
    { enabled: renderMode === "table" && !!userId, placeholderData: keepPreviousData },
  );

  const activeFilterCount = Object.values(gameFilters).filter(v =>
    Array.isArray(v) ? v.length > 0 : v !== undefined && v !== "",
  ).length;

  const handleApplyFilters = (data: GameSearchFilterSchema) => {
    const filters: GameListGameFilters = {};
    for (const [key, value] of Object.entries(data)) {
      if (key === "ordering") {
        continue;
      }
      if (value === "" || value === undefined || value === null || (Array.isArray(value) && value.length === 0)) {
        continue;
      }
      (filters as Record<string, unknown>)[key] = value instanceof Date ? value.toISOString().split("T")[0] : value;
    }
    setGameFilters(filters);
    setFilterDrawerOpen(false);
  };

  const [shouldFetchRandomPtp, setShouldFetchRandomPtp] = React.useState(false);
  const [editingGameId, setEditingGameId] = React.useState<number | null>(null);

  const {
    data: randomPtpGame,
    isLoading: isRandomPtpLoading,
    refetch: refetchRandomPtpGame,
  } = useRandomPtpGame(userId, shouldFetchRandomPtp);

  const handlePickRandomPtp = () => {
    if (shouldFetchRandomPtp) {
      refetchRandomPtpGame();
    } else {
      setShouldFetchRandomPtp(true);
    }
  };

  const pageTitle = isUserLoading
    ? t("gameList.loading")
    : t("gameList.pageTitle", { username: userDetails?.username });

  const allItems = gameListResults?.pages.flatMap(resultPage => resultPage.results) || [];

  const listColumns = React.useMemo(
    () => createGameListColumns({ t, isOwner, onEdit: setEditingGameId }),
    [t, isOwner],
  );

  const displayError = renderMode === "table" ? tableQuery.error : errorFetchingData;

  const statuses: { id: GameListStatusEnum | null; label: string; emoji: string; color: string }[] = [
    { id: null, label: t("gameList.all"), emoji: "♾️", color: "gray" },
    {
      id: GameListStatusEnum.P,
      label: STATUS_CONFIG[GameListStatusEnum.P].label,
      emoji: STATUS_CONFIG[GameListStatusEnum.P].emoji,
      color: "teal",
    },
    {
      id: GameListStatusEnum.C,
      label: STATUS_CONFIG[GameListStatusEnum.C].label,
      emoji: STATUS_CONFIG[GameListStatusEnum.C].emoji,
      color: "indigo",
    },
    {
      id: GameListStatusEnum.PTP,
      label: STATUS_CONFIG[GameListStatusEnum.PTP].label,
      emoji: STATUS_CONFIG[GameListStatusEnum.PTP].emoji,
      color: "gray",
    },
    {
      id: GameListStatusEnum.OH,
      label: STATUS_CONFIG[GameListStatusEnum.OH].label,
      emoji: STATUS_CONFIG[GameListStatusEnum.OH].emoji,
      color: "orange",
    },
    {
      id: GameListStatusEnum.D,
      label: STATUS_CONFIG[GameListStatusEnum.D].label,
      emoji: STATUS_CONFIG[GameListStatusEnum.D].emoji,
      color: "red",
    },
  ];

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
            onEdit={setEditingGameId}
          />
        )}
      />
    );
  };

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <PageMeta title={pageTitle} />
      <Stack gap={40} maw={1280} mx="auto" px={16}>
        <Stack align="center" gap={24}>
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

          <Box
            component="form"
            w="100%"
            maw={480}
            onSubmit={e => {
              e.preventDefault();
              setGameFilters(prev => ({ ...prev, title: titleInput.trim() || undefined }));
            }}
          >
            <TextInput
              placeholder={t("filter.titlePlaceholder")}
              value={titleInput}
              onChange={e => setTitleInput(e.currentTarget.value)}
              onBlur={() => setGameFilters(prev => ({ ...prev, title: titleInput.trim() || undefined }))}
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
            w="100%"
            pos="relative"
            display={{ base: "flex", sm: "block" }}
            style={{ flexDirection: "column", alignItems: "center" }}
            pr={{ sm: isOwner ? 210 : 90 }}
          >
            <Group justify="center" wrap="wrap" gap={8}>
              {statuses.map(status => (
                <Button
                  key={String(status.id)}
                  variant={selectedGameStatus === status.id ? "filled" : "light"}
                  color={status.color}
                  size="md"
                  radius="xl"
                  onClick={() => setSelectedGameStatus(status.id)}
                  leftSection={<span>{status.emoji}</span>}
                  style={{
                    border: `2px solid var(--mantine-color-${status.color}-${selectedGameStatus === status.id ? "7" : "4"})`,
                    transition: "border-color 0.2s ease",
                  }}
                >
                  {status.label}
                </Button>
              ))}
            </Group>

            <Group
              gap={8}
              mt={{ base: 16, sm: 0 }}
              pos={{ base: "static", sm: "absolute" }}
              right={{ sm: 0 }}
              top={{ sm: "50%" }}
              style={{ transform: "translateY(var(--y-translate, 0))" }}
              className="view-toggle-group"
            >
              <style>{`
                @media (min-width: 48em) {
                  .view-toggle-group {
                    --y-translate: -50%;
                  }
                }
              `}</style>
              {isOwner && (
                <>
                  <ActionIcon
                    variant="light"
                    color="gray"
                    size="lg"
                    radius="md"
                    title={t("export.title")}
                    onClick={async () => {
                      const data = await exportGameList();
                      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
                      const url = URL.createObjectURL(blob);
                      window.open(url, "_blank");
                    }}
                  >
                    <IconDownload size={20} />
                  </ActionIcon>
                  <Link to="/import">
                    <ActionIcon variant="light" color="gray" size="lg" radius="md" title={t("import.title")}>
                      <IconUpload size={20} />
                    </ActionIcon>
                  </Link>
                  <Divider orientation="vertical" />
                </>
              )}
              <Indicator
                label={activeFilterCount}
                size={16}
                disabled={activeFilterCount === 0}
                color="var(--mantine-color-primary-6)"
              >
                <ActionIcon
                  variant={activeFilterCount > 0 ? "filled" : "light"}
                  color={activeFilterCount > 0 ? "indigo" : "gray"}
                  size="lg"
                  radius="md"
                  title={t("search.filtersButton")}
                  onClick={() => setFilterDrawerOpen(true)}
                >
                  <IconFilter size={20} />
                </ActionIcon>
              </Indicator>
              <Divider orientation="vertical" />
              <ListViewModeToggle />
            </Group>
          </Box>
        </Stack>

        {isOwner && selectedGameStatus === GameListStatusEnum.PTP && (
          <Box
            style={{
              background: "var(--color-ptp-callout-bg)",
              borderRadius: "16px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
              border: "1px solid var(--color-ptp-callout-border)",
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <Text fw={600} fz="lg" c="var(--color-text-900)" ta="center">
              {t("gameList.randomPtp")}
            </Text>
            <Button
              onClick={handlePickRandomPtp}
              loading={isRandomPtpLoading}
              variant="filled"
              color="indigo"
              size="md"
            >
              {t("gameList.pickRandom")}
            </Button>
            {shouldFetchRandomPtp && randomPtpGame && (
              <Box style={{ width: "264px", marginTop: "16px" }}>
                <ItemOverlay
                  name={randomPtpGame.title}
                  itemPageUrl={`/game/${randomPtpGame.game_id}/${randomPtpGame.game_slug}`}
                  itemCoverUrl={getIGDBImageURL(randomPtpGame.game_cover_image, IGDBImageSize.COVER_BIG_264_374)}
                  status={randomPtpGame.status_code}
                  rating={randomPtpGame.score}
                />
              </Box>
            )}
            {shouldFetchRandomPtp && !isRandomPtpLoading && !randomPtpGame && (
              <Text c="red" fw={500} ta="center">
                {t("gameList.noRandomPtp")}
              </Text>
            )}
          </Box>
        )}

        <Box
          style={{
            background: "var(--color-background-100)",
            borderRadius: "16px",
            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
            border: "1px solid var(--color-background-200)",
            padding: "24px",
            minHeight: "850px",
          }}
        >
          {renderContent()}
          {displayError && (
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
                {t("gameList.fetchError", { message: displayError.message })}
              </Text>
            </Box>
          )}
        </Box>
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
          showOrdering={false}
          datePickerWithinPortal
          initialFilters={gameFilters as Record<string, unknown>}
          onSubmitHandlerCallback={handleApplyFilters}
        />
      </Drawer>

      {editingGameId && <GameListModal gameId={editingGameId} opened={true} onClose={() => setEditingGameId(null)} />}
    </Box>
  );
}
