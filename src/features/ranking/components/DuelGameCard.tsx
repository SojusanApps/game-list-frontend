import { Box, Group, Text, UnstyledButton } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { SafeImage } from "@/components/ui/SafeImage";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";

import type { RankedItem } from "../types";

import styles from "./DuelGameCard.module.css";

interface DuelGameCardProps {
  item: RankedItem;
  side: "left" | "right";
  onClick: () => void;
}

export const DuelGameCard = React.memo(function ({ item, side, onClick }: Readonly<DuelGameCardProps>) {
  const { t } = useTranslation("ranking");
  const cardClass = side === "left" ? styles.cardLeft : styles.cardRight;
  const accentColor = side === "left" ? "var(--color-primary-500)" : "var(--color-secondary-500)";

  return (
    <UnstyledButton onClick={onClick} className={`${styles.card} ${cardClass}`}>
      <Box className={styles.imageContainer}>
        <SafeImage
          src={getIGDBImageURL(item.coverImageId ?? "", IGDBImageSize.COVER_BIG_264_374)}
          alt={item.title}
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      </Box>

      <Text
        fw={900}
        c="var(--color-text-900)"
        ta="center"
        lineClamp={2}
        style={{ textTransform: "uppercase", letterSpacing: "-0.025em", width: "100%" }}
        fz={{ base: "sm", md: "base" }}
      >
        {item.title}
      </Text>

      <Group gap={8}>
        <Text
          component="span"
          fz="xs"
          fw={700}
          c="white"
          bg={accentColor}
          style={{ padding: "2px 8px", borderRadius: "9999px" }}
        >
          {item.rating}
        </Text>
        <Text component="span" fz="xs" c="var(--color-text-400)">
          {item.matchesPlayed} {t("results.match", { count: item.matchesPlayed })}
        </Text>
      </Group>
    </UnstyledButton>
  );
});

DuelGameCard.displayName = "DuelGameCard";
