import { Box } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { AppModal } from "@/components/ui/AppModal";

import { getYouTubeEmbedURL } from "../utils/youtube";

interface VideoModalProps {
  videoId: string;
  name: string;
  gameTitle?: string;
  onClose: () => void;
}

export default function VideoModal({ videoId, name, gameTitle, onClose }: Readonly<VideoModalProps>) {
  const { t } = useTranslation("games");
  return (
    <AppModal
      opened
      onClose={onClose}
      title={name}
      subtitle={gameTitle}
      size="xl"
      centered
      bodyPadding={0}
      closeButtonLabel={t("video.closeAria")}
    >
      <Box style={{ aspectRatio: "16 / 9", width: "100%", background: "black" }}>
        <iframe
          src={getYouTubeEmbedURL(videoId)}
          title={t("video.playerTitle", { name })}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
          style={{ width: "100%", height: "100%", border: 0, display: "block" }}
        />
      </Box>
    </AppModal>
  );
}
