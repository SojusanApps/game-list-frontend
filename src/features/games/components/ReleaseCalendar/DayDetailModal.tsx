import { Modal, Loader, Center, Text } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import type { GameSimpleList } from "@/client/types.gen";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import { formatDisplayDate } from "@/utils/dateUtils";

import { useGetGamesInfinite } from "../../hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "../../utils/IGDBIntegration";

interface DayDetailModalProps {
  opened: boolean;
  onClose: () => void;
  dateStr: string; // YYYY-MM-DD
}

export default function DayDetailModal({ opened, onClose, dateStr }: Readonly<DayDetailModalProps>): React.JSX.Element {
  const { t } = useTranslation("games");
  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useGetGamesInfinite(
    {
      release_date_after: dateStr,
      release_date_before: dateStr,
      // @ts-expect-error generated type doesn't support comma-separated sort values, but API requires them
      ordering: ["release_date,-popularity"],
    },
    { enabled: opened },
  );

  const games = React.useMemo(() => data?.pages.flatMap(page => page.results) ?? [], [data]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <Center py="xl">
          <Loader />
        </Center>
      );
    }
    if (isError) {
      return <Text c="red">{t("calendar.dayFailedToLoad")}</Text>;
    }
    if (games.length === 0) {
      return (
        <Text c="dimmed" ta="center" py="xl">
          {t("calendar.dayNoReleases")}
        </Text>
      );
    }

    return (
      <VirtualGridList
        items={games}
        hasNextPage={hasNextPage || false}
        isFetchingNextPage={isFetchingNextPage}
        fetchNextPage={() => {
          if (hasNextPage) {
            fetchNextPage();
          }
        }}
        columnCount={5}
        rowHeight={360}
        gap={6}
        style={{ height: "60vh", margin: 0, padding: "16px" }}
        renderItem={(game: GameSimpleList) => (
          <ItemOverlay
            key={game.id}
            itemPageUrl={`/game/${game.id}/${game.slug}`}
            itemCoverUrl={
              game.cover_image_id ? getIGDBImageURL(game.cover_image_id, IGDBImageSize.COVER_BIG_264_374) : null
            }
            name={game.title}
            variant="cover"
            gameType={game.game_type}
            releaseDate={game.release_date ?? null}
            rating={game.average_score}
            status={game.game_status}
          />
        )}
      />
    );
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Text size="xl" fw={600}>
          {t("calendar.releasesFor")}{" "}
          <Text span c="var(--color-primary-500)" fw={800}>
            {formatDisplayDate(dateStr)}
          </Text>
        </Text>
      }
      size="1200px"
      centered
    >
      {renderContent()}
    </Modal>
  );
}
