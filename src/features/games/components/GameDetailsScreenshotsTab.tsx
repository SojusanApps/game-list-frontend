import { Paper, SimpleGrid, UnstyledButton } from "@mantine/core";
import { IconPhotoOff } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Game } from "@/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { SafeImage } from "@/components/ui/SafeImage";

import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";

import styles from "./GameDetailsScreenshotsTab.module.css";

interface GameDetailsScreenshotsTabProps {
  gameDetails?: Game;
  onScreenshotClick: (screenshot: string) => void;
}

export default function GameDetailsScreenshotsTab({
  gameDetails,
  onScreenshotClick,
}: Readonly<GameDetailsScreenshotsTabProps>) {
  const { t } = useTranslation("games");
  return (
    <Paper
      shadow="sm"
      radius="xl"
      p="xl"
      withBorder
      className={styles.panel}
      style={{ background: "var(--color-background-100)", borderColor: "var(--color-background-200)" }}
    >
      {gameDetails?.screenshots && gameDetails.screenshots.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
          {gameDetails.screenshots.map((screenshot, index) => (
            <UnstyledButton
              key={screenshot || index}
              onClick={() => onScreenshotClick(screenshot)}
              className={styles.thumbnail}
            >
              <SafeImage
                className={styles.image}
                src={getIGDBImageURL(screenshot, IGDBImageSize.SCREENSHOT_MED_569_320)}
                alt={t("screenshot.alt", { title: gameDetails.title, index: index + 1 })}
              />
            </UnstyledButton>
          ))}
        </SimpleGrid>
      ) : (
        <EmptyState
          icon={<IconPhotoOff size={40} />}
          title={t("screenshot.noScreenshots")}
          description={t("screenshot.noScreenshotsDescription")}
        />
      )}
    </Paper>
  );
}
