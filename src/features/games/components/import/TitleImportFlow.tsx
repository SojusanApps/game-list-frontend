import { Box, Stack, Text, Stepper, Group } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconCheck, IconDownload, IconInfoCircle, IconListSearch } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameListBulkCreateItemWritable, GameSimpleList, StoreEntry } from "@/client";
import { Button } from "@/components/ui/Button";
import { useCurrentUserId } from "@/features/auth";
import { playtimeHoursToMinutes } from "@/utils/playtimeUtils";

import { useBulkCreateGameList, useStoreLink, useStoreNotAGame, useGetExportedGameList } from "../../hooks/gameQueries";
import {
  parseTitles,
  findDuplicateGroups,
  uniquePickedGames,
  TitleGamePick,
  DuplicateGroup,
  mergeStoreEntries,
  storeRefsFromEntries,
  storeRefsForTitle,
  storeRefsForTitles,
  storeLinksForPicks,
  StoreRef,
  StoreRefsByTitle,
} from "../../utils/titleImport";
import { ConfigureGameList } from "./ConfigureGameList";
import { ImportEntryList } from "./ImportEntryList";
import { PlatformSyncButtons } from "./PlatformSyncButtons";
import { SuccessStep } from "./SuccessStep";
import { MatchTitle, TitleMatchStep } from "./TitleMatchStep";
import { TitleMergeStep } from "./TitleMergeStep";
import { createGameRow, GameRow, ImportedGame, TitleResolution } from "./types";
import { useGameRows } from "./useGameRows";

import styles from "./TitleImportFlow.module.css";

/** Keep configuration already entered for games that are still picked. */
function reconcileRows(games: ImportedGame[], prevRows: GameRow[]): GameRow[] {
  return games.map(game => prevRows.find(row => row.game.id === game.id) ?? createGameRow(game));
}

// Stepper indices for the title flow.
const STEP_INPUT = 0;
const STEP_MATCH = 1;
const STEP_MERGE = 2;
const STEP_CONFIGURE = 3;
const STEP_DONE = 4;

export const TitleImportFlow = () => {
  const { t } = useTranslation("games");
  const currentUserId = useCurrentUserId();

  const [activeStep, setActiveStep] = React.useState(STEP_INPUT);
  const [titles, setTitles] = React.useState<string[]>([]);
  // Match-step result per title index; a title without one is skipped from the import.
  const [resolutions, setResolutions] = React.useState<Record<number, TitleResolution>>({});
  const [duplicateGroups, setDuplicateGroups] = React.useState<Array<DuplicateGroup<ImportedGame>>>([]);
  const [importedCount, setImportedCount] = React.useState(0);
  // Store games waiting to be matched; the only source of titles. Filled by the Platform Sync buttons.
  const [pendingEntries, setPendingEntries] = React.useState<StoreEntry[]>([]);
  // Store ids of the titles that came from a Platform Sync, so a pick can be recorded as a Store Mapping.
  const [storeRefs, setStoreRefs] = React.useState<StoreRefsByTitle>({});

  const { rows, setRows, onStatusChange, onScoreChange, onFieldChange, onBulkStatusChange } = useGameRows();
  const { mutateAsync: linkListedGames } = useStoreLink();
  const { mutateAsync: submitNotAGame } = useStoreNotAGame();
  const { mutateAsync: runBulkCreate, isPending: isImporting } = useBulkCreateGameList();

  // Games already on the user's list can still be matched to a store id; they only get the store added to "owned on".
  const { data: exportedList } = useGetExportedGameList();
  const listedGameIds = React.useMemo(() => new Set(exportedList?.map(entry => entry.game_id)), [exportedList]);
  const isListed = React.useCallback((game: ImportedGame) => listedGameIds.has(game.id), [listedGameIds]);

  // ── Data derived from resolutions ───────────────────────────────────────
  const matchTitles: MatchTitle[] = React.useMemo(
    () => titles.map((title, titleIndex) => ({ title, titleIndex, storeRefs: storeRefsForTitle(storeRefs, title) })),
    [titles, storeRefs],
  );

  const gamePicks: Array<TitleGamePick<ImportedGame>> = React.useMemo(
    () =>
      titles
        .map((title, titleIndex) => {
          const resolution = resolutions[titleIndex];
          return resolution?.kind === "game" ? { title, game: resolution.game } : null;
        })
        .filter((pick): pick is TitleGamePick<ImportedGame> => pick !== null),
    [titles, resolutions],
  );

  // The store games each picked game was chosen for, by game id; kept apart from `rows` so editing a row leaves it alone.
  const listedCount = React.useMemo(
    () => uniquePickedGames(gamePicks).filter(game => isListed(game)).length,
    [gamePicks, isListed],
  );

  const storeRefsByGameId = React.useMemo(() => {
    const byGameId: Record<number, StoreRef[]> = {};
    for (const pick of gamePicks) {
      byGameId[pick.game.id] = [...(byGameId[pick.game.id] ?? []), ...storeRefsForTitle(storeRefs, pick.title)];
    }
    return byGameId;
  }, [gamePicks, storeRefs]);

  // A new step is a new page: start it from the top, as the Next/Back buttons sit at the bottom.
  React.useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [activeStep]);

  // ── Step transitions ────────────────────────────────────────────────────
  const handleTitlesSubmit = () => {
    const parsed = parseTitles(pendingEntries.map(entry => entry.title).join("\n"));
    setTitles(parsed);
    setStoreRefs(storeRefsFromEntries(pendingEntries));
    setResolutions({});
    setRows([]);
    setActiveStep(STEP_MATCH);
  };

  const goToConfigure = () => {
    const games = uniquePickedGames(gamePicks).filter(game => !isListed(game));
    setRows(prev => reconcileRows(games, prev));
    setActiveStep(STEP_CONFIGURE);
  };

  const goToMergeOrConfigure = () => {
    const groups = findDuplicateGroups(gamePicks);
    setDuplicateGroups(groups);
    if (groups.length > 0) {
      setActiveStep(STEP_MERGE);
    } else {
      goToConfigure();
    }
  };

  const handleConfigureBack = () => {
    setActiveStep(duplicateGroups.length > 0 ? STEP_MERGE : STEP_MATCH);
  };

  // ── Resolution handlers ─────────────────────────────────────────────────
  const handlePick = React.useCallback((titleIndex: number, game: GameSimpleList) => {
    setResolutions(prev => ({ ...prev, [titleIndex]: { kind: "game", game } }));
  }, []);

  const handleClear = React.useCallback((titleIndex: number) => {
    setResolutions(prev => {
      const { [titleIndex]: _removed, ...rest } = prev;
      return rest;
    });
  }, []);

  const handleToggleNotAGame = React.useCallback((titleIndex: number) => {
    setResolutions(prev => {
      if (prev[titleIndex]?.kind === "not-a-game") {
        const { [titleIndex]: _removed, ...rest } = prev;
        return rest;
      }
      return { ...prev, [titleIndex]: { kind: "not-a-game" } };
    });
  }, []);

  // Titles marked as not a game are proposed to the backend before moving on; a failure only shows a toast.
  const handleMatchContinue = async () => {
    const markedTitles = matchTitles.filter(item => resolutions[item.titleIndex]?.kind === "not-a-game");
    const refs = storeRefsForTitles(
      storeRefs,
      markedTitles.map(item => item.title),
    );
    if (refs.length > 0) {
      try {
        await submitNotAGame(refs);
      } catch {
        // toast shown by useAppMutation
      }
    }
    goToMergeOrConfigure();
  };

  // Entries the backend could not match by store id are listed to go through title matching.
  const handleUnmatchedFromStore = (entries: StoreEntry[]) => {
    setPendingEntries(prev => mergeStoreEntries(prev, entries));
  };

  const handleRemoveEntry = (entry: StoreEntry) => {
    setPendingEntries(prev =>
      prev.filter(other => other.platform !== entry.platform || other.store_id !== entry.store_id),
    );
  };

  // ── Final import ────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!currentUserId) {
      notifications.show({ title: "Error", message: "User not identified.", color: "red" });
      return;
    }
    const body: GameListBulkCreateItemWritable[] = rows.map(row => ({
      game: row.game.id,
      store_refs: storeRefsByGameId[row.game.id] ?? [],
      status: row.status,
      score: row.score,
      owned_on: row.owned_on.map(Number),
      started_at: row.started_at || null,
      completed_at: row.completed_at || null,
      playtime: playtimeHoursToMinutes(row.playtime),
      description: row.description || undefined,
    }));
    const links = storeLinksForPicks(
      pendingEntries,
      gamePicks.filter(pick => isListed(pick.game)),
    );
    try {
      if (body.length > 0) {
        await runBulkCreate(body);
      }
      if (links.length > 0) {
        await linkListedGames(links);
      }
      setImportedCount(rows.length + listedCount);
      setActiveStep(STEP_DONE);
    } catch {
      // handled by useAppMutation
    }
  };

  return (
    <>
      <Stepper active={activeStep} size="sm" className={styles.stepperWrapper}>
        <Stepper.Step label={t("import.stepTitles")} completedIcon={<IconCheck size={16} />} />
        <Stepper.Step label={t("import.stepMatch")} completedIcon={<IconCheck size={16} />} />
        <Stepper.Step label={t("import.stepDuplicates")} completedIcon={<IconCheck size={16} />} />
        <Stepper.Step label={t("import.stepConfigure")} completedIcon={<IconCheck size={16} />} />
        <Stepper.Step label={t("import.stepDone")} completedIcon={<IconCheck size={16} />} />
      </Stepper>

      {/* ── Step 0: Titles input ────────────────────────── */}
      {activeStep === STEP_INPUT && (
        <Box className={styles.card}>
          <Stack gap={24}>
            <PlatformSyncButtons onUnmatched={handleUnmatchedFromStore} />

            <ImportEntryList
              entries={pendingEntries}
              onRemove={handleRemoveEntry}
              onClear={() => setPendingEntries([])}
            />

            <div className={styles.noticeBox}>
              <IconInfoCircle size={20} style={{ color: "var(--color-primary-tint-text)", flexShrink: 0 }} />
              <Text fz="sm" className={styles.noticeText}>
                {t("import.titlesNotice")}
              </Text>
            </div>

            <Group justify="flex-end">
              <Button
                type="button"
                leftSection={<IconListSearch size={16} />}
                disabled={pendingEntries.length === 0}
                onClick={handleTitlesSubmit}
              >
                {t("import.matchButton")}
              </Button>
            </Group>
          </Stack>
        </Box>
      )}

      {/* ── Step 1: Match titles to catalogue games ─────── */}
      {activeStep === STEP_MATCH && (
        <TitleMatchStep
          titles={matchTitles}
          resolutions={resolutions}
          isListed={isListed}
          onPick={handlePick}
          onClear={handleClear}
          onToggleNotAGame={handleToggleNotAGame}
          onBack={() => setActiveStep(STEP_INPUT)}
          onContinue={() => void handleMatchContinue()}
        />
      )}

      {/* ── Step 2: Duplicate merge ─────────────────────── */}
      {activeStep === STEP_MERGE && (
        <TitleMergeStep
          groups={duplicateGroups}
          storeRefs={storeRefs}
          onBack={() => setActiveStep(STEP_MATCH)}
          onConfirm={goToConfigure}
        />
      )}

      {/* ── Step 3: Configure ───────────────────────────── */}
      {activeStep === STEP_CONFIGURE && (
        <Stack gap={24}>
          {listedCount > 0 && (
            <Text fz="sm" c="dimmed">
              {t("import.listedGamesNote", { count: listedCount })}
            </Text>
          )}
          <ConfigureGameList
            rows={rows}
            storeRefsByGameId={storeRefsByGameId}
            onStatusChange={onStatusChange}
            onScoreChange={onScoreChange}
            onFieldChange={onFieldChange}
            onBulkStatusChange={onBulkStatusChange}
          />
          <Group justify="space-between">
            <Button
              variant="outline"
              onClick={handleConfigureBack}
              leftSection={<IconArrowLeft size={16} stroke={1.5} />}
            >
              {t("import.backStepButton")}
            </Button>
            <Button
              onClick={handleImport}
              isLoading={isImporting}
              disabled={rows.length === 0 && listedCount === 0}
              leftSection={<IconDownload size={16} />}
            >
              {t("import.importButton", { count: rows.length + listedCount })}
            </Button>
          </Group>
        </Stack>
      )}

      {/* ── Step 4: Success ─────────────────────────────── */}
      {activeStep === STEP_DONE && <SuccessStep importedCount={importedCount} />}
    </>
  );
};
