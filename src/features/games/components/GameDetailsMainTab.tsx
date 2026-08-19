import { Box, Group, Skeleton, Stack, Text, Title } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";
import ReactMarkdown from "react-markdown";

import { Game, GameReview as GameReviewType, PaginatedGameReviewList } from "@/client";
import { Button } from "@/components/ui/Button";
import { TranslationSuggestionModal } from "@/features/translationSuggestions/components/TranslationSuggestionModal";

import GameReview from "../components/GameReview";
import { GameReviewModal } from "../components/GameReviewModal";
import GameStatistics from "../components/GameStatistics";
import RecommendationSummaryBar from "../components/RecommendationSummaryBar";

const REVIEWS_PREVIEW_COUNT = 3;

interface GameDetailsMainTabProps {
  gameDetails?: Game;
  gameReviewItems?: PaginatedGameReviewList;
  isGameReviewsLoading: boolean;
  isLoggedIn: boolean;
  userReview?: GameReviewType;
  gameSlug?: string;
}

export default function GameDetailsMainTab({
  gameDetails,
  gameReviewItems,
  isGameReviewsLoading,
  isLoggedIn,
  userReview,
  gameSlug,
}: Readonly<GameDetailsMainTabProps>) {
  const { t } = useTranslation("games");
  const [isReviewModalOpen, setIsReviewModalOpen] = React.useState(false);
  const [isSuggestionModalOpen, setIsSuggestionModalOpen] = React.useState(false);

  const otherReviews = React.useMemo(
    () => (gameReviewItems?.results ?? []).filter(r => r.id !== userReview?.id),
    [gameReviewItems?.results, userReview?.id],
  );

  const slotsForOthers = userReview ? REVIEWS_PREVIEW_COUNT - 1 : REVIEWS_PREVIEW_COUNT;
  const previewReviews = [...(userReview ? [userReview] : []), ...otherReviews.slice(0, slotsForOthers)];
  const hasMore = (gameReviewItems?.count ?? 0) > REVIEWS_PREVIEW_COUNT;

  return (
    <Stack gap={24} style={{ animation: "fadeIn 300ms ease" }}>
      <Box
        component="section"
        style={{
          background: "var(--color-background-100)",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid var(--color-background-200)",
          padding: "24px",
        }}
      >
        <Title order={2} fz="xl" fw={700} c="var(--color-text-900)" mb={16}>
          {t("mainTab.statistics")}
        </Title>
        <GameStatistics gameDetails={gameDetails} />
      </Box>

      <Box
        component="section"
        style={{
          background: "var(--color-background-100)",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid var(--color-background-200)",
          padding: "24px",
        }}
      >
        <Group justify="space-between" align="center" mb={8}>
          <Title order={2} fz="xl" fw={700} c="var(--color-text-900)">
            {t("mainTab.summary")}
          </Title>
          {isLoggedIn && gameDetails?.id && (
            <Button size="sm" onClick={() => setIsSuggestionModalOpen(true)}>
              {t("translationSuggestionModal.buttonLabel")}
            </Button>
          )}
        </Group>
        <Box c="var(--color-text-700)">
          <ReactMarkdown>{gameDetails?.summary || ""}</ReactMarkdown>
        </Box>
      </Box>

      <Box
        component="section"
        style={{
          background: "var(--color-background-100)",
          borderRadius: "12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
          border: "1px solid var(--color-background-200)",
          padding: "24px",
        }}
      >
        <Group justify="space-between" align="center" mb={16}>
          <Title order={2} fz="xl" fw={700} c="var(--color-text-900)">
            {t("mainTab.reviews")}
          </Title>
          {isLoggedIn && gameDetails?.id && (
            <Button size="sm" onClick={() => setIsReviewModalOpen(true)}>
              {userReview ? t("reviewModal.editTitle") : t("reviewModal.addTitle")}
            </Button>
          )}
        </Group>
        <Stack gap={16}>
          <RecommendationSummaryBar counts={gameReviewItems?.recommendation_counts} />
          {isGameReviewsLoading && <Skeleton h={96} radius="xl" />}
          {previewReviews.length > 0 ? (
            <>
              {previewReviews.map(gameReview => (
                <GameReview key={gameReview.id} gameReview={gameReview} />
              ))}
              {hasMore && gameDetails?.id && gameSlug && (
                <Group justify="center" mt={8}>
                  <Link
                    to="/game/$id/$slug/reviews"
                    params={{ id: String(gameDetails.id), slug: gameSlug }}
                    style={{
                      color: "var(--color-primary-600)",
                      fontWeight: 600,
                      fontSize: 14,
                      textDecoration: "underline",
                    }}
                  >
                    {t("mainTab.viewMoreReviews")}
                  </Link>
                </Group>
              )}
            </>
          ) : (
            !isGameReviewsLoading && (
              <Text c="dimmed" fs="italic">
                {t("review.noReviews")}
              </Text>
            )
          )}
        </Stack>
      </Box>

      {gameDetails?.id && (
        <GameReviewModal
          gameId={gameDetails.id}
          existingReviewId={userReview?.id}
          existingReviewText={userReview?.review}
          existingRecommendation={userReview?.recommendation}
          opened={isReviewModalOpen}
          onClose={() => setIsReviewModalOpen(false)}
        />
      )}

      {gameDetails?.id && (
        <TranslationSuggestionModal
          gameId={gameDetails.id}
          currentTitle={gameDetails.title}
          currentSummary={gameDetails.summary ?? ""}
          opened={isSuggestionModalOpen}
          onClose={() => setIsSuggestionModalOpen(false)}
        />
      )}
    </Stack>
  );
}
