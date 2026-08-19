import { Box, Stack, Text, Group, Badge, Grid, TextInput, Loader, ActionIcon, UnstyledButton } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconX } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameSimpleList } from "@/client";
import { Button } from "@/components/ui/Button";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { VirtualGridList } from "@/components/ui/VirtualGridList";
import { cn } from "@/utils/cn";

import { useGetGamesInfinite, useGetExportedGameList } from "../../hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "../../utils/IGDBIntegration";
import { ImportedGame } from "./types";

import styles from "./TitleResolveStep.module.css";

export interface UnmatchedTitle {
  titleIndex: number;
  title: string;
}

interface TitleResolveStepProps {
  unmatched: UnmatchedTitle[];
  manualPicks: Record<number, ImportedGame>;
  onPick: (titleIndex: number, game: GameSimpleList) => void;
  onClearPick: (titleIndex: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

/**
 * Manual resolution of unmatched titles: the user activates a title (which
 * pre-fills the catalogue search with its text) and binds a search result to it.
 * Titles left unresolved are skipped from the import.
 */
export const TitleResolveStep = ({
  unmatched,
  manualPicks,
  onPick,
  onClearPick,
  onBack,
  onContinue,
}: TitleResolveStepProps) => {
  const { t } = useTranslation("games");
  const [activeIndex, setActiveIndex] = React.useState<number | null>(null);
  const [search, setSearch] = React.useState("");
  const [debouncedSearch] = useDebouncedValue(search, 300);

  const {
    data: searchData,
    isLoading: isSearching,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useGetGamesInfinite({ title: debouncedSearch }, { enabled: activeIndex !== null && debouncedSearch.length > 1 });
  const searchResults = React.useMemo(() => searchData?.pages.flatMap(page => page.results) ?? [], [searchData]);

  // The user's existing game list, to grey out games they already own.
  const { data: exportedList } = useGetExportedGameList();
  const ownedGameIds = React.useMemo(() => new Set(exportedList?.map(entry => entry.game_id)), [exportedList]);

  const skippedCount = unmatched.filter(item => !manualPicks[item.titleIndex]).length;

  const activateTitle = (item: UnmatchedTitle) => {
    setActiveIndex(item.titleIndex);
    setSearch(item.title);
  };

  const handlePick = (game: GameSimpleList) => {
    if (activeIndex === null) {
      return;
    }
    onPick(activeIndex, game);
    setActiveIndex(null);
    setSearch("");
  };

  return (
    <Stack gap={24}>
      <Box className={styles.card}>
        <Stack gap={16}>
          <Group justify="space-between" align="center">
            <Text fz={20} fw={700} c="var(--color-text-900)">
              {t("import.resolveTitle")}
            </Text>
            <Badge variant="light" color="orange" size="lg">
              {t("import.resolveSkippedCount", { count: skippedCount })}
            </Badge>
          </Group>
          <Text fz="sm" c="dimmed">
            {t("import.resolveDescription")}
          </Text>

          <Grid gap={24}>
            {/* Unmatched titles */}
            <Grid.Col span={{ base: 12, md: 5 }}>
              <Stack gap={8}>
                {unmatched.map(item => {
                  const pick = manualPicks[item.titleIndex];
                  return (
                    <UnstyledButton
                      key={item.titleIndex}
                      className={cn(styles.resolveItem, {
                        [styles.resolveItemActive]: activeIndex === item.titleIndex,
                        [styles.resolveItemResolved]: pick !== undefined,
                      })}
                      onClick={() => activateTitle(item)}
                    >
                      <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                        <Text fz="sm" fw={600} c="var(--color-text-900)" truncate>
                          {item.title}
                        </Text>
                        {pick ? (
                          <Text fz="xs" c="var(--color-success-tint-text)" truncate>
                            → {pick.title}
                          </Text>
                        ) : (
                          <Text fz="xs" c="dimmed">
                            {t("import.resolveSkipped")}
                          </Text>
                        )}
                      </Stack>
                      {pick && (
                        <ActionIcon
                          component="div"
                          variant="subtle"
                          color="gray"
                          size="sm"
                          aria-label={t("import.removePick")}
                          onClick={event => {
                            event.stopPropagation();
                            onClearPick(item.titleIndex);
                          }}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      )}
                    </UnstyledButton>
                  );
                })}
              </Stack>
            </Grid.Col>

            {/* Catalogue search */}
            <Grid.Col span={{ base: 12, md: 7 }}>
              <Stack gap={36}>
                <TextInput
                  placeholder={
                    activeIndex === null ? t("import.resolveSelectTitleFirst") : t("import.resolveSearchPlaceholder")
                  }
                  leftSection={<IconSearch size={16} />}
                  value={search}
                  onChange={event => setSearch(event.currentTarget.value)}
                  disabled={activeIndex === null}
                />

                {activeIndex !== null && isSearching && (
                  <Group justify="center" py={24}>
                    <Loader size="sm" />
                  </Group>
                )}

                {activeIndex !== null && !isSearching && (
                  <VirtualGridList
                    items={searchResults}
                    hasNextPage={!!hasNextPage}
                    isFetchingNextPage={isFetchingNextPage}
                    fetchNextPage={fetchNextPage}
                    columnCount={3}
                    rowHeight={260}
                    style={{ height: "680px" }}
                    renderItem={(game: GameSimpleList) => {
                      const owned = ownedGameIds.has(game.id);
                      return (
                        <ItemOverlay
                          key={game.id}
                          name={game.title}
                          itemCoverUrl={
                            game.cover_image_id
                              ? getIGDBImageURL(game.cover_image_id, IGDBImageSize.COVER_BIG_264_374)
                              : null
                          }
                          gameType={game.game_type}
                          releaseDate={game.release_date}
                          rating={game.average_score}
                          onClick={owned ? undefined : () => handlePick(game)}
                          style={owned ? { opacity: 0.5, pointerEvents: "none" } : undefined}
                          actionSlot={
                            owned ? (
                              <Badge
                                variant="light"
                                color="gray"
                                size="sm"
                                style={{ position: "absolute", top: 8, right: 8, zIndex: 20 }}
                              >
                                {t("import.alreadyInList")}
                              </Badge>
                            ) : undefined
                          }
                        />
                      );
                    }}
                  />
                )}
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

      <Group justify="space-between">
        <Button variant="outline" onClick={onBack}>
          ← {t("import.backStepButton")}
        </Button>
        <Button onClick={onContinue}>{t("import.continueButton")} →</Button>
      </Group>
    </Stack>
  );
};
