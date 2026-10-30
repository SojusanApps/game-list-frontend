import { Group, Pill } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Button } from "./Button";

export interface FilterChip {
  key: string;
  /** What the chip shows, e.g. "Type: Ranking". */
  label: string;
  /** What the filter is called, for the remove button's accessible name. */
  name: string;
}

interface FilterChipsProps {
  chips: FilterChip[];
  onRemove: (key: string) => void;
  onClearAll: () => void;
}

/** The one place active filters are shown on list pages: removable chips plus a single "Clear all". */
export function FilterChips({ chips, onRemove, onClearAll }: Readonly<FilterChipsProps>): React.JSX.Element | null {
  const { t } = useTranslation("common");
  if (chips.length === 0) {
    return null;
  }
  return (
    // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- a labelled group of chips, not a form fieldset
    <Group gap={8} justify="center" role="group" aria-label={t("filters.active")}>
      {chips.map(chip => (
        <Pill
          key={chip.key}
          withRemoveButton
          onRemove={() => onRemove(chip.key)}
          removeButtonProps={{ "aria-label": t("filters.remove", { name: chip.name }) }}
          size="md"
        >
          {chip.label}
        </Pill>
      ))}
      <Button variant="ghost" size="sm" onClick={onClearAll}>
        {t("filters.clearAll")}
      </Button>
    </Group>
  );
}
