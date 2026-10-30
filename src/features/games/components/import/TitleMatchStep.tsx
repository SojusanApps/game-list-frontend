import { Box, Stack, Text, Title, Group, Badge, Grid, ActionIcon, UnstyledButton } from "@mantine/core";
import {
  IconArrowLeft,
  IconArrowRight,
  IconLayoutSidebarLeftCollapse,
  IconLayoutSidebarLeftExpand,
  IconX,
} from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameSimpleList } from "@/client";
import { Button } from "@/components/ui/Button";
import { TruncatedText } from "@/components/ui/TruncatedText";
import { cn } from "@/utils/cn";

import { StoreRef } from "../../utils/titleImport";
import { GameCatalogueSearch } from "../GameCatalogueSearch";
import { StoreRefList } from "./StoreRefList";
import { ImportedGame, TitleResolution } from "./types";

import styles from "./TitleMatchStep.module.css";

export interface MatchTitle {
  titleIndex: number;
  title: string;
  storeRefs: StoreRef[];
}

interface TitleMatchStepProps {
  titles: MatchTitle[];
  resolutions: Record<number, TitleResolution>;
  isListed: (game: ImportedGame) => boolean;
  onPick: (titleIndex: number, game: GameSimpleList) => void;
  onClear: (titleIndex: number) => void;
  onToggleNotAGame: (titleIndex: number) => void;
  onBack: () => void;
  onContinue: () => void;
}

/**
 * Matches every imported title to a catalogue game: the user activates a title
 * (which pre-fills the catalogue search with its text, with no filters) and
 * clicks the right search result. Titles left unresolved are skipped.
 */
export const TitleMatchStep = ({
  titles,
  resolutions,
  isListed,
  onPick,
  onClear,
  onToggleNotAGame,
  onBack,
  onContinue,
}: TitleMatchStepProps) => {
  const { t } = useTranslation("games");

  const firstOpen = titles.find(item => !resolutions[item.titleIndex]) ?? titles[0];
  const [activeIndex, setActiveIndex] = React.useState<number | null>(firstOpen?.titleIndex ?? null);
  const [search, setSearch] = React.useState(firstOpen?.title ?? "");
  const [filters, setFilters] = React.useState<Record<string, unknown>>({});
  const [isCollapsed, setIsCollapsed] = React.useState(false);

  const resolvedCount = titles.filter(item => resolutions[item.titleIndex]).length;

  const activate = (item: MatchTitle) => {
    setActiveIndex(item.titleIndex);
    setSearch(item.title);
    setFilters({});
  };

  /** Move on to the next title still without a resolution, if there is one. */
  const advance = (from: number, resolved: number[]) => {
    const start = titles.findIndex(item => item.titleIndex === from);
    const next = [...titles.slice(start + 1), ...titles.slice(0, start)].find(
      item => !resolutions[item.titleIndex] && !resolved.includes(item.titleIndex),
    );
    if (next) {
      activate(next);
    } else {
      setActiveIndex(null);
      setSearch("");
      setFilters({});
    }
  };

  const handlePick = (game: GameSimpleList) => {
    if (activeIndex === null) {
      return;
    }
    onPick(activeIndex, game);
    advance(activeIndex, [activeIndex]);
  };

  const handleToggleNotAGame = (item: MatchTitle) => {
    const isMarked = resolutions[item.titleIndex]?.kind === "not-a-game";
    onToggleNotAGame(item.titleIndex);
    if (!isMarked && activeIndex === item.titleIndex) {
      advance(item.titleIndex, [item.titleIndex]);
    }
  };

  const renderStatus = (resolution: TitleResolution | undefined) => {
    if (resolution?.kind === "game") {
      return (
        <TruncatedText label={resolution.game.title} fz="xs" c="var(--mantine-color-green-6)" truncate>
          <IconArrowRight size={12} stroke={1.5} style={{ verticalAlign: "-2px", marginRight: 4 }} />
          {resolution.game.title}
        </TruncatedText>
      );
    }
    const isNotAGame = resolution?.kind === "not-a-game";
    return (
      <Text fz="xs" c={isNotAGame ? "var(--mantine-color-green-6)" : "dimmed"}>
        {isNotAGame ? t("import.matchNotAGameMarked") : t("import.matchSkipped")}
      </Text>
    );
  };

  return (
    <Stack gap={24}>
      <Box className={styles.card}>
        <Stack gap={16}>
          <Group justify="space-between" align="center">
            <Title order={2} fz={20} fw={700} c="var(--color-text-900)">
              {t("import.matchTitle")}
            </Title>
            <Group gap={8}>
              <Badge
                size="lg"
                style={{
                  background: "var(--color-secondary-tint-bg)",
                  color: "var(--color-secondary-tint-text)",
                  border: "1px solid var(--color-secondary-tint-border)",
                }}
              >
                {t("import.matchProgress", { done: resolvedCount, total: titles.length })}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                leftSection={
                  isCollapsed ? <IconLayoutSidebarLeftExpand size={16} /> : <IconLayoutSidebarLeftCollapse size={16} />
                }
                onClick={() => setIsCollapsed(prev => !prev)}
              >
                {isCollapsed ? t("import.matchShowTitles") : t("import.matchHideTitles")}
              </Button>
            </Group>
          </Group>
          <Text fz="sm" c="dimmed">
            {t("import.matchDescription")}
          </Text>

          <Grid gap={24}>
            {/* Titles to match */}
            <Grid.Col span={{ base: 12, md: 5 }} display={isCollapsed ? "none" : undefined}>
              <Stack gap={8} className={styles.titleList}>
                {titles.map(item => {
                  const resolution = resolutions[item.titleIndex];
                  return (
                    <Box
                      key={item.titleIndex}
                      className={cn(styles.titleItem, {
                        [styles.titleItemActive]: activeIndex === item.titleIndex,
                        [styles.titleItemResolved]: resolution !== undefined,
                      })}
                    >
                      <UnstyledButton
                        type="button"
                        className={styles.titleItemMain}
                        aria-current={activeIndex === item.titleIndex ? "true" : undefined}
                        onClick={() => activate(item)}
                      >
                        <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                          <TruncatedText fz="sm" fw={600} c="var(--color-text-900)" truncate>
                            {item.title}
                          </TruncatedText>
                          <StoreRefList refs={item.storeRefs} />
                          {renderStatus(resolution)}
                        </Stack>
                      </UnstyledButton>
                      {resolution?.kind === "game" ? (
                        <ActionIcon
                          type="button"
                          variant="subtle"
                          color="gray"
                          size="md"
                          aria-label={t("import.removePick")}
                          onClick={() => onClear(item.titleIndex)}
                        >
                          <IconX size={14} />
                        </ActionIcon>
                      ) : (
                        <Badge
                          component="button"
                          type="button"
                          aria-pressed={resolution?.kind === "not-a-game"}
                          variant={resolution?.kind === "not-a-game" ? "filled" : "outline"}
                          color="gray"
                          style={{ cursor: "pointer" }}
                          onClick={() => handleToggleNotAGame(item)}
                        >
                          {t("import.notAGameButton")}
                        </Badge>
                      )}
                    </Box>
                  );
                })}
              </Stack>
            </Grid.Col>

            {/* Catalogue search */}
            <Grid.Col span={{ base: 12, md: isCollapsed ? 12 : 7 }}>
              <Stack gap={24}>
                {isCollapsed && activeIndex !== null && (
                  <TruncatedText fz="sm" fw={600} c="var(--color-text-900)" truncate>
                    {t("import.matchActiveTitle", {
                      title: titles.find(item => item.titleIndex === activeIndex)?.title,
                    })}
                  </TruncatedText>
                )}
                <GameCatalogueSearch
                  search={search}
                  onSearchChange={setSearch}
                  filters={filters}
                  onFiltersChange={setFilters}
                  onSelect={handlePick}
                  isListed={isListed}
                  disabled={activeIndex === null}
                  idleMessage={
                    titles.length > 0 && resolvedCount === titles.length
                      ? t("import.matchAllHandled")
                      : t("import.matchSelectTitleFirst")
                  }
                  placeholder={
                    activeIndex === null ? t("import.matchSelectTitleFirst") : t("import.matchSearchPlaceholder")
                  }
                  columnCount={isCollapsed ? 5 : 3}
                />
              </Stack>
            </Grid.Col>
          </Grid>
        </Stack>
      </Box>

      <Group justify="space-between">
        <Button variant="outline" onClick={onBack} leftSection={<IconArrowLeft size={16} stroke={1.5} />}>
          {t("import.backStepButton")}
        </Button>
        <Button onClick={onContinue} rightSection={<IconArrowRight size={16} stroke={1.5} />}>
          {t("import.continueButton")}
        </Button>
      </Group>
    </Stack>
  );
};
