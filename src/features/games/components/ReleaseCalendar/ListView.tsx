import { Center, Loader, Text, Group, Stack } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import * as React from "react";
import { useTranslation } from "react-i18next";

import type { GameSimpleList } from "@/client/types.gen";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { VirtualGridList } from "@/components/ui/VirtualGridList";

import { useGetGamesInfinite } from "../../hooks/gameQueries";
import { formatISODate, getEndOfMonth } from "../../utils/calendarUtils";
import IGDBImageSize, { getIGDBImageURL } from "../../utils/IGDBIntegration";

export default function ListView(): React.JSX.Element {
  const { t } = useTranslation("games");
  const [dateAfter, setDateAfter] = React.useState<string | null>(() => formatISODate(new Date()));
  const [dateBefore, setDateBefore] = React.useState<string | null>(() => formatISODate(getEndOfMonth(new Date())));

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useGetGamesInfinite({
    // @ts-expect-error generated type doesn't support comma-separated sort values, but API requires them
    ordering: ["release_date,-popularity"],
    release_date_after: dateAfter ?? undefined,
    release_date_before: dateBefore ?? undefined,
  });

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
      return (
        <Center py="xl">
          <Text c="red">{t("calendar.listLoadError")}</Text>
        </Center>
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
        rowHeight={320}
        gap={16}
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
            showFullReleaseDate={true}
            rating={game.average_score}
            status={game.game_status}
          />
        )}
      />
    );
  };

  return (
    <Stack gap={48}>
      <Group>
        <DateInput
          label={t("calendar.fromDate")}
          description={t("calendar.fromDateDesc")}
          placeholder={t("calendar.pickDate")}
          value={dateAfter}
          onChange={setDateAfter}
          clearable
          valueFormat="YYYY-MM-DD"
        />
        <DateInput
          label={t("calendar.toDate")}
          description={t("calendar.toDateDesc")}
          placeholder={t("calendar.pickDate")}
          value={dateBefore}
          onChange={setDateBefore}
          clearable
          valueFormat="YYYY-MM-DD"
        />
      </Group>
      {renderContent()}
    </Stack>
  );
}
