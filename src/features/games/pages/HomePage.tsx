import { Carousel } from "@mantine/carousel";
import { Box, SimpleGrid, Skeleton, Stack } from "@mantine/core";
import Autoplay from "embla-carousel-autoplay";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameSimpleList } from "@/client";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { PageMeta } from "@/components/ui/PageMeta";
import { SectionHeader } from "@/components/ui/SectionHeader";

import { useGetGamesList } from "../hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";

import styles from "./HomePage.module.css";

const autoplayPlugin = () => Autoplay({ delay: 4000, stopOnInteraction: false, stopOnMouseEnter: true });

export default function HomePage(): React.JSX.Element {
  const { t } = useTranslation("games");
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

  const renderGameCarousel = (games: GameSimpleList[] | undefined, isLoading: boolean) => {
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
        plugins={[autoplayPlugin()]}
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
  };

  return (
    <Box py={48} style={{ minHeight: "100vh" }}>
      <PageMeta title={t("home.title")} />
      <Stack gap={64} maw={1280} mx="auto" px={16}>
        <Box component="section">
          <SectionHeader
            title={t("home.highestRated")}
            viewMoreHref={{ to: "/search", search: { ordering: "rank_position", category: "games" } }}
          />
          {renderGameCarousel(highestRatedGames?.results, isHighestRatedLoading)}
        </Box>

        <Box component="section">
          <SectionHeader
            title={t("home.mostPopular")}
            viewMoreHref={{ to: "/search", search: { ordering: "popularity", category: "games" } }}
          />
          {renderGameCarousel(mostPopularGames?.results, isMostPopularLoading)}
        </Box>

        <Box component="section">
          <SectionHeader
            title={t("home.recentlyAdded")}
            viewMoreHref={{ to: "/search", search: { ordering: "-created_at", category: "games" } }}
          />
          {renderGameCarousel(recentlyAddedGames?.results, isRecentlyAddedLoading)}
        </Box>
      </Stack>
    </Box>
  );
}
