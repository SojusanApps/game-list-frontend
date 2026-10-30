import { Text } from "@mantine/core";
import * as React from "react";

type TagTone = "primary" | "filled";

const TONES: Record<TagTone, React.CSSProperties> = {
  primary: {
    background: "var(--color-primary-tint-bg)",
    color: "var(--color-primary-tint-text)",
    border: "1px solid var(--color-primary-tint-border)",
  },
  filled: {
    background: "var(--mantine-color-primary-filled)",
    color: "var(--mantine-color-primary-contrast)",
    border: "1px solid transparent",
  },
};

interface TagChipProps {
  children: React.ReactNode;
  tone?: TagTone;
  /** Extra styles, e.g. margin or a color set from a status helper; applied after the tone. */
  style?: React.CSSProperties;
}

/** A small pill label ("Owner view", "Company", "3 new"). Sentence case at 12 px, so it stays legible. */
export function TagChip({ children, tone = "primary", style }: Readonly<TagChipProps>): React.JSX.Element {
  return (
    <Text
      component="span"
      style={{
        display: "inline-block",
        fontSize: 12,
        fontWeight: 700,
        padding: "3px var(--mantine-spacing-sm)",
        borderRadius: "var(--mantine-radius-xl)",
        ...TONES[tone],
        ...style,
      }}
    >
      {children}
    </Text>
  );
}
