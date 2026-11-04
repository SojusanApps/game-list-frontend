import { Paper, SimpleGrid, Text, UnstyledButton } from "@mantine/core";
import { IconPlayerPlayFilled, IconVideoOff } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Game, GameVideo } from "@/client";
import { EmptyState } from "@/components/ui/EmptyState";
import { SafeImage } from "@/components/ui/SafeImage";

import { getYouTubeThumbnailURL } from "../utils/youtube";

import styles from "./GameDetailsVideosTab.module.css";

interface GameDetailsVideosTabProps {
  gameDetails?: Game;
  onVideoClick: (video: GameVideo) => void;
}

export default function GameDetailsVideosTab({ gameDetails, onVideoClick }: Readonly<GameDetailsVideosTabProps>) {
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
      {gameDetails?.videos && gameDetails.videos.length > 0 ? (
        <SimpleGrid cols={{ base: 1, sm: 2 }} spacing={16}>
          {gameDetails.videos.map(video => (
            <UnstyledButton
              key={video.video_id}
              onClick={() => onVideoClick(video)}
              className={styles.card}
              aria-label={t("video.playAria", { name: video.name })}
            >
              <div className={styles.thumbnail}>
                <SafeImage
                  className={styles.image}
                  src={getYouTubeThumbnailURL(video.video_id)}
                  alt={t("video.thumbnailAlt", { title: gameDetails.title, name: video.name })}
                />
                <div className={styles.playOverlay}>
                  <span className={styles.playBadge}>
                    <IconPlayerPlayFilled size={28} />
                  </span>
                </div>
              </div>
              <Text className={styles.caption} fw={600} size="sm" c="var(--color-text-700)">
                {video.name}
              </Text>
            </UnstyledButton>
          ))}
        </SimpleGrid>
      ) : (
        <EmptyState
          icon={<IconVideoOff size={40} />}
          title={t("video.noVideos")}
          description={t("video.noVideosDescription")}
        />
      )}
    </Paper>
  );
}
