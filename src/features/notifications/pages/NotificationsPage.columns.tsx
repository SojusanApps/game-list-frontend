import { Badge, Box, Group, Text, Tooltip, ActionIcon } from "@mantine/core";
import { IconTrash, IconCheck } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import { createColumnHelper, tableFeatures, ColumnDef } from "@tanstack/react-table";
import type { TFunction } from "i18next";
import type React from "react";

import { Notification } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatDisplayDateTime } from "@/utils/dateUtils";

import pageStyles from "./NotificationsPage.module.css";

export const notificationTableFeatures = tableFeatures({});
export type NotificationTableFeatures = typeof notificationTableFeatures;

function getLevelColor(level?: string) {
  switch (level?.toLowerCase()) {
    case "info":
    case "informacja": {
      return "blue";
    }
    case "warning":
    case "ostrzeżenie": {
      return "yellow";
    }
    case "success":
    case "sukces": {
      return "green";
    }
    case "error":
    case "błąd": {
      return "red";
    }
    default: {
      return "gray";
    }
  }
}

function getCategoryStyle(category?: string): React.CSSProperties {
  const hue = (() => {
    switch (category?.toLowerCase()) {
      case "system": {
        return "system";
      }
      case "friendship":
      case "znajomość": {
        return "friendship";
      }
      case "game release":
      case "premiera gry": {
        return "gamerelease";
      }
      case "translation":
      case "tłumaczenie": {
        return "translation";
      }
      default: {
        return "default";
      }
    }
  })();

  return {
    background: `var(--color-category-${hue}-bg)`,
    color: `var(--color-category-${hue}-text)`,
    borderColor: `var(--color-category-${hue}-border)`,
  };
}

function formatText(t: TFunction<"notifications">, text?: string) {
  if (!text) {
    return t("page.unknown");
  }
  return text
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

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
          <Badge size="sm" color="blue">
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
                {displayEntity?.str || "Someone"}
              </Link>
            )}
          </Group>
        );
      },
    }),
    columnHelper.accessor("verb", {
      id: "action",
      header: t("page.tableAction"),
      cell: info => info.getValue(),
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
        return (
          <Group gap="xs">
            {notification.unread && (
              <Tooltip label={t("page.tooltipMarkRead")}>
                <ActionIcon variant="subtle" color="blue" size="sm" onClick={() => onMarkAsRead(notification.id)}>
                  <IconCheck style={{ width: 16, height: 16 }} />
                </ActionIcon>
              </Tooltip>
            )}
            {!notification.unread && (
              <Tooltip label={t("page.tooltipDelete")}>
                <ActionIcon variant="subtle" color="red" size="sm" onClick={() => onDelete(notification.id)}>
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
