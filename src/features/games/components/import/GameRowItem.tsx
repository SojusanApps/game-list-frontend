import { Group, Select, SimpleGrid, Textarea, NumberInput, ComboboxItem } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconSearch, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameListStatusEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import AsyncMultiSelectAutocomplete from "@/components/ui/Form/AsyncMultiSelectAutocomplete";
import { TruncatedText } from "@/components/ui/TruncatedText";
import i18n from "@/lib/i18n";

import { useGetGameMediasInfiniteQuery } from "../../hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "../../utils/IGDBIntegration";
import { StatusIcon } from "../../utils/StatusIcon";
import { StoreRef } from "../../utils/titleImport";
import { ScoreBadge } from "../ScoreBadge";
import { StoreRefList } from "./StoreRefList";
import { GameRow } from "./types";

import styles from "./GameRowItem.module.css";

// Static — the score scale never changes, so keep these out of render so
// `React.memo` on the row actually holds (a fresh `data` array or `renderOption`
// closure each render would still churn the Mantine Select internals).
const SCORE_DATA = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => ({ value: s.toString(), label: s.toString() }));

const renderStatusOption = ({ option }: { option: ComboboxItem }) => (
  <Group gap={8} wrap="nowrap">
    <StatusIcon status={option.value} size={16} neon />
    {option.label}
  </Group>
);

const renderScoreOption = ({ option }: { option: ComboboxItem }) => (
  <ScoreBadge score={Number(option.value)} size="xs" />
);

const OWNED_ON_COMBOBOX_PROPS = { withinPortal: true } as const;

export interface StatusOption {
  value: string;
  label: string;
}

interface GameRowItemProps {
  row: GameRow;
  /** The store games this game was picked for; shown under the title. */
  storeRefs?: readonly StoreRef[];
  index: number;
  statusData: StatusOption[];
  expanded: boolean;
  onToggleExpand: (index: number) => void;
  onStatusChange: (index: number, value: GameListStatusEnum) => void;
  onScoreChange: (index: number, value: number | null) => void;
  onFieldChange: (index: number, field: keyof GameRow, value: unknown) => void;
}

const GameRowItemComponent = ({
  row,
  storeRefs,
  index,
  statusData,
  expanded,
  onToggleExpand,
  onStatusChange,
  onScoreChange,
  onFieldChange,
}: GameRowItemProps) => {
  const { t } = useTranslation("games");
  const imageUrl = getIGDBImageURL(row.game.cover_image_id ?? "", IGDBImageSize.COVER_SMALL_90_128);

  return (
    <div className={styles.matchedRow}>
      <div className={styles.matchedRowMain}>
        {imageUrl ? (
          <img src={imageUrl} alt={row.game.title} className={styles.coverThumb} />
        ) : (
          <div className={styles.coverThumbPlaceholder}>
            <IconSearch size={18} color="var(--color-text-400)" />
          </div>
        )}
        <div className={styles.gameInfo}>
          <TruncatedText className={styles.gameTitle}>{row.game.title}</TruncatedText>
          {storeRefs && <StoreRefList refs={storeRefs} />}
        </div>
        <div className={styles.fieldGroup}>
          <Select
            size="xs"
            w={160}
            data={statusData}
            renderOption={renderStatusOption}
            leftSection={row.status ? <StatusIcon status={row.status} size={14} neon /> : undefined}
            value={row.status}
            onChange={val => onStatusChange(index, (val as GameListStatusEnum) ?? GameListStatusEnum.PTP)}
            aria-label={t("import.status")}
          />
          <Select
            size="xs"
            w={90}
            clearable
            placeholder="—"
            data={SCORE_DATA}
            renderOption={renderScoreOption}
            value={row.score === null ? null : row.score.toString()}
            onChange={val => onScoreChange(index, val ? Number(val) : null)}
            aria-label={t("import.score")}
            leftSection={row.score === null ? null : <ScoreBadge score={row.score} size="xs" />}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => onToggleExpand(index)}
            aria-label={expanded ? t("import.collapseRow") : t("import.expandRow")}
            rightSection={expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          >
            {t("import.moreDetails")}
          </Button>
        </div>
      </div>

      {expanded && (
        <div className={styles.expandedFields}>
          <AsyncMultiSelectAutocomplete
            id={`owned-on-${index}`}
            name={`owned_on_${index}`}
            label={t("modal.ownedOnLabel")}
            placeholder={t("modal.ownedOnPlaceholder")}
            useInfiniteQueryHook={useGetGameMediasInfiniteQuery}
            getOptionLabel={item => item.name}
            getOptionValue={item => item.id.toString()}
            value={row.owned_on}
            onChange={val => onFieldChange(index, "owned_on", val)}
            comboboxProps={OWNED_ON_COMBOBOX_PROPS}
          />
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={12}>
            <DateInput
              size="xs"
              label={t("modal.startedAt")}
              placeholder={t("modal.pickDate")}
              clearable
              valueFormat="YYYY-MM-DD"
              value={row.started_at}
              onChange={val => onFieldChange(index, "started_at", val)}
            />
            <DateInput
              size="xs"
              label={t("modal.completedAt")}
              placeholder={t("modal.pickDate")}
              clearable
              valueFormat="YYYY-MM-DD"
              value={row.completed_at}
              onChange={val => onFieldChange(index, "completed_at", val)}
            />
            <NumberInput
              size="xs"
              label={t("modal.playtime")}
              placeholder={t("modal.playtimePlaceholder")}
              min={0}
              step={0.1}
              decimalScale={1}
              allowNegative={false}
              decimalSeparator={i18n.language.startsWith("pl") ? "," : "."}
              value={row.playtime ?? ""}
              onChange={val => onFieldChange(index, "playtime", val === "" ? null : Number(val))}
            />
          </SimpleGrid>
          <Textarea
            size="xs"
            label={t("modal.noteLabel")}
            placeholder={t("modal.notePlaceholder")}
            maxLength={200}
            rows={2}
            value={row.description}
            onChange={e => onFieldChange(index, "description", e.currentTarget.value)}
          />
        </div>
      )}
    </div>
  );
};

/**
 * Memoized so that editing one row doesn't re-render the whole list. The parent
 * hands down stable `useCallback` handlers and a stable `statusData` reference,
 * and only the edited row's `row` object changes identity, so the default
 * shallow prop comparison keeps every other row from re-rendering per keystroke.
 */
export const GameRowItem = React.memo(GameRowItemComponent);
