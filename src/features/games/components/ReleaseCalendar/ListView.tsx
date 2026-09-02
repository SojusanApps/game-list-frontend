import { Center, Loader, Text, Group, Stack } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import type { GameSimpleList } from "@/client/types.gen";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { ListViewModeToggle } from "@/components/ui/ListViewModeToggle";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import { useListViewStore } from "@/lib/listViewStore";

import { createGameColumns } from "../../components/gameSearchColumns";
import { useGetGamesInfinite, useGetGamesList } from "../../hooks/gameQueries";
import { formatISODate, getEndOfMonth } from "../../utils/calendarUtils";
import IGDBImageSize, { getIGDBImageURL } from "../../utils/IGDBIntegration";

export default function ListView(): React.JSX.Element {
  const { t } = useTranslation("games");
  const navigate = useNavigate();
  const renderMode = useListViewStore(state => state.mode);

  const [dateAfter, setDateAfter] = React.useState<string | null>(() => formatISODate(new Date()));
  const [dateBefore, setDateBefore] = React.useState<string | null>(() => formatISODate(getEndOfMonth(new Date())));
  const [page, setPage] = React.useState(1);

  // Any change to the date range restarts pagination.
  React.useEffect(() => {
    setPage(1);
  }, [dateAfter, dateBefore]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } = useGetGamesInfinite(
    {
      // @ts-expect-error generated type doesn't support comma-separated sort values, but API requires them
      ordering: ["release_date,-popularity"],
      release_date_after: dateAfter ?? undefined,
      release_date_before: dateBefore ?? undefined,
    },
    { enabled: renderMode === "infinite" },
  );

  const tableQuery = useGetGamesList(
    {
      // @ts-expect-error generated type doesn't support comma-separated sort values, but API requires them
      ordering: ["release_date,-popularity"],
      release_date_after: dateAfter ?? undefined,
      release_date_before: dateBefore ?? undefined,
      page,
    },
    { enabled: renderMode === "table", placeholderData: keepPreviousData },
  );

  const games = React.useMemo(() => data?.pages.flatMap(resultPage => resultPage.results) ?? [], [data]);
  const gameColumns = React.useMemo(() => createGameColumns(t), [t]);

  const renderContent = () => {
    if (renderMode === "table") {
      if (tableQuery.isError) {
        return (
          <Center py="xl">
            <Text c="red">{t("calendar.listLoadError")}</Text>
          </Center>
        );
      }

      return (
        <PaginatedTable
          columns={gameColumns}
          data={tableQuery.data?.results ?? []}
          count={tableQuery.data?.count ?? 0}
          page={page}
          onPageChange={setPage}
          getRowId={row => String(row.id)}
          isLoading={tableQuery.isLoading}
          isFetching={tableQuery.isFetching}
          onRowClick={row => navigate({ to: "/game/$id/$slug", params: { id: String(row.id), slug: row.slug ?? "" } })}
        />
      );
    }

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
      <Group justify="space-between" align="flex-end">
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
        <ListViewModeToggle />
      </Group>
      {renderContent()}
    </Stack>
  );
}
