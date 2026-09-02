import { Loader, Center, Text, Group, Box } from "@mantine/core";
import { keepPreviousData } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import type { GameSimpleList } from "@/client/types.gen";
import { AppModal } from "@/components/ui/AppModal";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { ListViewModeToggle } from "@/components/ui/ListViewModeToggle";
import { PaginatedTable } from "@/components/ui/PaginatedTable";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import { useListViewStore } from "@/lib/listViewStore";
import { formatDisplayDate } from "@/utils/dateUtils";

import { createGameColumns } from "../../components/gameSearchColumns";
import { useGetGamesInfinite, useGetGamesList } from "../../hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "../../utils/IGDBIntegration";

interface DayDetailModalProps {
  opened: boolean;
  onClose: () => void;
  dateStr: string; // YYYY-MM-DD
}

export default function DayDetailModal({ opened, onClose, dateStr }: Readonly<DayDetailModalProps>): React.JSX.Element {
  const { t } = useTranslation("games");
  const navigate = useNavigate();
  const renderMode = useListViewStore(state => state.mode);
  const [page, setPage] = React.useState(1);

  React.useEffect(() => {
    setPage(1);
  }, [dateStr, opened]);

  const { data, isLoading, isError, hasNextPage, isFetchingNextPage, fetchNextPage } = useGetGamesInfinite(
    {
      release_date_after: dateStr,
      release_date_before: dateStr,
      // @ts-expect-error generated type doesn't support comma-separated sort values, but API requires them
      ordering: ["release_date,-popularity"],
    },
    { enabled: opened && renderMode === "infinite" },
  );

  const tableQuery = useGetGamesList(
    {
      release_date_after: dateStr,
      release_date_before: dateStr,
      // @ts-expect-error generated type doesn't support comma-separated sort values, but API requires them
      ordering: ["release_date,-popularity"],
      page,
    },
    { enabled: opened && renderMode === "table", placeholderData: keepPreviousData },
  );

  const games = React.useMemo(() => data?.pages.flatMap(resultPage => resultPage.results) ?? [], [data]);
  const gameColumns = React.useMemo(() => createGameColumns(t), [t]);

  const renderContent = () => {
    if (renderMode === "table") {
      if (tableQuery.isError) {
        return <Text c="red">{t("calendar.dayFailedToLoad")}</Text>;
      }

      return (
        <Box style={{ maxHeight: "60vh", overflowY: "auto" }}>
          <PaginatedTable
            columns={gameColumns}
            data={tableQuery.data?.results ?? []}
            count={tableQuery.data?.count ?? 0}
            page={page}
            onPageChange={setPage}
            getRowId={row => String(row.id)}
            isLoading={tableQuery.isLoading}
            isFetching={tableQuery.isFetching}
            emptyLabel={t("calendar.dayNoReleases")}
            onRowClick={row =>
              navigate({ to: "/game/$id/$slug", params: { id: String(row.id), slug: row.slug ?? "" } })
            }
          />
        </Box>
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
    <AppModal
      opened={opened}
      onClose={onClose}
      title={
        <>
          {t("calendar.releasesFor")}{" "}
          <Text span inherit c="var(--color-primary-500)">
            {formatDisplayDate(dateStr)}
          </Text>
        </>
      }
      size="1200px"
      centered
      bodyPadding={0}
    >
      <Group justify="flex-end" px={16} pt={16}>
        <ListViewModeToggle />
      </Group>
      {renderContent()}
    </AppModal>
  );
}
