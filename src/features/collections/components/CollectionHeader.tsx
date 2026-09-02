import { Stack, Group, Title, Text, Flex } from "@mantine/core";
import { IconSwords } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { CollectionDetail, ModeEnum, TargetTypeEnum } from "@/client";
import { Button } from "@/components/ui/Button";
import { useCurrentUserId, useIsOwner } from "@/features/auth";
import { ReportButton } from "@/features/moderation/components/ReportButton";
import { WarnAndRemoveButton } from "@/features/moderation/components/WarnAndRemoveButton";
import { formatDisplayDate } from "@/utils/dateUtils";

import styles from "./CollectionHeader.module.css";

interface CollectionHeaderProps {
  collection: CollectionDetail;
  onEdit?: () => void;
  onAddGame?: () => void;
  onPairwiseRank?: () => void;
}

export const CollectionHeader = ({ collection, onEdit, onAddGame, onPairwiseRank }: CollectionHeaderProps) => {
  const isOwner = useIsOwner(collection.user.id);
  const currentUserId = useCurrentUserId();
  const { t } = useTranslation("collections");

  const canEdit = React.useMemo(() => {
    if (isOwner) return true;
    if (!currentUserId) return false;
    return collection.mode === ModeEnum.C && collection.collaborators.some(c => Number(c.id) === currentUserId);
  }, [isOwner, currentUserId, collection.mode, collection.collaborators]);

  return (
    <Stack gap="md" w="100%">
      <Flex
        direction={{ base: "column", md: "row" }}
        align={{ base: "flex-start", md: "center" }}
        justify="space-between"
        gap="md"
      >
        <Stack gap={8}>
          <Group gap={12} fz="sm" fw={700} c="var(--color-text-500)" tt="uppercase" style={{ letterSpacing: "0.1em" }}>
            <Link
              to={"/profile/$id/$slug/collections"}
              params={{ id: collection.user.id.toString(), slug: collection.user.slug || "" }}
              className={styles.ownerLink}
            >
              {collection.user.username}
              {t("header.collectionsLink")}
            </Link>
            <Text span>•</Text>
            <Text span>{formatDisplayDate(collection.created_at)}</Text>
            <Text span>•</Text>
            <Text span c="var(--color-primary-500)">
              {collection.visibility_display}
            </Text>
          </Group>
          <Group gap={8} align="center">
            <Title
              order={1}
              fz={{ base: 30, md: 48 }}
              fw={900}
              c="var(--color-text-900)"
              style={{ letterSpacing: "-0.025em" }}
            >
              {collection.name}
            </Title>
            <ReportButton
              targetType={TargetTypeEnum.COLLECTION}
              targetId={collection.id}
              ownerId={collection.user.id}
              ownerUsername={collection.user.username}
            />
            <WarnAndRemoveButton
              targetType={TargetTypeEnum.COLLECTION}
              targetId={collection.id}
              ownerId={collection.user.id}
              ownerUsername={collection.user.username}
            />
          </Group>
          {collection.description && (
            <Text c="var(--color-text-600)" maw={672} fz="lg" style={{ lineHeight: 1.6 }}>
              {collection.description}
            </Text>
          )}
        </Stack>

        <Group gap={12} wrap="wrap">
          {canEdit && onPairwiseRank && (
            <Button
              onClick={onPairwiseRank}
              variant="outline"
              leftSection={<IconSwords size={16} stroke={1.5} />}
              style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingInline: "24px" }}
            >
              {t("header.pairwiseRank")}
            </Button>
          )}
          {canEdit && (
            <Button
              onClick={onAddGame}
              style={{
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                paddingInline: "24px",
                boxShadow: "0 10px 15px -3px rgba(99,102,241,0.2)",
              }}
            >
              {t("header.addGame")}
            </Button>
          )}
          {isOwner && (
            <Button
              onClick={onEdit}
              variant="outline"
              style={{ fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", paddingInline: "24px" }}
            >
              {t("header.editCollection")}
            </Button>
          )}
        </Group>
      </Flex>
    </Stack>
  );
};
