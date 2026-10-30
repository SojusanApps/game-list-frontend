import { Group, Input, UnstyledButton } from "@mantine/core";
import * as React from "react";

import { cn } from "@/utils/cn";
import { getRatingColor, getRatingTextColor } from "@/utils/ratingUtils";

import styles from "./ScorePicker.module.css";

const SCORE_OPTIONS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

interface ScorePickerProps {
  label: string;
  value: number | null | undefined;
  onChange: (score: number | null) => void;
  error?: React.ReactNode;
}

/** Ten score buttons, each in its rating color; the chosen one is ringed and enlarged, the rest fade. */
export function ScorePicker({ label, value, onChange, error }: Readonly<ScorePickerProps>) {
  return (
    <Input.Wrapper label={label} error={error} style={{ flex: "1 1 100%" }}>
      <Group gap={8} mt={6} className={value ? styles.hasSelection : undefined}>
        {SCORE_OPTIONS.map(score => {
          const selected = value === score;
          return (
            <UnstyledButton
              key={score}
              aria-pressed={selected}
              aria-label={String(score)}
              className={cn(styles.option, selected && styles.selected)}
              onClick={() => onChange(selected ? null : score)}
              style={{ background: getRatingColor(score), color: getRatingTextColor(score) }}
            >
              {score}
            </UnstyledButton>
          );
        })}
      </Group>
    </Input.Wrapper>
  );
}
