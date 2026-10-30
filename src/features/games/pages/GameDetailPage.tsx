import { ActionIcon, Box, Grid, Group, Menu, Skeleton, Stack, Tabs, Title, Tooltip } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconBell, IconBellFilled, IconChevronDown } from "@tabler/icons-react";
import { getRouteApi, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameListStatusEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import { PageMeta } from "@/components/ui/PageMeta";
import { PageShell } from "@/components/ui/PageShell";
import { SafeImage } from "@/components/ui/SafeImage";
import { SITE_URL } from "@/config/site";
import { useCurrentUserId, useRequireAuth } from "@/features/auth";
import { useAuth } from "@/features/auth/context/AuthProvider";
import AddToCollectionModal from "@/features/collections/components/AddToCollectionModal";

import GameDetailsMainTab from "../components/GameDetailsMainTab";
import GameDetailsRelatedTab from "../components/GameDetailsRelatedTab";
import GameDetailsScreenshotsTab from "../components/GameDetailsScreenshotsTab";
import GameInformation from "../components/GameInformation";
import { GameListModal } from "../components/GameListModal";
import ScreenshotModal from "../components/ScreenshotModal";
import {
  useGetGameReviewsList,
  useGetGamesDetails,
  useGetGameListByFilters,
  useGetGameFollowsList,
  useCreateGameFollow,
  useDeleteGameFollow,
  useCreateGameList,
  usePartialUpdateGameList,
} from "../hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";
import {
  getDefaultReviewLanguageFilter,
  reviewLanguageQuery,
  type ReviewLanguageFilter as ReviewLanguageFilterValue,
} from "../utils/reviewLanguage";
import { STATUS_CONFIG } from "../utils/statusConfig";
import { StatusIcon } from "../utils/StatusIcon";

const routeApi = getRouteApi("/game/$id/$slug");

const STATUS_VALUES = Object.values(GameListStatusEnum) as GameListStatusEnum[];

function GameFollowButton({ gameId, userId }: Readonly<{ gameId: number; userId: number | null }>) {
  const { t } = useTranslation("games");
  const requireAuth = useRequireAuth();
  const { data: userGameFollows, isPending: isGameFollowsPending } = useGetGameFollowsList(
    { game: String(gameId), user: String(userId ?? -1) },
    { enabled: !!userId },
  );

  const isFollowing = userGameFollows?.count !== undefined && userGameFollows.count > 0;
  const gameFollowId = userGameFollows?.results?.[0]?.id;

  const { mutate: createGameFollow, isPending: isCreatingGameFollow } = useCreateGameFollow();
  const { mutate: deleteGameFollow, isPending: isDeletingGameFollow } = useDeleteGameFollow();

  const handleToggleFollow = () => {
    if (isFollowing && gameFollowId) {
      deleteGameFollow(gameFollowId);
    } else {
      createGameFollow({ game: gameId });
    }
  };

  return (
    <Tooltip label={isFollowing ? t("detail.unfollowGame") : t("detail.followGame")}>
      <ActionIcon
        size="xl"
        variant="subtle"
        color={isFollowing ? "primary" : "gray"}
        onClick={() => requireAuth(handleToggleFollow, "follow")}
        loading={!!userId && (isGameFollowsPending || isCreatingGameFollow || isDeletingGameFollow)}
        radius="xl"
        aria-label={isFollowing ? t("detail.unfollowGame") : t("detail.followGame")}
      >
        {isFollowing ? <IconBellFilled size={24} /> : <IconBell size={24} />}
      </ActionIcon>
    </Tooltip>
  );
}

function UserGameActions({
  gameId,
  gameTitle,
  userId,
  setIsListModalOpen,
  setIsCollectionModalOpen,
}: Readonly<{
  gameId: number;
  gameTitle?: string;
  userId: number | null;
  setIsListModalOpen: (val: boolean) => void;
  setIsCollectionModalOpen: (val: boolean) => void;
}>) {
  const { t } = useTranslation("games");
  const requireAuth = useRequireAuth();
  const { data: userGameList, isPending: isUserGameListPending } = useGetGameListByFilters(
    { game: String(gameId), user: String(userId ?? -1) },
    { enabled: !!gameId && !!userId },
  );

  const { mutate: createEntry } = useCreateGameList();
  const { mutate: updateEntry } = usePartialUpdateGameList();

  const setStatus = (status: GameListStatusEnum) => {
    if (userGameList?.id) {
      updateEntry({ id: userGameList.id, body: { status }, title: gameTitle });
    } else {
      createEntry(
        { body: { game: gameId, status, owned_on: [] }, title: gameTitle },
        {
          onSuccess: () =>
            notifications.show({
              message: t("detail.addedToList", { status: STATUS_CONFIG[status].label }),
              autoClose: 4000,
            }),
        },
      );
    }
  };

  const listButtonText = userGameList?.id ? t("detail.editListEntry") : t("detail.addListEntry");

  return (
    <Stack gap={8}>
      {isUserGameListPending && userId ? (
        <Skeleton h={36} w="100%" style={{ borderRadius: 8 }} />
      ) : (
        <Group gap={2} wrap="nowrap">
          <Button
            style={{ flex: 1, borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
            onClick={() =>
              requireAuth(
                () => (userGameList?.id ? setIsListModalOpen(true) : setStatus(GameListStatusEnum.PTP)),
                "addToList",
              )
            }
          >
            {listButtonText}
          </Button>
          <Menu position="bottom-end" shadow="md" width={220}>
            <Menu.Target>
              <Button
                aria-label={t("detail.setStatus")}
                size="icon"
                style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                onClick={() => {
                  if (!userId) {
                    requireAuth(() => {}, "addToList");
                  }
                }}
              >
                <IconChevronDown size={16} />
              </Button>
            </Menu.Target>
            {userId && (
              <Menu.Dropdown>
                <Menu.Label>{t("detail.setStatus")}</Menu.Label>
                {STATUS_VALUES.map(status => (
                  <Menu.Item
                    key={status}
                    disabled={status === userGameList?.status_code}
                    leftSection={<StatusIcon status={status} size={16} neon />}
                    onClick={() => setStatus(status)}
                  >
                    {STATUS_CONFIG[status].label}
                  </Menu.Item>
                ))}
              </Menu.Dropdown>
            )}
          </Menu>
        </Group>
      )}
      <Button
        onClick={() => requireAuth(() => setIsCollectionModalOpen(true), "addToCollection")}
        variant="outline"
        style={{ width: "100%" }}
      >
        {t("detail.addToCollection")}
      </Button>
    </Stack>
  );
}

function GameDetailSkeleton() {
  return (
    <>
      <Grid.Col span={{ base: 12, md: 3 }}>
        <Stack gap={16}>
          <Skeleton w="100%" h={256} style={{ borderRadius: 12 }} />
          <Skeleton w="100%" h={128} style={{ borderRadius: 12 }} />
          <Skeleton w="100%" h={192} style={{ borderRadius: 12 }} />
        </Stack>
      </Grid.Col>
      <Grid.Col span={{ base: 12, md: 9 }}>
        <Stack gap={16}>
          <Skeleton w="50%" h={32} style={{ borderRadius: 8 }} />
          <Skeleton w="100%" h={128} style={{ borderRadius: 12 }} />
          <Skeleton w="100%" h={96} style={{ borderRadius: 12 }} />
        </Stack>
      </Grid.Col>
    </>
  );
}

export default function GameDetailPage(): React.JSX.Element {
  const { id, slug } = routeApi.useParams();
  const gameId = Number(id);

  const { data: gameDetails, isLoading: isGameDetailsLoading } = useGetGamesDetails(gameId);
  const { t, i18n } = useTranslation("games");
  const [reviewLanguageFilter, setReviewLanguageFilter] = React.useState<ReviewLanguageFilterValue>(() =>
    getDefaultReviewLanguageFilter(i18n.language),
  );
  const { data: gameReviewItems, isLoading: isGameReviewsLoading } = useGetGameReviewsList(
    { game: String(gameId), ...reviewLanguageQuery(reviewLanguageFilter) },
    { enabled: !!gameId },
  );

  const { tab } = routeApi.useSearch();
  const navigate = useNavigate({ from: "/game/$id/$slug" });
  const activeTab = tab ?? "main";
  const [selectedScreenshot, setSelectedScreenshot] = React.useState<string | null>(null);
  const [isCollectionModalOpen, setIsCollectionModalOpen] = React.useState(false);
  const [isListModalOpen, setIsListModalOpen] = React.useState(false);
  const { isAuthenticated } = useAuth();
  const currentUserId = useCurrentUserId();

  const { data: userReviewData } = useGetGameReviewsList(
    { game: String(gameId), user: String(currentUserId) },
    { enabled: !!gameId && !!currentUserId },
  );
  const userReview = userReviewData?.results?.[0];

  const pageTitle = isGameDetailsLoading ? t("detail.loading") : gameDetails?.title;

  const coverUrl = gameDetails?.cover_image_id
    ? getIGDBImageURL(gameDetails.cover_image_id, IGDBImageSize.COVER_BIG_264_374)
    : undefined;
  const gameJsonLd = gameDetails
    ? {
        "@context": "https://schema.org",
        "@type": "VideoGame",
        name: gameDetails.title,
        url: `${SITE_URL}/game/${gameDetails.id}/${gameDetails.slug ?? ""}`,
        ...(gameDetails.summary && { description: gameDetails.summary }),
        ...(coverUrl && { image: coverUrl }),
        ...(gameDetails.release_date && { datePublished: gameDetails.release_date }),
        ...(gameDetails.genres?.length && { genre: gameDetails.genres.map(genre => genre.name) }),
        ...(gameDetails.platforms?.length && { gamePlatform: gameDetails.platforms.map(platform => platform.name) }),
        ...(gameDetails.developer && { author: { "@type": "Organization", name: gameDetails.developer.name } }),
        ...(gameDetails.publisher && { publisher: { "@type": "Organization", name: gameDetails.publisher.name } }),
      }
    : undefined;

  return (
    <PageShell width="default">
      <Grid gap="md">
        <PageMeta title={pageTitle} description={gameDetails?.summary} image={coverUrl} jsonLd={gameJsonLd} />

        {isGameDetailsLoading ? (
          <GameDetailSkeleton />
        ) : (
          <>
            <Grid.Col span={{ base: 12, md: 3 }}>
              <Stack gap={16}>
                <Box
                  style={{
                    borderRadius: 12,
                    overflow: "hidden",
                    boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
                  }}
                >
                  <SafeImage
                    style={{ width: "100%", objectFit: "cover", aspectRatio: "264/374", display: "block" }}
                    src={
                      gameDetails?.cover_image_id
                        ? `${getIGDBImageURL(gameDetails.cover_image_id, IGDBImageSize.COVER_BIG_264_374)}`
                        : undefined
                    }
                    alt={gameDetails?.title}
                  />
                </Box>

                <UserGameActions
                  gameId={gameId}
                  gameTitle={gameDetails?.title}
                  userId={currentUserId}
                  setIsListModalOpen={setIsListModalOpen}
                  setIsCollectionModalOpen={setIsCollectionModalOpen}
                />

                <GameInformation gameDetails={gameDetails} />
              </Stack>
            </Grid.Col>

            <Grid.Col span={{ base: 12, md: 9 }}>
              <Stack gap={24}>
                <Group justify="space-between" align="center">
                  <Group gap={16} align="center">
                    <Title
                      order={1}
                      fz={{ base: 28, md: 36 }}
                      fw={700}
                      c="var(--color-text-900)"
                      style={{ letterSpacing: "-0.025em" }}
                    >
                      {gameDetails?.title}
                    </Title>
                    <GameFollowButton gameId={gameId} userId={currentUserId} />
                  </Group>
                </Group>

                <Tabs
                  value={activeTab}
                  onChange={val => {
                    if (val) {
                      void navigate({
                        search: prev => ({ ...prev, tab: val === "main" ? undefined : (val as typeof activeTab) }),
                        replace: true,
                      });
                    }
                  }}
                  keepMounted={false}
                >
                  <Tabs.List>
                    <Tabs.Tab value="main">{t("detail.tabMain")}</Tabs.Tab>
                    <Tabs.Tab value="related">{t("detail.tabRelated")}</Tabs.Tab>
                    <Tabs.Tab value="screenshots">{t("detail.tabScreenshots")}</Tabs.Tab>
                  </Tabs.List>
                  <Tabs.Panel value="main" pt="md">
                    <GameDetailsMainTab
                      gameDetails={gameDetails}
                      gameReviewItems={gameReviewItems}
                      isGameReviewsLoading={isGameReviewsLoading}
                      isLoggedIn={isAuthenticated}
                      userReview={userReview}
                      reviewLanguageFilter={reviewLanguageFilter}
                      onReviewLanguageFilterChange={setReviewLanguageFilter}
                      gameSlug={slug}
                    />
                  </Tabs.Panel>
                  <Tabs.Panel value="related" pt="md">
                    <GameDetailsRelatedTab gameDetails={gameDetails} />
                  </Tabs.Panel>
                  <Tabs.Panel value="screenshots" pt="md">
                    <GameDetailsScreenshotsTab gameDetails={gameDetails} onScreenshotClick={setSelectedScreenshot} />
                  </Tabs.Panel>
                </Tabs>
              </Stack>
            </Grid.Col>
          </>
        )}

        {selectedScreenshot && gameDetails?.screenshots && (
          <ScreenshotModal
            initialScreenshot={selectedScreenshot}
            screenshots={gameDetails.screenshots}
            gameTitle={gameDetails.title}
            onClose={() => setSelectedScreenshot(null)}
          />
        )}

        {isCollectionModalOpen && !!gameId && (
          <AddToCollectionModal gameId={gameId} onClose={() => setIsCollectionModalOpen(false)} />
        )}

        {!!gameId && (
          <GameListModal
            gameId={gameId}
            gameTitle={gameDetails?.title}
            opened={isListModalOpen}
            onClose={() => setIsListModalOpen(false)}
          />
        )}
      </Grid>
    </PageShell>
  );
}
