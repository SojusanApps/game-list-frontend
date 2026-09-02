import { Box, Text } from "@mantine/core";

import { getRatingColor, getRatingTextColor } from "@/utils/ratingUtils";

import styles from "./ScoreBadge.module.css";

/**
 * The app-wide colored score chip (1–10), matching the badge shown on
 * `ItemOverlay`, `GameListRow` and the compare table.
 */
export function ScoreBadge({ score }: Readonly<{ score: number | null | undefined }>): React.JSX.Element {
  if (!score) {
    return <Text fz="sm">—</Text>;
  }
  return (
    <Box
      className={styles.scoreBadge}
      style={{ backgroundColor: getRatingColor(score), color: getRatingTextColor(score) }}
    >
      {Number.isInteger(score) ? score : score.toFixed(1)}
    </Box>
  );
}
