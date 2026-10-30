import { Group, Stack, Text } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameListStatusEnum } from "@/client";
import { AppModal } from "@/components/ui/AppModal";
import { Button } from "@/components/ui/Button";
import ItemOverlay from "@/components/ui/ItemOverlay";
import { formatDate } from "@/utils/dateUtils";

import { usePartialUpdateGameList } from "../hooks/gameQueries";
import { useRandomPtpGame } from "../hooks/useGameListQueries";
import IGDBImageSize, { getIGDBImageURL } from "../utils/IGDBIntegration";

interface RandomPtpModalProps {
  userId: number;
  opened: boolean;
  onClose: () => void;
}

/** Picks a random "plan to play" game, with one click to re-roll or to start playing it. */
export function RandomPtpModal({ userId, opened, onClose }: Readonly<RandomPtpModalProps>) {
  const { t } = useTranslation("games");
  const { data: game, isFetching, refetch } = useRandomPtpGame(userId, opened);
  const { mutate: updateEntry } = usePartialUpdateGameList();

  const handleStart = () => {
    if (!game) {
      return;
    }
    updateEntry({
      id: game.id,
      body: { status: GameListStatusEnum.P, started_at: formatDate(new Date(), "YYYY-MM-DD") },
      title: game.title,
    });
    onClose();
  };

  return (
    <AppModal
      opened={opened}
      onClose={onClose}
      title={t("gameList.random.title")}
      size="sm"
      centered
      footer={
        <Group justify="flex-end">
          <Button variant="outline" onClick={() => refetch()} isLoading={isFetching}>
            {t("gameList.random.reroll")}
          </Button>
          <Button onClick={handleStart} disabled={!game}>
            {t("gameList.random.startPlaying")}
          </Button>
        </Group>
      }
    >
      <Stack align="center">
        {game ? (
          <ItemOverlay
            style={{ width: 220 }}
            name={game.title}
            itemPageUrl={`/game/${game.game_id}/${game.game_slug}`}
            itemCoverUrl={getIGDBImageURL(game.game_cover_image, IGDBImageSize.COVER_BIG_264_374)}
            status={game.status_code}
            rating={game.score}
          />
        ) : (
          !isFetching && <Text c="dimmed">{t("gameList.random.empty")}</Text>
        )}
      </Stack>
    </AppModal>
  );
}
