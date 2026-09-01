import { Box, Stack, Text, Title, Group, Badge, Divider, Progress, Loader } from "@mantine/core";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { TitleImportResult, TitleImportMatch } from "@/client";
import { Button } from "@/components/ui/Button";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { cn } from "@/utils/cn";

import IGDBImageSize, { getIGDBImageURL } from "../../utils/IGDBIntegration";
import { MatchDecision } from "./types";

import styles from "./TitleMatchStep.module.css";

interface CandidateCardProps {
  candidate: TitleImportMatch;
  decision?: MatchDecision;
  onToggle: () => void;
}

const CandidateCard = ({ candidate, decision, onToggle }: CandidateCardProps) => {
  const { t } = useTranslation("games");
  const isChosen = decision?.kind === "game" && decision.game.id === candidate.id;
  const isDimmed = decision !== undefined && !isChosen;

  return (
    <div
      className={cn(styles.overlayPick, {
        [styles.overlayPickChosen]: isChosen,
        [styles.overlayPickDimmed]: isDimmed && !candidate.already_in_list,
        [styles.overlayPickDisabled]: candidate.already_in_list,
      })}
    >
      {candidate.already_in_list && (
        <Badge variant="filled" color="gray" size="sm" w="max-content" className={styles.inListBadge}>
          {t("import.alreadyInList")}
        </Badge>
      )}
      <ItemOverlay
        name={candidate.title}
        itemCoverUrl={
          candidate.cover_image_id ? getIGDBImageURL(candidate.cover_image_id, IGDBImageSize.COVER_BIG_264_374) : null
        }
        releaseDate={candidate.release_date}
        onClick={candidate.already_in_list ? undefined : onToggle}
      />
    </div>
  );
};

interface TitleMatchSectionProps {
  title: string;
  result: TitleImportResult;
  decision?: MatchDecision;
  onDecide: (decision: MatchDecision | null) => void;
}

const TitleMatchSection = ({ title, result, decision, onDecide }: TitleMatchSectionProps) => {
  const { t } = useTranslation("games");

  const toggleCandidate = (candidate: TitleImportMatch) => {
    const isChosen = decision?.kind === "game" && decision.game.id === candidate.id;
    onDecide(isChosen ? null : { kind: "game", game: candidate });
  };

  const toggleNone = () => {
    onDecide(decision?.kind === "none" ? null : { kind: "none" });
  };

  return (
    <Stack gap={12} py={16}>
      <Text fw={700} fz="md" c="var(--color-text-900)">
        {title}
      </Text>
      {result.matches.length === 0 ? (
        <Text fz="sm" c="dimmed">
          {t("import.noMatchesFound")}
        </Text>
      ) : (
        <div className={styles.candidateGrid}>
          {result.matches.map(candidate => (
            <CandidateCard
              key={candidate.id}
              candidate={candidate}
              decision={decision}
              onToggle={() => toggleCandidate(candidate)}
            />
          ))}
          <button
            type="button"
            className={cn(styles.noneCard, {
              [styles.noneCardChosen]: decision?.kind === "none",
              [styles.noneCardDimmed]: decision !== undefined && decision.kind !== "none",
            })}
            onClick={toggleNone}
            aria-pressed={decision?.kind === "none"}
          >
            <Text fz="sm" fw={600} c="var(--color-text-700)" ta="center">
              {t("import.noneOfThese")}
            </Text>
          </button>
        </div>
      )}
    </Stack>
  );
};

interface TitleMatchStepProps {
  batchIndex: number;
  batchCount: number;
  batchTitles: string[];
  batchOffset: number;
  results?: TitleImportResult[];
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
  decisions: Record<number, MatchDecision>;
  onDecide: (titleIndex: number, decision: MatchDecision | null) => void;
  onBack: () => void;
  onNext: () => void;
  isLastBatch: boolean;
}

/** One page of the paged matching step: a batch of up to 10 titles with their candidates. */
export const TitleMatchStep = ({
  batchIndex,
  batchCount,
  batchTitles,
  batchOffset,
  results,
  isLoading,
  isError,
  onRetry,
  decisions,
  onDecide,
  onBack,
  onNext,
  isLastBatch,
}: TitleMatchStepProps) => {
  const { t } = useTranslation("games");
  const { t: tCommon } = useTranslation("common");

  const allResolved = results !== undefined && batchTitles.every((_, i) => decisions[batchOffset + i] !== undefined);

  return (
    <Stack gap={24}>
      <div className={styles.statsBox}>
        <Stack gap={8} style={{ flex: 1 }}>
          <Text fw={600} c="var(--color-text-900)">
            {t("import.batchProgress", { current: batchIndex + 1, total: batchCount })}
          </Text>
          <Progress value={((batchIndex + 1) / batchCount) * 100} color="var(--mantine-color-primary-6)" />
        </Stack>
      </div>

      <Box className={styles.card}>
        <Stack gap={8} mb={16}>
          <Title order={3} fz={20} fw={700} c="var(--color-text-900)">
            {t("import.matchIntroTitle")}
          </Title>
          <Text fz="sm" c="dimmed">
            {t("import.matchIntroDescription")}
          </Text>
        </Stack>
        <Divider />

        {isLoading && (
          <Group justify="center" py={48}>
            <Loader size="sm" />
            <Text c="dimmed">{tCommon("searching")}</Text>
          </Group>
        )}

        {isError && !isLoading && (
          <Stack align="center" gap={16} py={32}>
            <IconAlertTriangle size={32} color="var(--mantine-color-orange-6)" />
            <Text c="dimmed">{t("import.batchError")}</Text>
            <Button onClick={onRetry} leftSection={<IconRefresh size={16} />}>
              {t("import.retryButton")}
            </Button>
          </Stack>
        )}

        {results && !isLoading && !isError && (
          <Stack gap={0}>
            {batchTitles.map((title, i) => (
              <React.Fragment key={title}>
                {i > 0 && <Divider />}
                <TitleMatchSection
                  title={title}
                  result={results[i]}
                  decision={decisions[batchOffset + i]}
                  onDecide={decision => onDecide(batchOffset + i, decision)}
                />
              </React.Fragment>
            ))}
          </Stack>
        )}
      </Box>

      <Group justify="space-between">
        <Button variant="outline" onClick={onBack}>
          ← {t("import.backStepButton")}
        </Button>
        <Button onClick={onNext} disabled={!allResolved}>
          {isLastBatch ? t("import.continueButton") : t("import.nextButton")} →
        </Button>
      </Group>
    </Stack>
  );
};
