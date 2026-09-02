import { Box, Select, Text, Group, Textarea, NumberInput, ComboboxItem } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconSearch, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameListStatusEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import AsyncMultiSelectAutocomplete from "@/components/ui/Form/AsyncMultiSelectAutocomplete";
import i18n from "@/lib/i18n";
import { getRatingColor, getRatingTextColor } from "@/utils/ratingUtils";

import { useGetGameMediasInfiniteQuery } from "../../hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "../../utils/IGDBIntegration";
import { StatusIcon } from "../../utils/StatusIcon";
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
  <Box
    style={{
      background: getRatingColor(Number(option.value)),
      color: getRatingTextColor(Number(option.value)),
      fontSize: "12px",
      fontWeight: 900,
      padding: "2px 8px",
      borderRadius: "6px",
      display: "inline-block",
    }}
  >
    {option.label}
  </Box>
);

const OWNED_ON_COMBOBOX_PROPS = { withinPortal: true } as const;

export interface StatusOption {
  value: string;
  label: string;
}

interface GameRowItemProps {
  row: GameRow;
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
        <Text className={styles.gameTitle} title={row.game.title}>
          {row.game.title}
        </Text>
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
            leftSection={
              row.score === null ? null : (
                <Box style={{ background: getRatingColor(row.score), width: 10, height: 10, borderRadius: "50%" }} />
              )
            }
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
          <Group grow align="flex-start">
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
          </Group>
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
