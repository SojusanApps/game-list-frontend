import { Popover, Box, Group, Text, Stack, UnstyledButton } from "@mantine/core";
import { IconBell } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Notification } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";
import { formatDisplayDate } from "@/utils/dateUtils";

import {
  useGetNotifications,
  useGetUnreadNotificationCount,
  useMarkNotificationAsRead,
} from "../hooks/notificationQueries";

import bellStyles from "./NotificationBell.module.css";

export default function NotificationBell(): React.JSX.Element {
  const { t } = useTranslation("notifications");
  const { data: unreadData } = useGetUnreadNotificationCount();
  const { data: notificationsData } = useGetNotifications();
  const { mutate: markAsRead } = useMarkNotificationAsRead();

  const unreadCount = unreadData?.unread_count ?? 0;
  const notifications = notificationsData?.results ?? [];
  const unreadNotifications = notifications.filter((n: Notification) => n.unread);

  const handleNotificationClick = (notification: Notification) => {
    if (notification.unread) {
      markAsRead({ id: notification.id });
    }
  };

  return (
    <Popover width={384} position="bottom-end" shadow="xl" withArrow>
      <Popover.Target>
        <UnstyledButton className={bellStyles.topbarIconBtn}>
          <Box style={{ position: "relative" }}>
            <IconBell style={{ width: 24, height: 24, color: "var(--mantine-color-primary-2)" }} />
            {unreadCount > 0 && (
              <Text
                component="span"
                style={{
                  position: "absolute",
                  top: "-4px",
                  right: "-4px",
                  display: "flex",
                  width: "16px",
                  height: "16px",
                  alignItems: "center",
                  justifyContent: "center",
                  borderRadius: "9999px",
                  background: "var(--color-error-500)",
                  fontSize: "10px",
                  fontWeight: 700,
                  color: "white",
                  outline: "2px solid var(--mantine-color-primary-9)",
                }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </Text>
            )}
          </Box>
        </UnstyledButton>
      </Popover.Target>

      <Popover.Dropdown style={{ padding: 0, borderRadius: "16px", overflow: "hidden" }}>
        <Group
          justify="space-between"
          align="center"
          p={16}
          style={{ borderBottom: "1px solid var(--color-background-100)", background: "rgba(248,250,252,0.5)" }}
        >
          <Text fw={700} c="var(--color-text-900)">
            {t("bell.title")}
          </Text>
          {unreadCount > 0 && (
            <Text
              component="span"
              style={{
                fontSize: "10px",
                fontWeight: 700,
                padding: "2px 8px",
                background: "var(--mantine-color-primary-0)",
                color: "var(--mantine-color-primary-7)",
                borderRadius: "9999px",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {unreadCount} {t("bell.new")}
            </Text>
          )}
        </Group>

        <Box
          component="ul"
          style={{
            maxHeight: "400px",
            overflowY: "auto",
            overflowX: "hidden",
            display: "flex",
            flexDirection: "column",
            gap: 8,
            padding: 8,
          }}
        >
          {unreadNotifications.length === 0 ? (
            <Stack
              component="li"
              align="center"
              justify="center"
              style={{ paddingBlock: "48px", paddingInline: "16px", textAlign: "center" }}
            >
              <IconBell style={{ width: 40, height: 40, color: "var(--color-background-300)", marginBottom: 8 }} />
              <Text size="sm" c="var(--color-text-500)" fw={500}>
                {t("bell.empty")}
              </Text>
            </Stack>
          ) : (
            unreadNotifications.map((notification: Notification) => {
              const actor = notification.actor;
              const target = notification.target;

              let displayEntity;
              if (actor?.type === "user") {
                displayEntity = actor;
              } else if (target?.type === "user") {
                displayEntity = target;
              }

              return (
                <Box component="li" key={notification.id} className={bellStyles.notificationCard}>
                  <Link
                    to={displayEntity?.type === "user" ? "/profile/$id/$slug" : "/notifications"}
                    params={{ id: displayEntity?.id.toString() || "", slug: displayEntity?.slug || "" }}
                    onClick={() => handleNotificationClick(notification)}
                    className={bellStyles.notificationItemLink}
                  >
                    <Box style={{ flexShrink: 0, position: "relative" }}>
                      <SafeImage
                        containerStyle={{ width: "40px", height: "40px", borderRadius: "9999px" }}
                        src={displayEntity?.gravatar_url || undefined}
                        alt={t("bell.actorAvatarAlt")}
                      />
                    </Box>

                    <Stack gap={0} style={{ minWidth: 0, flex: 1 }}>
                      <Group justify="space-between" align="flex-start" gap={8}>
                        <Text
                          component="span"
                          fw={700}
                          fz="sm"
                          c="var(--color-text-900)"
                          style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
                        >
                          {displayEntity?.str || "Someone"}
                        </Text>
                        <Text
                          component="span"
                          style={{
                            fontSize: "10px",
                            fontWeight: 500,
                            color: "var(--color-text-400)",
                            whiteSpace: "nowrap",
                            paddingTop: "2px",
                          }}
                        >
                          {formatDisplayDate(notification.timestamp)}
                        </Text>
                      </Group>
                      <Text
                        size="xs"
                        c="var(--color-text-600)"
                        style={{
                          lineHeight: 1.4,
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                          overflow: "hidden",
                          marginTop: "2px",
                          fontStyle: "italic",
                        }}
                      >
                        {notification.verb}
                      </Text>
                    </Stack>
                  </Link>
                </Box>
              );
            })
          )}
        </Box>

        <Box
          style={{
            padding: 12,
            background: "rgba(248,250,252,0.8)",
            borderTop: "1px solid var(--color-background-100)",
          }}
        >
          <Link to="/notifications" className={bellStyles.notificationsAllLink}>
            {t("bell.viewAll")}
          </Link>
        </Box>
      </Popover.Dropdown>
    </Popover>
  );
}
