import { Stack, Text } from "@mantine/core";
import * as React from "react";

type StatTone = "primary" | "success" | "secondary" | "blue" | "purple" | "neutral";

interface StatCardProps {
  label: string;
  value: React.ReactNode;
  /** Small line under the value (e.g. "120 ratings"). */
  caption?: React.ReactNode;
  tone?: StatTone;
  /** Overrides the tone's colours, e.g. to colour a score card by its rating. */
  colors?: { background: string; text: string; border: string };
}

const TONE_COLORS: Record<StatTone, { background: string; text: string; border: string; value: string }> = {
  primary: {
    background: "var(--color-primary-tint-bg)",
    text: "var(--color-primary-tint-text)",
    border: "var(--color-primary-tint-border)",
    value: "var(--color-primary-tint-text)",
  },
  success: {
    background: "var(--color-success-tint-bg)",
    text: "var(--color-success-tint-text)",
    border: "var(--color-success-tint-border)",
    value: "var(--color-success-tint-text)",
  },
  secondary: {
    background: "var(--color-secondary-tint-bg)",
    text: "var(--color-secondary-tint-text)",
    border: "var(--color-secondary-tint-border)",
    value: "var(--color-secondary-tint-text)",
  },
  // Hues that carry no good/bad meaning, for stats shown next to a red/yellow/green score.
  blue: {
    background: "var(--color-type-normal-bg)",
    text: "var(--color-type-normal-text)",
    border: "var(--color-type-normal-border)",
    value: "var(--color-type-normal-text)",
  },
  purple: {
    background: "var(--color-type-tierlist-bg)",
    text: "var(--color-type-tierlist-text)",
    border: "var(--color-type-tierlist-border)",
    value: "var(--color-type-tierlist-text)",
  },
  neutral: {
    background: "rgba(var(--color-veil-rgb), 0.5)",
    text: "var(--color-text-500)",
    border: "rgba(203,213,225,0.5)",
    value: "var(--color-text-900)",
  },
};

/** A big-number tile: small label, large value, optional caption. */
export function StatCard({ label, value, caption, tone = "neutral", colors }: Readonly<StatCardProps>) {
  const palette = TONE_COLORS[tone];
  const background = colors?.background ?? palette.background;
  const text = colors?.text ?? palette.text;
  const border = colors?.border ?? palette.border;
  const valueColor = colors?.text ?? palette.value;
  return (
    <Stack
      align="center"
      justify="center"
      p="lg"
      style={{
        background,
        borderRadius: "var(--mantine-radius-lg)",
        border: `1px solid ${border}`,
        boxShadow: "0 1px 2px rgba(0,0,0,0.05)",
      }}
    >
      <Text fz="xs" fw={700} c={text} style={{ letterSpacing: "0.04em", marginBottom: "8px" }}>
        {label}
      </Text>
      <Text fz={36} fw={900} c={valueColor}>
        {value}
      </Text>
      {caption && (
        <Text fz="xs" c={text} fw={600} mt={4}>
          {caption}
        </Text>
      )}
    </Stack>
  );
}
