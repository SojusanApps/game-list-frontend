import { Box, Group, Pagination, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { getRouteApi, Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { PageMeta } from "@/components/ui/PageMeta";
import { useCurrentUserId } from "@/features/auth";
import { useAuth } from "@/features/auth/context/AuthProvider";

import GameReview from "../components/GameReview";
import { GameReviewModal } from "../components/GameReviewModal";
import { useGetGameReviewsList, useGetGamesDetails } from "../hooks/gameQueries";

const PAGE_SIZE = 10;

const routeApi = getRouteApi("/game_/$id/$slug/reviews");

export default function GameReviewsPage(): React.JSX.Element {
  const { t } = useTranslation("games");
  const { id, slug } = routeApi.useParams();
  const gameId = Number(id);

  const [page, setPage] = React.useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);

  const { isAuthenticated } = useAuth();
  const currentUserId = useCurrentUserId();

  const { data: gameDetails } = useGetGamesDetails(gameId);
  const { data: gameReviewItems, isLoading } = useGetGameReviewsList(
    { game: String(gameId), page },
    { enabled: !!gameId },
  );
  const { data: userReviewData } = useGetGameReviewsList(
    { game: String(gameId), user: String(currentUserId) },
    { enabled: !!gameId && !!currentUserId },
  );
  const userReview = userReviewData?.results?.[0];

  const otherReviews = React.useMemo(
    () => (gameReviewItems?.results ?? []).filter(r => r.id !== userReview?.id),
    [gameReviewItems?.results, userReview?.id],
  );

  const totalPages = Math.ceil((gameReviewItems?.count ?? 0) / PAGE_SIZE);

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <Stack maw={800} mx="auto" px={16} gap={24}>
        <PageMeta title={t("reviewsPage.pageTitle", { game: gameDetails?.title ?? "" })} />

        <Group justify="space-between" align="center">
          <Group gap={12} align="center">
            <Link
              to="/game/$id/$slug"
              params={{ id, slug }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                color: "var(--color-primary-600)",
                fontWeight: 600,
                fontSize: 14,
                textDecoration: "none",
              }}
            >
              <IconArrowLeft size={16} />
              {gameDetails?.title ?? t("reviewsPage.backToGame")}
            </Link>
          </Group>
          {isAuthenticated && (
            <Button size="sm" onClick={() => setIsReviewModalOpen(true)}>
              {userReview ? t("reviewModal.editTitle") : t("reviewModal.addTitle")}
            </Button>
          )}
        </Group>

        <Title order={1} fz={{ base: 24, md: 32 }} fw={700} c="var(--color-text-900)">
          {t("reviewsPage.title")}
          {gameDetails?.title && (
            <Text component="span" fw={400} c="var(--color-text-500)" fz="inherit">
              {" — "}
              {gameDetails.title}
            </Text>
          )}
        </Title>

        <Stack gap={16}>
          {userReview && <GameReview gameReview={userReview} />}
          {isLoading && (
            <>
              <Skeleton h={120} radius="xl" />
              <Skeleton h={120} radius="xl" />
              <Skeleton h={120} radius="xl" />
            </>
          )}
          {!isLoading && !userReview && otherReviews.length === 0 && (
            <Text c="dimmed" fs="italic">
              {t("review.noReviews")}
            </Text>
          )}
          {!isLoading && otherReviews.map(gameReview => <GameReview key={gameReview.id} gameReview={gameReview} />)}
        </Stack>

        {totalPages > 1 && (
          <Group justify="center">
            <Pagination total={totalPages} value={page} onChange={setPage} />
          </Group>
        )}
      </Stack>

      {!!gameId && (
        <GameReviewModal
          gameId={gameId}
          existingReviewId={userReview?.id}
          existingReviewText={userReview?.review}
          opened={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
    </Box>
  );
}
