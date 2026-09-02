import { Box, Stack, Text, Stepper, Group, Textarea } from "@mantine/core";
import { useForm, schemaResolver } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconArrowLeft, IconCheck, IconDownload, IconInfoCircle, IconListSearch } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

import { GameListCreateWritable, GameSimpleList, TitleImportResult } from "@/client";
import { Button } from "@/components/ui/Button";
import { useCurrentUserId } from "@/features/auth";
import i18n from "@/lib/i18n";
import { playtimeHoursToMinutes } from "@/utils/playtimeUtils";

import { useTitleImport, useBulkCreateGameList } from "../../hooks/gameQueries";
import {
  TITLE_IMPORT_BATCH_SIZE,
  parseTitles,
  chunkTitles,
  findDuplicateGroups,
  uniquePickedGames,
  TitleGamePick,
  DuplicateGroup,
} from "../../utils/titleImport";
import { ConfigureGameList } from "./ConfigureGameList";
import { SuccessStep } from "./SuccessStep";
import { TitleMatchStep } from "./TitleMatchStep";
import { TitleMergeStep } from "./TitleMergeStep";
import { TitleResolveStep, UnmatchedTitle } from "./TitleResolveStep";
import { createGameRow, GameRow, ImportedGame, MatchDecision } from "./types";
import { useGameRows } from "./useGameRows";

import styles from "./TitleImportFlow.module.css";

const titleFormSchema = z.object({
  titlesRaw: z.string().refine(raw => parseTitles(raw).length > 0, {
    message: i18n.t("validation:titlesRequired"),
  }),
});
type TitleFormValues = z.infer<typeof titleFormSchema>;

/** Keep configuration already entered for games that are still picked. */
function reconcileRows(games: ImportedGame[], prevRows: GameRow[]): GameRow[] {
  return games.map(game => prevRows.find(row => row.game.id === game.id) ?? createGameRow(game));
}

/** Auto-resolve titles that came back with zero candidates as unmatched. */
function withAutoUnmatched(
  prev: Record<number, MatchDecision>,
  results: TitleImportResult[],
  offset: number,
): Record<number, MatchDecision> {
  const next = { ...prev };
  for (const [i, result] of results.entries()) {
    if (result.matches.length === 0 && !next[offset + i]) {
      next[offset + i] = { kind: "no-matches" };
    }
  }
  return next;
}

// Stepper indices for the title flow.
const STEP_INPUT = 0;
const STEP_MATCH = 1;
const STEP_RESOLVE = 2;
const STEP_MERGE = 3;
const STEP_CONFIGURE = 4;
const STEP_DONE = 5;

interface TitleImportFlowProps {
  sourceSelector: React.ReactNode;
}

export const TitleImportFlow = ({ sourceSelector }: TitleImportFlowProps) => {
  const { t } = useTranslation("games");
  const currentUserId = useCurrentUserId();

  const [activeStep, setActiveStep] = React.useState(STEP_INPUT);
  const [titles, setTitles] = React.useState<string[]>([]);
  const [batchIndex, setBatchIndex] = React.useState(0);
  const [batchResults, setBatchResults] = React.useState<Record<number, TitleImportResult[]>>({});
  const [batchError, setBatchError] = React.useState(false);
  // Match-step decisions and manual resolve-step picks, both keyed by title index.
  const [decisions, setDecisions] = React.useState<Record<number, MatchDecision>>({});
  const [manualPicks, setManualPicks] = React.useState<Record<number, ImportedGame>>({});
  const [duplicateGroups, setDuplicateGroups] = React.useState<Array<DuplicateGroup<ImportedGame>>>([]);
  const [hadUnmatched, setHadUnmatched] = React.useState(false);
  const [importedCount, setImportedCount] = React.useState(0);

  const { rows, setRows, onStatusChange, onScoreChange, onFieldChange } = useGameRows();
  const { mutateAsync: matchTitles, isPending: isMatching } = useTitleImport();
  const { mutateAsync: runBulkCreate, isPending: isImporting } = useBulkCreateGameList();

  const batches = React.useMemo(() => chunkTitles(titles), [titles]);

  const form = useForm<TitleFormValues>({
    initialValues: { titlesRaw: "" },
    validate: schemaResolver(titleFormSchema),
  });

  // ── Data derived from decisions ─────────────────────────────────────────
  const unmatched: UnmatchedTitle[] = React.useMemo(
    () =>
      titles
        .map((title, titleIndex) => ({ title, titleIndex }))
        .filter(({ titleIndex }) => {
          const decision = decisions[titleIndex];
          return decision?.kind === "none" || decision?.kind === "no-matches";
        }),
    [titles, decisions],
  );

  const gamePicks: Array<TitleGamePick<ImportedGame>> = React.useMemo(
    () =>
      titles
        .map((title, titleIndex) => {
          const decision = decisions[titleIndex];
          const game = decision?.kind === "game" ? decision.game : manualPicks[titleIndex];
          return game ? { title, game } : null;
        })
        .filter((pick): pick is TitleGamePick<ImportedGame> => pick !== null),
    [titles, decisions, manualPicks],
  );

  // ── Batch fetching ──────────────────────────────────────────────────────
  // Guards against an in-flight batch response landing after the titles were re-submitted.
  const runIdRef = React.useRef(0);

  const fetchBatch = React.useCallback(
    async (index: number, batchTitles: string[], options?: { newRun?: boolean }) => {
      if (options?.newRun) {
        runIdRef.current += 1;
      }
      const runId = runIdRef.current;
      setBatchError(false);
      try {
        const response = await matchTitles(batchTitles);
        if (runIdRef.current !== runId) {
          return;
        }
        setBatchResults(prev => ({ ...prev, [index]: response.results }));
        setDecisions(prev => withAutoUnmatched(prev, response.results, index * TITLE_IMPORT_BATCH_SIZE));
      } catch {
        // toast shown by useAppMutation
        if (runIdRef.current === runId) {
          setBatchError(true);
        }
      }
    },
    [matchTitles],
  );

  // ── Step transitions ────────────────────────────────────────────────────
  const handleTitlesSubmit = (values: TitleFormValues) => {
    const parsed = parseTitles(values.titlesRaw);
    setTitles(parsed);
    setBatchIndex(0);
    setBatchResults({});
    setBatchError(false);
    setDecisions({});
    setManualPicks({});
    setRows([]);
    setActiveStep(STEP_MATCH);
    void fetchBatch(0, parsed.slice(0, TITLE_IMPORT_BATCH_SIZE), { newRun: true });
  };

  const goToConfigure = () => {
    const games = uniquePickedGames(gamePicks);
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

  const goToResolveOrBeyond = () => {
    setHadUnmatched(unmatched.length > 0);
    if (unmatched.length > 0) {
      setActiveStep(STEP_RESOLVE);
    } else {
      goToMergeOrConfigure();
    }
  };

  const handleMatchNext = () => {
    if (batchIndex < batches.length - 1) {
      const nextIndex = batchIndex + 1;
      setBatchError(false);
      setBatchIndex(nextIndex);
      if (!batchResults[nextIndex]) {
        void fetchBatch(nextIndex, batches[nextIndex]);
      }
    } else {
      goToResolveOrBeyond();
    }
  };

  const handleMatchBack = () => {
    if (batchIndex > 0) {
      setBatchError(false);
      setBatchIndex(batchIndex - 1);
    } else {
      setActiveStep(STEP_INPUT);
    }
  };

  const handleConfigureBack = () => {
    if (duplicateGroups.length > 0) {
      setActiveStep(STEP_MERGE);
    } else if (hadUnmatched) {
      setActiveStep(STEP_RESOLVE);
    } else {
      setActiveStep(STEP_MATCH);
    }
  };

  // ── Decision handlers ───────────────────────────────────────────────────
  const handleDecide = React.useCallback((titleIndex: number, decision: MatchDecision | null) => {
    setDecisions(prev => {
      const next = { ...prev };
      if (decision === null) {
        delete next[titleIndex];
      } else {
        next[titleIndex] = decision;
      }
      return next;
    });
    // A fresh match-step decision supersedes any earlier manual pick.
    setManualPicks(prev => {
      if (!(titleIndex in prev)) {
        return prev;
      }
      const next = { ...prev };
      delete next[titleIndex];
      return next;
    });
  }, []);

  const handleManualPick = React.useCallback((titleIndex: number, game: GameSimpleList) => {
    setManualPicks(prev => ({ ...prev, [titleIndex]: game }));
  }, []);

  const handleClearManualPick = React.useCallback((titleIndex: number) => {
    setManualPicks(prev => {
      const next = { ...prev };
      delete next[titleIndex];
      return next;
    });
  }, []);

  // ── Final import ────────────────────────────────────────────────────────
  const handleImport = async () => {
    if (!currentUserId) {
      notifications.show({ title: "Error", message: "User not identified.", color: "red" });
      return;
    }
    const body: GameListCreateWritable[] = rows.map(row => ({
      game: row.game.id,
      status: row.status,
      score: row.score,
      owned_on: row.owned_on.map(Number),
      started_at: row.started_at || null,
      completed_at: row.completed_at || null,
      playtime: playtimeHoursToMinutes(row.playtime),
      description: row.description || undefined,
    }));
    try {
      await runBulkCreate(body);
      setImportedCount(rows.length);
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
        <Stepper.Step label={t("import.stepResolve")} completedIcon={<IconCheck size={16} />} />
        <Stepper.Step label={t("import.stepDuplicates")} completedIcon={<IconCheck size={16} />} />
        <Stepper.Step label={t("import.stepConfigure")} completedIcon={<IconCheck size={16} />} />
        <Stepper.Step label={t("import.stepDone")} completedIcon={<IconCheck size={16} />} />
      </Stepper>

      {/* ── Step 0: Titles input ────────────────────────── */}
      {activeStep === STEP_INPUT && (
        <Box className={styles.card}>
          <form onSubmit={event => form.onSubmit(handleTitlesSubmit)(event)} noValidate>
            <Stack gap={24}>
              {sourceSelector}

              <Textarea
                id="import-titles"
                label={t("import.titlesLabel")}
                placeholder={t("import.titlesPlaceholder")}
                autosize
                minRows={6}
                maxRows={16}
                {...form.getInputProps("titlesRaw")}
              />

              <div className={styles.noticeBox}>
                <IconInfoCircle size={20} style={{ color: "var(--color-primary-tint-text)", flexShrink: 0 }} />
                <Text fz="sm" c="var(--color-text-700)">
                  {t("import.titlesNotice")}
                </Text>
              </div>

              <Group justify="flex-end">
                <Button type="submit" leftSection={<IconListSearch size={16} />}>
                  {t("import.matchButton")}
                </Button>
              </Group>
            </Stack>
          </form>
        </Box>
      )}

      {/* ── Step 1: Match batches ───────────────────────── */}
      {activeStep === STEP_MATCH && (
        <TitleMatchStep
          batchIndex={batchIndex}
          batchCount={batches.length}
          batchTitles={batches[batchIndex] ?? []}
          batchOffset={batchIndex * TITLE_IMPORT_BATCH_SIZE}
          results={batchResults[batchIndex]}
          isLoading={isMatching}
          isError={batchError}
          onRetry={() => void fetchBatch(batchIndex, batches[batchIndex])}
          decisions={decisions}
          onDecide={handleDecide}
          onBack={handleMatchBack}
          onNext={handleMatchNext}
          isLastBatch={batchIndex === batches.length - 1}
        />
      )}

      {/* ── Step 2: Resolve unmatched ───────────────────── */}
      {activeStep === STEP_RESOLVE && (
        <TitleResolveStep
          unmatched={unmatched}
          manualPicks={manualPicks}
          onPick={handleManualPick}
          onClearPick={handleClearManualPick}
          onBack={() => setActiveStep(STEP_MATCH)}
          onContinue={goToMergeOrConfigure}
        />
      )}

      {/* ── Step 3: Duplicate merge ─────────────────────── */}
      {activeStep === STEP_MERGE && (
        <TitleMergeStep
          groups={duplicateGroups}
          onBack={() => setActiveStep(hadUnmatched ? STEP_RESOLVE : STEP_MATCH)}
          onConfirm={goToConfigure}
        />
      )}

      {/* ── Step 4: Configure ───────────────────────────── */}
      {activeStep === STEP_CONFIGURE && (
        <Stack gap={24}>
          <ConfigureGameList
            rows={rows}
            onStatusChange={onStatusChange}
            onScoreChange={onScoreChange}
            onFieldChange={onFieldChange}
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
              disabled={rows.length === 0}
              leftSection={<IconDownload size={16} />}
            >
              {t("import.importButton", { count: rows.length })}
            </Button>
          </Group>
        </Stack>
      )}

      {/* ── Step 5: Success ─────────────────────────────── */}
      {activeStep === STEP_DONE && <SuccessStep importedCount={importedCount} />}
    </>
  );
};
