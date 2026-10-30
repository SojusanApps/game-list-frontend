import { Badge, Box, Group, Text, Tooltip, ActionIcon } from "@mantine/core";
import { IconTrash, IconCheck } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { createColumnHelper, ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";

import { Notification } from "@/client";
import { type PaginatedTableFeatures } from "@/components/ui/PaginatedTable";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatDisplayDateTime } from "@/utils/dateUtils";

import { FriendRequestActions } from "../components/FriendRequestActions";
import { formatText, getCategoryStyle, getLevelColor } from "../utils/notificationBadges";
import { getNotificationLink } from "../utils/notificationLink";

import pageStyles from "./NotificationsPage.module.css";

type NotificationTableFeatures = PaginatedTableFeatures;

const columnHelper = createColumnHelper<NotificationTableFeatures, Notification>();

interface CreateNotificationColumnsArgs {
  t: TFunction<"notifications">;
  onMarkAsRead: (id: number) => void;
  onDelete: (id: number) => void;
}

export function createNotificationColumns({
  t,
  onMarkAsRead,
  onDelete,
}: CreateNotificationColumnsArgs): ColumnDef<NotificationTableFeatures, Notification, any>[] {
  return [
    columnHelper.accessor("unread", {
      id: "status",
      header: t("page.tableStatus"),
      cell: info =>
        info.getValue() ? (
          <Badge size="sm" color="primary">
            {t("page.badgeNew")}
          </Badge>
        ) : (
          <Badge size="sm" variant="light" color="gray" style={{ opacity: 0.5 }}>
            {t("page.badgeRead")}
          </Badge>
        ),
    }),
    columnHelper.display({
      id: "user",
      header: t("page.tableUser"),
      cell: ({ row }) => {
        const { actor, target } = row.original;
        let displayEntity;
        if (actor?.type === "user") {
          displayEntity = actor;
        } else if (target?.type === "user") {
          displayEntity = target;
        }

        return (
          <Group gap={12}>
            <Box style={{ width: "40px", height: "40px", borderRadius: "9999px", overflow: "hidden" }}>
              <SafeImage
                src={displayEntity?.gravatar_url || undefined}
                alt={t("page.userAvatarAlt")}
                containerStyle={{ width: "40px", height: "40px" }}
              />
            </Box>
            {displayEntity?.type === "user" && (
              <Link
                to={"/profile/$id/$slug"}
                params={{
                  id: displayEntity?.id?.toString() || "",
                  slug: displayEntity?.slug || "",
                }}
                className={pageStyles.tableUserLink}
              >
                {displayEntity?.str || t("page.someone")}
              </Link>
            )}
          </Group>
        );
      },
    }),
    columnHelper.accessor("verb", {
      id: "action",
      header: t("page.tableAction"),
      cell: ({ row, getValue }) => {
        const link = getNotificationLink(row.original);
        // Release notifications go to the game; the rest already show their user in the previous column.
        return link.to === "/game/$id/$slug" ? (
          <Link to={link.to} params={link.params} className={pageStyles.tableUserLink}>
            {getValue()}
          </Link>
        ) : (
          getValue()
        );
      },
    }),
    columnHelper.accessor("category", {
      id: "category",
      header: t("page.tableCategory"),
      cell: info => (
        <Badge size="sm" style={{ ...getCategoryStyle(info.getValue()), borderWidth: "1px", borderStyle: "solid" }}>
          {formatText(t, info.getValue())}
        </Badge>
      ),
    }),
    columnHelper.accessor("level", {
      id: "level",
      header: t("page.tableLevel"),
      cell: info => (
        <Badge size="sm" variant="dot" color={getLevelColor(info.getValue())}>
          {formatText(t, info.getValue())}
        </Badge>
      ),
    }),
    columnHelper.accessor("timestamp", {
      id: "date",
      header: t("page.tableDate"),
      cell: info => (
        <Text component="span" fz="sm" style={{ opacity: 0.7 }}>
          {formatDisplayDateTime(info.getValue())}
        </Text>
      ),
    }),
    columnHelper.display({
      id: "actions",
      header: t("page.tableActions"),
      cell: ({ row }) => {
        const notification = row.original;
        const requester = [notification.actor, notification.target].find(entity => entity?.type === "user");
        return (
          <Group gap="xs">
            {requester && <FriendRequestActions senderId={requester.id} />}
            {notification.unread && (
              <Tooltip label={t("page.tooltipMarkRead")}>
                <ActionIcon
                  variant="subtle"
                  color="primary"
                  size="md"
                  aria-label={t("page.tooltipMarkRead")}
                  onClick={() => onMarkAsRead(notification.id)}
                >
                  <IconCheck style={{ width: 16, height: 16 }} />
                </ActionIcon>
              </Tooltip>
            )}
            {!notification.unread && (
              <Tooltip label={t("page.tooltipDelete")}>
                <ActionIcon
                  variant="subtle"
                  color="error"
                  size="md"
                  aria-label={t("page.tooltipDelete")}
                  onClick={() => onDelete(notification.id)}
                >
                  <IconTrash style={{ width: 16, height: 16 }} />
                </ActionIcon>
              </Tooltip>
            )}
          </Group>
        );
      },
    }),
  ];
}
