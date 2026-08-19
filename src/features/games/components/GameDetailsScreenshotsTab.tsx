import { Box, Paper, SimpleGrid, Stack, Text, Title, UnstyledButton } from "@mantine/core";
import { IconPhotoOff } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Game } from "@/client";
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
                alt={`${gameDetails.title} screenshot ${index + 1}`}
              />
            </UnstyledButton>
          ))}
        </SimpleGrid>
      ) : (
        <Stack align="center" justify="center" gap={24} style={{ paddingBlock: "80px", textAlign: "center" }}>
          <Box
            style={{
              width: "80px",
              height: "80px",
              background: "var(--color-primary-tint-bg)",
              borderRadius: "9999px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconPhotoOff style={{ width: 40, height: 40, color: "var(--color-primary-tint-text)" }} />
          </Box>
          <Stack gap={8}>
            <Title order={3} fz={24} fw={700} c="var(--color-text-900)">
              {t("screenshot.noScreenshots")}
            </Title>
            <Text c="var(--color-text-500)" maw={384} mx="auto">
              {t("screenshot.noScreenshotsDescription")}
            </Text>
          </Stack>
        </Stack>
      )}
    </Paper>
  );
}
