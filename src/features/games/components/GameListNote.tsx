import { ActionIcon, Group, Popover, Stack, Text } from "@mantine/core";
import { IconNote } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameList, TargetTypeEnum } from "@/client";
import { ReportButton } from "@/features/moderation/components/ReportButton";
import { WarnAndRemoveButton } from "@/features/moderation/components/WarnAndRemoveButton";

interface GameListNoteProps {
  gameListItem: GameList;
  isOwner: boolean;
  ownerUsername?: string;
}

/**
 * A Game List Entry's note, visible to everyone (the API masks it when moderated or its author is banned).
 * Opens a popover so it works with keyboard and touch; non-owners can report it.
 */
export function GameListNote({ gameListItem, isOwner, ownerUsername }: Readonly<GameListNoteProps>) {
  const { t } = useTranslation("games");
  if (!gameListItem.description) {
    return null;
  }
  return (
    <Popover width={260} position="top" withArrow shadow="md">
      <Popover.Target>
        <ActionIcon
          variant="filled"
          color="dark"
          radius="xl"
          size="md"
          aria-label={t("gameList.noteLabel")}
          style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)" }}
        >
          <IconNote size={16} />
        </ActionIcon>
      </Popover.Target>
      <Popover.Dropdown>
        <Stack gap={8}>
          <Text size="sm" style={{ overflowWrap: "anywhere" }}>
            {gameListItem.description}
          </Text>
          {!isOwner && (
            <Group gap={4} justify="flex-end">
              <ReportButton
                targetType={TargetTypeEnum.GAME_LIST_NOTE}
                targetId={gameListItem.id}
                ownerId={gameListItem.user}
                ownerUsername={ownerUsername ?? ""}
              />
              <WarnAndRemoveButton
                targetType={TargetTypeEnum.GAME_LIST_NOTE}
                targetId={gameListItem.id}
                ownerId={gameListItem.user}
                ownerUsername={ownerUsername ?? ""}
              />
            </Group>
          )}
        </Stack>
      </Popover.Dropdown>
    </Popover>
  );
}
