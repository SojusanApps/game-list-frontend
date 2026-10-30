import { Carousel } from "@mantine/carousel";
import { Box, Group, SimpleGrid, Skeleton, Stack, Text, Title } from "@mantine/core";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameSimpleList } from "@/client";
import { Button } from "@/components/ui/Button";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { PageMeta } from "@/components/ui/PageMeta";
import { PageShell } from "@/components/ui/PageShell";
import { SectionHeader } from "@/components/ui/SectionHeader";
import { SITE_NAME, SITE_URL } from "@/config/site";
import { useAuth } from "@/features/auth";
import i18n from "@/lib/i18n";
import { formatDate } from "@/utils/dateUtils";

import { useGetGamesList, useGetReleaseCalendar } from "../hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";

import styles from "./HomePage.module.css";

function renderGameCarousel(games: GameSimpleList[] | undefined, isLoading: boolean): React.JSX.Element {
  if (isLoading) {
    return (
      <SimpleGrid cols={{ base: 2, sm: 3, md: 4, lg: 5, xl: 7 }} spacing="md">
        {Array.from({ length: 7 }).map((_, i) => {
          const skeletonKey = `game-skeleton-${i}`;
          return <Skeleton key={skeletonKey} style={{ aspectRatio: "264/374", width: "100%", borderRadius: 12 }} />;
        })}
      </SimpleGrid>
    );
  }

  const items = games?.slice(0, 14) ?? [];

  return (
    <Carousel
      emblaOptions={{ loop: true, align: "start", slidesToScroll: 1 }}
      slideSize={{ base: "50%", sm: "33.333%", md: "25%", lg: "20%", xl: "14.285%" }}
      slideGap="md"
      previousControlProps={{ "aria-label": i18n.t("games:home.carouselPrevious") }}
      nextControlProps={{ "aria-label": i18n.t("games:home.carouselNext") }}
      styles={{
        viewport: { overflowY: "visible", overflowX: "clip", padding: "0 16px" },
        container: { zIndex: 2 },
      }}
    >
      {items.map((game: GameSimpleList) => (
        <Carousel.Slide key={game.id} className={styles.slide}>
          <ItemOverlay
            style={{ width: "100%" }}
            name={game.title}
            itemPageUrl={`/game/${game.id}/${game.slug}`}
            itemCoverUrl={
              game.cover_image_id === undefined
                ? null
                : getIGDBImageURL(game.cover_image_id, IGDBImageSize.COVER_BIG_264_374)
            }
            gameType={game.game_type}
            releaseDate={game.release_date}
            rating={game.average_score}
          />
        </Carousel.Slide>
      ))}
    </Carousel>
  );
}

export default function HomePage(): React.JSX.Element {
  const { t } = useTranslation("games");
  const { isAuthenticated, login } = useAuth();
  const navigate = useNavigate();
  // Rolling next 7 days; computed once so the query key stays stable while the page is open.
  const [releaseWindow] = React.useState(() => {
    const today = new Date();
    const end = new Date(today);
    end.setDate(end.getDate() + 7);
    return { start_date: formatDate(today) ?? "", end_date: formatDate(end) ?? "" };
  });
  const { data: upcomingGames, isLoading: isUpcomingLoading } = useGetReleaseCalendar(releaseWindow);
  const { data: highestRatedGames, isLoading: isHighestRatedLoading } = useGetGamesList(
    { ordering: "rank_position" },
    { staleTime: 1000 * 60 * 60 * 24, gcTime: 1000 * 60 * 60 * 24 },
  );
  const { data: mostPopularGames, isLoading: isMostPopularLoading } = useGetGamesList(
    { ordering: "popularity" },
    { staleTime: 1000 * 60 * 60 * 24, gcTime: 1000 * 60 * 60 * 24 },
  );
  const { data: recentlyAddedGames, isLoading: isRecentlyAddedLoading } = useGetGamesList(
    { ordering: "-created_at" },
    { staleTime: 1000 * 60 * 60 * 24, gcTime: 1000 * 60 * 60 * 24 },
  );

  return (
    <PageShell width="wide">
      <PageMeta
        title={t("home.title")}
        description={t("home.metaDescription")}
        jsonLd={{
          "@context": "https://schema.org",
          "@type": "WebSite",
          name: SITE_NAME,
          url: `${SITE_URL}/`,
          potentialAction: {
            "@type": "SearchAction",
            target: `${SITE_URL}/search?q={search_term_string}`,
            "query-input": "required name=search_term_string",
          },
        }}
      />
      <Stack gap={64}>
        <Box component="header">
          <Title order={1} mb="xs">
            {t("home.heading")}
          </Title>
          <Text c="dimmed" maw={720}>
            {t("home.intro")}
          </Text>
          <Group mt="lg" gap="md">
            {!isAuthenticated && <Button onClick={() => login()}>{t("home.signIn")}</Button>}
            <Button onClick={() => navigate({ to: "/search" })} variant={isAuthenticated ? "default" : "outline"}>
              {t("home.browse")}
            </Button>
          </Group>
        </Box>

        <Box component="section">
          <SectionHeader
            title={t("home.highestRated")}
            subtitle={t("home.highestRatedSub")}
            viewMoreHref={{ to: "/search", search: { ordering: "rank_position", category: "games" } }}
          />
          {renderGameCarousel(highestRatedGames?.results, isHighestRatedLoading)}
        </Box>

        <Box component="section">
          <SectionHeader
            title={t("home.mostPopular")}
            subtitle={t("home.mostPopularSub")}
            viewMoreHref={{ to: "/search", search: { ordering: "popularity", category: "games" } }}
          />
          {renderGameCarousel(mostPopularGames?.results, isMostPopularLoading)}
        </Box>

        <Box component="section">
          <SectionHeader
            title={t("home.recentlyAdded")}
            subtitle={t("home.recentlyAddedSub")}
            viewMoreHref={{ to: "/search", search: { ordering: "-created_at", category: "games" } }}
          />
          {renderGameCarousel(recentlyAddedGames?.results, isRecentlyAddedLoading)}
        </Box>

        {(isUpcomingLoading || (upcomingGames?.length ?? 0) > 0) && (
          <Box component="section">
            <SectionHeader
              title={t("home.releasingSoon")}
              subtitle={t("home.releasingSoonSub")}
              viewMoreHref="/release-calendar"
            />
            {renderGameCarousel(upcomingGames, isUpcomingLoading)}
          </Box>
        )}
      </Stack>
    </PageShell>
  );
}
