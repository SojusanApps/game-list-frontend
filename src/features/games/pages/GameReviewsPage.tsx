import { Box, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import { IconArrowLeft } from "@tabler/icons-react";
import { getRouteApi, Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { PageMeta } from "@/components/ui/PageMeta";
import { derivePageCount, LIST_PAGE_SIZE, PaginationControls } from "@/components/ui/PaginatedTable";
import { useCurrentUserId, useRequireAuth } from "@/features/auth";

import GameReview from "../components/GameReview";
import { GameReviewModal } from "../components/GameReviewModal";
import RecommendationSummaryBar from "../components/RecommendationSummaryBar";
import ReviewLanguageFilter from "../components/ReviewLanguageFilter";
import { useGetGameReviewsList, useGetGamesDetails } from "../hooks/gameQueries";
import {
  getDefaultReviewLanguageFilter,
  isReviewLanguageFilter,
  reviewLanguageQuery,
  type ReviewLanguageFilter as ReviewLanguageFilterValue,
} from "../utils/reviewLanguage";

const routeApi = getRouteApi("/game_/$id/$slug/reviews");

export default function GameReviewsPage(): React.JSX.Element {
  const { t, i18n } = useTranslation("games");
  const { id, slug } = routeApi.useParams();
  const { language: languageParam } = routeApi.useSearch();
  const navigate = useNavigate();
  const languageFilter = isReviewLanguageFilter(languageParam)
    ? languageParam
    : getDefaultReviewLanguageFilter(i18n.language);
  const gameId = Number(id);

  const [page, setPage] = React.useState(1);
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);

  const requireAuth = useRequireAuth();
  const currentUserId = useCurrentUserId();

  const { data: gameDetails } = useGetGamesDetails(gameId);
  const { data: gameReviewItems, isLoading } = useGetGameReviewsList(
    { game: String(gameId), page, ...reviewLanguageQuery(languageFilter) },
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

  const handleLanguageFilterChange = (next: ReviewLanguageFilterValue) => {
    setPage(1);
    void navigate({ to: ".", search: prev => ({ ...prev, language: next }), replace: true });
  };

  const totalPages = derivePageCount({ count: gameReviewItems?.count, pageSize: LIST_PAGE_SIZE, page });

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
          <Button size="sm" onClick={() => requireAuth(() => setIsReviewModalOpen(true))}>
            {userReview ? t("reviewModal.editTitle") : t("reviewModal.addTitle")}
          </Button>
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

        <ReviewLanguageFilter value={languageFilter} onChange={handleLanguageFilterChange} />

        <RecommendationSummaryBar counts={gameReviewItems?.recommendation_counts} />

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
              {languageFilter === "all" ? t("review.noReviews") : t("review.noReviewsInLanguage")}
            </Text>
          )}
          {!isLoading && otherReviews.map(gameReview => <GameReview key={gameReview.id} gameReview={gameReview} />)}
        </Stack>

        <PaginationControls page={page} totalPages={totalPages} onPageChange={setPage} />
      </Stack>

      {!!gameId && (
        <GameReviewModal
          gameId={gameId}
          existingReviewId={userReview?.id}
          existingReviewText={userReview?.review}
          existingRecommendation={userReview?.recommendation}
          existingLanguage={userReview?.language}
          opened={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}
    </Box>
  );
}
