import * as React from "react";
import { useTranslation } from "react-i18next";
import { getRouteApi } from "@tanstack/react-router";
import { GameListModal } from "../components/GameListModal";
import GameInformation from "../components/GameInformation";
import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";
import {
  useGetGameReviewsList,
  useGetGamesDetails,
  useGetGameListByFilters,
  useGetGameFollowsList,
  useCreateGameFollow,
  useDeleteGameFollow,
} from "../hooks/gameQueries";
import { ActionIcon, Box, Grid, Group, Skeleton, Stack, Tabs, Title, Tooltip } from "@mantine/core";
import { PageMeta } from "@/components/ui/PageMeta";
import { SafeImage } from "@/components/ui/SafeImage";
import GameDetailsMainTab from "../components/GameDetailsMainTab";
import GameDetailsRelatedTab from "../components/GameDetailsRelatedTab";
import GameDetailsScreenshotsTab from "../components/GameDetailsScreenshotsTab";
import ScreenshotModal from "../components/ScreenshotModal";
import AddToCollectionModal from "@/features/collections/components/AddToCollectionModal";
import { useAuth } from "@/features/auth/context/AuthProvider";
import { useCurrentUserId } from "@/features/auth";
import { Button } from "@/components/ui/Button";
import { IconBell, IconBellFilled } from "@tabler/icons-react";

const routeApi = getRouteApi("/game/$id/$slug");

function GameFollowButton({ gameId, userId }: Readonly<{ gameId: number; userId: number }>) {
  const { t } = useTranslation("games");
  const { data: userGameFollows, isPending: isGameFollowsPending } = useGetGameFollowsList({
    game: String(gameId),
    user: String(userId),
  });

  const isFollowing = userGameFollows?.count !== undefined && userGameFollows.count > 0;
  const gameFollowId = userGameFollows?.results?.[0]?.id;

  const { mutate: createGameFollow, isPending: isCreatingGameFollow } = useCreateGameFollow();
  const { mutate: deleteGameFollow, isPending: isDeletingGameFollow } = useDeleteGameFollow();

  const handleToggleFollow = () => {
    if (isFollowing && gameFollowId) {
      deleteGameFollow(gameFollowId);
    } else {
      createGameFollow({ game: gameId, user: userId });
    }
  };

  return (
    <Tooltip label={isFollowing ? t("detail.unfollowGame") : t("detail.followGame")}>
      <ActionIcon
        size="xl"
        variant="subtle"
        color={isFollowing ? "primary" : "gray"}
        onClick={handleToggleFollow}
        loading={isGameFollowsPending || isCreatingGameFollow || isDeletingGameFollow}
        radius="xl"
      >
        {isFollowing ? <IconBellFilled size={24} /> : <IconBell size={24} />}
      </ActionIcon>
    </Tooltip>
  );
}

function UserGameActions({
  gameId,
  userId,
  setIsListModalOpen,
  setIsCollectionModalOpen,
}: Readonly<{
  gameId: number;
  userId: number;
  setIsListModalOpen: (val: boolean) => void;
  setIsCollectionModalOpen: (val: boolean) => void;
}>) {
  const { t } = useTranslation("games");
  const { data: userGameList, isPending: isUserGameListPending } = useGetGameListByFilters(
    { game: String(gameId), user: String(userId) },
    { enabled: !!gameId && !!userId },
  );

  const listButtonText = userGameList?.id ? t("detail.editListEntry") : t("detail.addListEntry");

  return (
    <Stack gap={8}>
      {isUserGameListPending ? (
        <Skeleton h={36} w="100%" style={{ borderRadius: 8 }} />
      ) : (
        <Button onClick={() => setIsListModalOpen(true)} fullWidth>
          {listButtonText}
        </Button>
      )}
      <Button onClick={() => setIsCollectionModalOpen(true)} variant="outline" fullWidth>
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
  const { data: gameReviewItems, isLoading: isGameReviewsLoading } = useGetGameReviewsList(
    { game: String(gameId) },
    { enabled: !!gameId },
  );

  const [activeTab, setActiveTab] = React.useState<"main" | "related" | "screenshots">("main");
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
  const { t } = useTranslation("games");

  const pageTitle = isGameDetailsLoading ? t("detail.loading") : gameDetails?.title;

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <Grid gap="md" maw={1152} mx="auto" px={16}>
        <PageMeta title={pageTitle} description={gameDetails?.summary} />

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

                {isAuthenticated && currentUserId && (
                  <UserGameActions
                    gameId={gameId}
                    userId={currentUserId}
                    setIsListModalOpen={setIsListModalOpen}
                    setIsCollectionModalOpen={setIsCollectionModalOpen}
                  />
                )}

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
                    {isAuthenticated && currentUserId && <GameFollowButton gameId={gameId} userId={currentUserId} />}
                  </Group>
                </Group>

                <Tabs
                  value={activeTab}
                  onChange={val => {
                    if (val) setActiveTab(val as typeof activeTab);
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
            onClose={() => setSelectedScreenshot(null)}
          />
        )}

        {isCollectionModalOpen && !!gameId && (
          <AddToCollectionModal gameId={gameId} onClose={() => setIsCollectionModalOpen(false)} />
        )}

        {!!gameId && (
          <GameListModal gameId={gameId} opened={isListModalOpen} onClose={() => setIsListModalOpen(false)} />
        )}
      </Grid>
    </Box>
  );
}
