import { Box, Text } from "@mantine/core";

import { cn } from "@/utils/cn";
import { formatScore, getRatingColor, getRatingTextColor, hasScore } from "@/utils/ratingUtils";

import styles from "./ScoreBadge.module.css";

interface ScoreBadgeProps {
  score: number | null | undefined;
  size?: "xs" | "sm" | "lg";
  /** Adds a "/10" suffix. */
  withLabel?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * The app-wide colored score chip (1–10) — the only place score colours are applied, so the same
 * score looks the same on cards, tables, reviews and profiles.
 */
export function ScoreBadge({
  score,
  size = "sm",
  withLabel = false,
  className,
  style,
}: Readonly<ScoreBadgeProps>): React.JSX.Element {
  if (!hasScore(score)) {
    return <Text fz="sm">—</Text>;
  }
  return (
    <Box
      className={cn(styles.scoreBadge, styles[size], className)}
      style={{ backgroundColor: getRatingColor(score), color: getRatingTextColor(score), ...style }}
    >
      {formatScore(score)}
      {withLabel && <span className={styles.label}>/10</span>}
    </Box>
  );
}
