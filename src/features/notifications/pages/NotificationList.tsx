import { ActionIcon, Badge, Box, Group, Skeleton, Stack, Text } from "@mantine/core";
import { IconCheck, IconTrash } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Notification } from "@/client";
import { derivePageCount, LIST_PAGE_SIZE, PaginationControls } from "@/components/ui/PaginatedTable";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatDisplayDateTime } from "@/utils/dateUtils";

import { FriendRequestActions } from "../components/FriendRequestActions";
import { formatText, getCategoryStyle, getLevelColor } from "../utils/notificationBadges";
import { getNotificationLink } from "../utils/notificationLink";

interface NotificationListProps {
  notifications: Notification[];
  count: number;
  page: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

/** Phone layout for the notifications page: one stacked item per notification instead of a seven-column table. */
export function NotificationList({
  notifications,
  count,
  page,
  onPageChange,
  isLoading,
  onMarkAsRead,
  onDelete,
}: Readonly<NotificationListProps>): React.JSX.Element {
  const { t } = useTranslation("notifications");

  if (isLoading) {
    return (
      <Stack gap={8}>
        {["a", "b", "c", "d"].map(key => (
          <Skeleton key={key} h={72} radius="md" />
        ))}
      </Stack>
    );
  }

  if (notifications.length === 0) {
    return (
      <Text ta="center" c="dimmed" py={32}>
        {t("page.noNotifications")}
      </Text>
    );
  }

  return (
    <>
      <Stack gap={8} component="ul" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {notifications.map(notification => {
          const { actor, target } = notification;
          let entity;
          if (actor?.type === "user") {
            entity = actor;
          } else if (target?.type === "user") {
            entity = target;
          }
          const link = getNotificationLink(notification);
          const gameLink = link.to === "/game/$id/$slug" ? link : null;
          return (
            <Box
              component="li"
              key={notification.id}
              p={12}
              style={{
                border: "1px solid var(--color-background-300)",
                borderRadius: 12,
                background: notification.unread ? "var(--color-primary-tint-bg)" : "var(--color-background-100)",
                color: notification.unread ? "var(--color-primary-tint-text)" : undefined,
              }}
            >
              <Group wrap="nowrap" align="flex-start" gap={12}>
                <Box style={{ width: 40, height: 40, borderRadius: 9999, overflow: "hidden", flexShrink: 0 }}>
                  <SafeImage
                    src={entity?.gravatar_url || undefined}
                    alt={t("page.userAvatarAlt")}
                    containerStyle={{ width: 40, height: 40 }}
                  />
                </Box>
                <Stack gap={2} style={{ flex: 1, minWidth: 0 }}>
                  <Text fz="sm" fw={600}>
                    {entity?.type === "user" ? (
                      <Link to="/profile/$id/$slug" params={{ id: String(entity.id), slug: entity.slug || "" }}>
                        {entity.str || t("page.someone")}
                      </Link>
                    ) : (
                      t("page.someone")
                    )}{" "}
                    {gameLink ? (
                      <Link to={gameLink.to} params={gameLink.params}>
                        {notification.verb}
                      </Link>
                    ) : (
                      <Text component="span" fz="sm" fw={400}>
                        {notification.verb}
                      </Text>
                    )}
                  </Text>
                  {entity && <FriendRequestActions senderId={entity.id} />}
                  <Group gap={8}>
                    {notification.unread && (
                      <Badge size="sm" color="primary">
                        {t("page.badgeNew")}
                      </Badge>
                    )}
                    <Badge
                      size="sm"
                      style={{
                        ...getCategoryStyle(notification.category),
                        borderWidth: "1px",
                        borderStyle: "solid",
                      }}
                    >
                      {formatText(t, notification.category)}
                    </Badge>
                    <Badge size="sm" variant="dot" color={getLevelColor(notification.level)}>
                      {formatText(t, notification.level)}
                    </Badge>
                    <Text component="span" fz="xs" style={{ opacity: 0.75 }}>
                      {formatDisplayDateTime(notification.timestamp)}
                    </Text>
                  </Group>
                </Stack>
                {notification.unread ? (
                  <ActionIcon
                    variant="subtle"
                    color="primary"
                    size="lg"
                    aria-label={t("page.tooltipMarkRead")}
                    onClick={() => onMarkAsRead(notification.id)}
                  >
                    <IconCheck size={18} />
                  </ActionIcon>
                ) : (
                  <ActionIcon
                    variant="subtle"
                    color="error"
                    size="lg"
                    aria-label={t("page.tooltipDelete")}
                    onClick={() => onDelete(notification.id)}
                  >
                    <IconTrash size={18} />
                  </ActionIcon>
                )}
              </Group>
            </Box>
          );
        })}
      </Stack>
      <PaginationControls
        page={page}
        totalPages={derivePageCount({ count, pageSize: LIST_PAGE_SIZE, page })}
        onPageChange={onPageChange}
      />
    </>
  );
}
