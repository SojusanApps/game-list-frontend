import { Box, Select, Text, Group, Textarea, NumberInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconSearch, IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameListStatusEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import AsyncMultiSelectAutocomplete from "@/components/ui/Form/AsyncMultiSelectAutocomplete";
import { getRatingColor, getRatingTextColor } from "@/utils/ratingUtils";

import { useGetGameMediasInfiniteQuery } from "../../hooks/gameQueries";
import code_to_value_mapping from "../../utils/GameListStatuses";
import IGDBImageSize, { getIGDBImageURL } from "../../utils/IGDBIntegration";
import { GameRow } from "./types";

import styles from "./GameRowItem.module.css";

interface GameRowItemProps {
  row: GameRow;
  index: number;
  onStatusChange: (index: number, value: GameListStatusEnum) => void;
  onScoreChange: (index: number, value: number | null) => void;
  onFieldChange: (index: number, field: keyof GameRow, value: unknown) => void;
}

export const GameRowItem = ({ row, index, onStatusChange, onScoreChange, onFieldChange }: GameRowItemProps) => {
  const { t } = useTranslation("games");
  const [expanded, setExpanded] = React.useState(false);
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
            data={code_to_value_mapping().map(item => ({ value: item.code, label: item.value }))}
            value={row.status}
            onChange={val => onStatusChange(index, (val as GameListStatusEnum) ?? GameListStatusEnum.PTP)}
            aria-label={t("import.status")}
          />
          <Select
            size="xs"
            w={80}
            clearable
            placeholder="—"
            data={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(s => ({
              value: s.toString(),
              label: s.toString(),
            }))}
            renderOption={({ option }) => (
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
            )}
            value={row.score === null ? null : row.score.toString()}
            onChange={val => onScoreChange(index, val ? Number(val) : null)}
            aria-label={t("import.score")}
          />
          <Button
            type="button"
            size="sm"
            variant="ghost"
            onClick={() => setExpanded(v => !v)}
            aria-label={expanded ? t("import.collapseRow") : t("import.expandRow")}
            rightSection={expanded ? <IconChevronUp size={14} /> : <IconChevronDown size={14} />}
          >
            {t("import.moreDetails")}
          </Button>
        </div>
      </div>

      <div className={styles.expandedFields} style={{ display: expanded ? "flex" : "none" }}>
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
            placeholder="0"
            min={0}
            allowNegative={false}
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
    </div>
  );
};
