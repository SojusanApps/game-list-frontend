import { Box, Group, NumberInput, Stack, Text, UnstyledButton, ActionIcon, Tooltip, Menu } from "@mantine/core";
import {
  IconGripVertical,
  IconChevronUp,
  IconChevronDown,
  IconNote,
  IconTrash,
  IconNoteOff,
  IconExternalLink,
  IconDotsVertical,
  IconFlag,
  IconShieldExclamation,
} from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import type { User } from "@/client";
import { TargetTypeEnum } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";
import { ReportButton } from "@/features/moderation/components/ReportButton";
import { WarnAndRemoveButton } from "@/features/moderation/components/WarnAndRemoveButton";

import rowStyles from "./RankingRow.module.css";

interface RankingRowProps {
  rank: number;
  itemId: number;
  addedBy: User;
  gameId: number;
  gameSlug: string;
  totalItems: number;
  title: string;
  coverImageId?: string | null;
  description?: string;
  onDescriptionClick?: () => void;
  isOwner: boolean;
  onRemove?: () => void;
  isDragging?: boolean;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
  onPositionChange?: (newPosition: number) => void;
}

function resolvePositionInput(value: number | string): number {
  return typeof value === "number" ? value : Math.trunc(Number(String(value)));
}

function isValidNewPosition(pos: number, rank: number, total: number): boolean {
  return !Number.isNaN(pos) && pos >= 1 && pos <= total && pos !== rank;
}

function RankControls({
  isOwner,
  rank,
  totalItems,
  onMoveUp,
  onMoveDown,
}: Readonly<{
  isOwner: boolean;
  rank: number;
  totalItems: number;
  onMoveUp?: () => void;
  onMoveDown?: () => void;
}>) {
  if (!isOwner) return null;
  return (
    <Group gap={4} className={rowStyles.rankingRowControls} wrap="nowrap">
      <ActionIcon className={rowStyles.rankingRowDrag} variant="transparent" color="gray" style={{ cursor: "grab" }}>
        <IconGripVertical size={18} stroke={1.5} />
      </ActionIcon>
      <Stack gap={0} justify="center">
        <ActionIcon
          variant="transparent"
          color="gray"
          onClick={onMoveUp}
          disabled={rank === 1}
          size="sm"
          className={rowStyles.rankingRowArrow}
        >
          <IconChevronUp size={16} stroke={2} />
        </ActionIcon>
        <ActionIcon
          variant="transparent"
          color="gray"
          onClick={onMoveDown}
          disabled={rank === totalItems}
          size="sm"
          className={rowStyles.rankingRowArrow}
        >
          <IconChevronDown size={16} stroke={2} />
        </ActionIcon>
      </Stack>
    </Group>
  );
}

function ActionButtons({
  itemId,
  addedBy,
  gameId,
  gameSlug,
  isOwner,
  hasDescription,
  onDescriptionClick,
  onRemove,
}: Readonly<{
  itemId: number;
  addedBy: User;
  gameId: number;
  gameSlug: string;
  isOwner: boolean;
  hasDescription: boolean | "" | undefined;
  onDescriptionClick?: () => void;
  onRemove?: () => void;
}>) {
  const { t } = useTranslation("collections");
  const { t: tModeration } = useTranslation("moderation");
  return (
    <>
      <Group gap={8} className={rowStyles.rankingRowActionsDesktop} wrap="nowrap" visibleFrom="sm">
        <Tooltip label={t("rankingRow.viewDetails")} withArrow position="top">
          <ActionIcon
            component={Link}
            to={`/game/${gameId}/${gameSlug}`}
            variant="light"
            color="indigo"
            size="lg"
            radius="md"
          >
            <IconExternalLink size={18} stroke={1.5} />
          </ActionIcon>
        </Tooltip>

        <Tooltip label={hasDescription ? t("rankingRow.editNote") : t("rankingRow.addNote")} withArrow position="top">
          <ActionIcon
            variant="light"
            color={hasDescription ? "blue" : "gray"}
            onClick={onDescriptionClick}
            size="lg"
            radius="md"
            display={isOwner ? "inline-flex" : "none"}
            className={hasDescription ? undefined : rowStyles.rankingRowAddNoteBtn}
          >
            {hasDescription ? <IconNote size={18} stroke={1.5} /> : <IconNoteOff size={18} stroke={1.5} />}
          </ActionIcon>
        </Tooltip>

        {onRemove && (
          <Tooltip label={t("rankingRow.removeGame")} withArrow position="top">
            <ActionIcon
              variant="light"
              color="red"
              onClick={e => {
                e.preventDefault();
                e.stopPropagation();
                onRemove();
              }}
              size="lg"
              radius="md"
              display={isOwner ? "inline-flex" : "none"}
              className={rowStyles.rankingRowRemove}
            >
              <IconTrash size={18} stroke={1.5} />
            </ActionIcon>
          </Tooltip>
        )}

        {!isOwner && (
          <>
            <ReportButton
              targetType={TargetTypeEnum.COLLECTION_ITEM_NOTE}
              targetId={itemId}
              ownerId={addedBy.id}
              ownerUsername={addedBy.username}
            />
            <WarnAndRemoveButton
              targetType={TargetTypeEnum.COLLECTION_ITEM_NOTE}
              targetId={itemId}
              ownerId={addedBy.id}
              ownerUsername={addedBy.username}
            />
          </>
        )}
      </Group>

      <Box hiddenFrom="sm" className={rowStyles.rankingRowActionsMobile}>
        <Menu position="bottom-end" withArrow shadow="md">
          <Menu.Target>
            <ActionIcon variant="subtle" color="gray" size="lg" radius="md">
              <IconDotsVertical size={18} stroke={1.5} />
            </ActionIcon>
          </Menu.Target>

          <Menu.Dropdown>
            <Menu.Item component={Link} to={`/game/${gameId}`} leftSection={<IconExternalLink size={16} />}>
              {t("rankingRow.viewDetails")}
            </Menu.Item>

            {isOwner && (
              <Menu.Item
                leftSection={hasDescription ? <IconNote size={16} /> : <IconNoteOff size={16} />}
                onClick={onDescriptionClick}
              >
                {hasDescription ? t("rankingRow.editNote") : t("rankingRow.addNote")}
              </Menu.Item>
            )}

            {isOwner && onRemove && (
              <Menu.Item
                color="red"
                leftSection={<IconTrash size={16} />}
                onClick={e => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRemove();
                }}
              >
                {t("rankingRow.removeGame")}
              </Menu.Item>
            )}

            {!isOwner && (
              <>
                <ReportButton
                  targetType={TargetTypeEnum.COLLECTION_ITEM_NOTE}
                  targetId={itemId}
                  ownerId={addedBy.id}
                  ownerUsername={addedBy.username}
                  renderTrigger={({ onClick }) => (
                    <Menu.Item leftSection={<IconFlag size={16} />} onClick={onClick}>
                      {tModeration("reportButton.ariaLabel")}
                    </Menu.Item>
                  )}
                />
                <WarnAndRemoveButton
                  targetType={TargetTypeEnum.COLLECTION_ITEM_NOTE}
                  targetId={itemId}
                  ownerId={addedBy.id}
                  ownerUsername={addedBy.username}
                  renderTrigger={({ onClick }) => (
                    <Menu.Item leftSection={<IconShieldExclamation size={16} />} onClick={onClick}>
                      {tModeration("warnAndRemoveButton.ariaLabel")}
                    </Menu.Item>
                  )}
                />
              </>
            )}
          </Menu.Dropdown>
        </Menu>
      </Box>
    </>
  );
}

export const RankingRow = React.memo(
  ({
    rank,
    itemId,
    addedBy,
    gameId,
    gameSlug,
    totalItems,
    title,
    coverImageId,
    description,
    onDescriptionClick,
    isOwner,
    onRemove,
    isDragging,
    onMoveUp,
    onMoveDown,
    onPositionChange,
  }: Readonly<RankingRowProps>) => {
    const { t } = useTranslation("collections");
    const [isEditingPosition, setIsEditingPosition] = React.useState(false);
    const [positionInput, setPositionInput] = React.useState<number | string>(rank);
    const [prevRank, setPrevRank] = React.useState<number>(rank);

    if (rank !== prevRank) {
      setPrevRank(rank);
      setPositionInput(rank);
    }

    const hasDescription = description && description.trim().length > 0;

    const handlePositionSubmit = () => {
      const newPosition = resolvePositionInput(positionInput);
      if (isValidNewPosition(newPosition, rank, totalItems)) {
        onPositionChange?.(newPosition);
      }
      setIsEditingPosition(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter") {
        handlePositionSubmit();
      } else if (e.key === "Escape") {
        setPositionInput(String(rank));
        setIsEditingPosition(false);
      }
    };

    return (
      <Box
        className={rowStyles.rankingRow}
        style={{
          background: "var(--color-background-100)",
          borderRadius: 16,
          border: "1px solid var(--color-background-200)",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          position: "relative",
          opacity: isDragging ? 0.4 : 1,
          transition: "all 0.2s ease",
          padding: "12px",
        }}
      >
        <div className={rowStyles.rankingRowInner}>
          {/* Controls: Drag, Up/Down, Rank */}
          <div className={rowStyles.rankingRowControlsGroup}>
            <RankControls
              isOwner={isOwner}
              rank={rank}
              totalItems={totalItems}
              onMoveUp={onMoveUp}
              onMoveDown={onMoveDown}
            />

            {isEditingPosition && isOwner ? (
              <NumberInput
                min={1}
                max={totalItems}
                value={positionInput}
                onChange={setPositionInput}
                onBlur={handlePositionSubmit}
                onKeyDown={handleKeyDown}
                hideControls
                styles={{
                  input: {
                    width: 50,
                    height: 36,
                    borderRadius: 12,
                    background: "var(--color-primary-50)",
                    border: "2px solid var(--color-primary-300)",
                    fontSize: 16,
                    fontWeight: 800,
                    color: "var(--color-primary-600)",
                    textAlign: "center",
                    padding: 0,
                  },
                }}
              />
            ) : (
              <UnstyledButton
                onClick={() => isOwner && setIsEditingPosition(true)}
                disabled={!isOwner}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 48,
                  height: 36,
                  borderRadius: 12,
                  background: isOwner ? "var(--color-background-50)" : "transparent",
                  fontSize: 16,
                  fontWeight: 900,
                  color: "var(--color-text-900)",
                  flexShrink: 0,
                  transition: "background 0.2s",
                  cursor: isOwner ? "pointer" : "default",
                }}
                className={isOwner ? rowStyles.rankingRowRankHover : ""}
                title={isOwner ? t("rankingRow.clickToEditRank") : undefined}
              >
                #{rank}
              </UnstyledButton>
            )}
          </div>

          <div className={rowStyles.rankingRowContent}>
            {/* Game Image */}
            <Box
              style={{
                width: 48,
                height: 64,
                borderRadius: 8,
                overflow: "hidden",
                flexShrink: 0,
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                border: "1px solid var(--color-background-100)",
              }}
            >
              <SafeImage
                src={getIGDBImageURL(coverImageId ?? "", IGDBImageSize.COVER_SMALL_90_128)}
                alt={title}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>

            {/* Title and Inline Description */}
            <Stack gap={2} style={{ flex: 1, minWidth: 0, justifyContent: "center" }}>
              <Text
                fw={800}
                fz="sm"
                style={{
                  overflow: "hidden",
                  display: "-webkit-box",
                  WebkitLineClamp: 1,
                  WebkitBoxOrient: "vertical",
                  color: "var(--color-text-900)",
                  lineHeight: 1.2,
                }}
              >
                {title}
              </Text>
              {hasDescription && (
                <Text
                  size="xs"
                  c="var(--color-text-500)"
                  style={{
                    overflow: "hidden",
                    display: "-webkit-box",
                    WebkitLineClamp: 1,
                    WebkitBoxOrient: "vertical",
                    fontStyle: "italic",
                    lineHeight: 1.4,
                  }}
                >
                  “{description}”
                </Text>
              )}
              {!hasDescription && isOwner && (
                <Text
                  size="xs"
                  c="var(--color-text-300)"
                  style={{ cursor: "pointer" }}
                  onClick={onDescriptionClick}
                  className={rowStyles.addNotePrompt}
                >
                  {t("rankingRow.addNotePrompt")}
                </Text>
              )}
            </Stack>
          </div>

          {/* Actions */}
          <ActionButtons
            itemId={itemId}
            addedBy={addedBy}
            gameId={gameId}
            gameSlug={gameSlug}
            isOwner={isOwner}
            hasDescription={hasDescription}
            onDescriptionClick={onDescriptionClick}
            onRemove={onRemove}
          />
        </div>
      </Box>
    );
  },
);

RankingRow.displayName = "RankingRow";
