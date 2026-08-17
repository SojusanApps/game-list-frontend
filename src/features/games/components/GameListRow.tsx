import { Box, Group, Text, Badge, ActionIcon, Stack, Tooltip } from "@mantine/core";
import { IconEdit, IconNote } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import React from "react";
import { useTranslation } from "react-i18next";

import { GameList, GameListStatusEnum, TargetTypeEnum } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";
import { STATUS_CONFIG } from "@/features/games/utils/statusConfig";
import { ReportButton } from "@/features/moderation/components/ReportButton";
import { getRatingColor } from "@/utils/ratingUtils";

import styles from "./GameListRow.module.css";

interface GameListRowProps {
  gameListItem: GameList;
  isOwner: boolean;
  onEdit: (gameId: number) => void;
  ownerUsername: string;
}

export const GameListRow = React.memo(({ gameListItem, isOwner, onEdit, ownerUsername }: GameListRowProps) => {
  useTranslation(); // subscribe to language changes so status labels re-render
  const coverUrl = getIGDBImageURL(gameListItem.game_cover_image, IGDBImageSize.COVER_SMALL_90_128);
  const statusConfig = gameListItem.status_code
    ? STATUS_CONFIG[gameListItem.status_code as GameListStatusEnum]
    : undefined;
  const hasNote = gameListItem.description && gameListItem.description.trim().length > 0;

  return (
    <Box className={styles.rowWrapper}>
      <Box
        component={Link}
        to={`/game/${gameListItem.game_id}/${gameListItem.game_slug}`}
        className={styles.rowContent}
        style={{ display: "flex", alignItems: "stretch", flexWrap: "nowrap" }}
      >
        <Box className={styles.coverWrapper}>
          <Box className={styles.coverContainer}>
            <SafeImage src={coverUrl} alt={gameListItem.title} className={styles.coverImage} />
          </Box>
        </Box>

        <Box style={{ flex: 1, padding: "12px 16px" }}>
          <Group justify="space-between" align="flex-start" wrap="nowrap">
            <Stack gap={4}>
              <Text fw={600} fz="lg" c="var(--color-text-900)" className={styles.title}>
                {gameListItem.title}
              </Text>

              <Group gap={8}>
                {statusConfig && (
                  <Badge
                    variant="light"
                    size="sm"
                    style={{
                      ...statusConfig.badgeStyle,
                      borderWidth: "1px",
                      borderStyle: "solid",
                    }}
                  >
                    {statusConfig.emoji} {statusConfig.label}
                  </Badge>
                )}
                {hasNote && (
                  <Tooltip label={gameListItem.description} multiline w={250} withArrow>
                    <IconNote size={16} stroke={1.5} style={{ color: "var(--color-text-500)" }} />
                  </Tooltip>
                )}
              </Group>
            </Stack>

            <Group gap={16} align="center">
              {gameListItem.score !== null && gameListItem.score !== undefined && (
                <Box className={styles.scoreBadge} style={{ backgroundColor: getRatingColor(gameListItem.score) }}>
                  {gameListItem.score}
                </Box>
              )}

              {isOwner && (
                <ActionIcon
                  variant="subtle"
                  color="gray"
                  size="lg"
                  onClick={e => {
                    e.preventDefault();
                    e.stopPropagation();
                    onEdit(gameListItem.game_id);
                  }}
                  className={styles.editAction}
                >
                  <IconEdit size={20} />
                </ActionIcon>
              )}

              {!isOwner && (
                <ReportButton
                  targetType={TargetTypeEnum.GAME_LIST_NOTE}
                  targetId={gameListItem.id}
                  ownerId={gameListItem.user}
                  ownerUsername={ownerUsername}
                />
              )}
            </Group>
          </Group>
        </Box>
      </Box>
    </Box>
  );
});
GameListRow.displayName = "GameListRow";
