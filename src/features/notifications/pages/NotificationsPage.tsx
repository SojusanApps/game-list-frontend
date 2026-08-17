import {
  Table,
  Badge,
  Loader,
  Tooltip,
  ActionIcon,
  Group,
  Pagination,
  Box,
  Text,
  Title,
  SegmentedControl,
  Select,
} from "@mantine/core";
import { IconTrash, IconCheck } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Notification } from "@/client";
import { Button } from "@/components/ui/Button";
import { PageMeta } from "@/components/ui/PageMeta";
import { SafeImage } from "@/components/ui/SafeImage";

import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllReadNotifications,
} from "../hooks/notificationQueries";

import pageStyles from "./NotificationsPage.module.css";

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

function getCategoryColor(category?: string) {
  switch (category?.toLowerCase()) {
    case "system": {
      return "gray";
    }
    case "friendship":
    case "znajomość": {
      return "violet";
    }
    case "game release":
    case "premiera gry": {
      return "orange";
    }
    case "translation":
    case "tłumaczenie": {
      return "grape";
    }
    default: {
      return "blue";
    }
  }
}

export default function NotificationsPage(): React.JSX.Element {
  const { t } = useTranslation("notifications");
  const [page, setPage] = React.useState(1);
  const [unreadFilter, setUnreadFilter] = React.useState<string>("all");
  const [categoryFilter, setCategoryFilter] = React.useState<string | null>(null);
  const [levelFilter, setLevelFilter] = React.useState<string | null>(null);

  const queryParams: Record<string, boolean | string | undefined | number> = { page };
  if (unreadFilter === "unread") {
    queryParams.unread = true;
  }
  if (unreadFilter === "read") {
    queryParams.unread = false;
  }
  if (categoryFilter) {
    queryParams.category = categoryFilter;
  }
  if (levelFilter) {
    queryParams.level = levelFilter;
  }

  const { data: notificationsData, isLoading, isFetching } = useGetNotifications(queryParams);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
  const { mutate: deleteOne } = useDeleteNotification();
  const { mutate: deleteAllRead } = useDeleteAllReadNotifications();

  const notifications = notificationsData?.results ?? [];
  const hasNext = !!notificationsData?.next;
  const hasPrevious = !!notificationsData?.previous;
  const addToPage = hasNext ? 1 : 0;
  const totalPages = hasNext || hasPrevious ? Math.max(page + addToPage, page) : 1;

  const handleMarkAsRead = (id: number) => {
    markAsRead({ id });
  };

  const handleMarkAllRead = () => {
    if (globalThis.confirm(t("page.confirmMarkAll"))) {
      markAllAsRead();
    }
  };

  const handleDeleteOne = (id: number) => {
    if (globalThis.confirm(t("page.confirmDelete"))) {
      deleteOne({ id });
    }
  };

  const handleDeleteAllRead = () => {
    if (globalThis.confirm(t("page.confirmDeleteAll"))) {
      deleteAllRead();
    }
  };

  if (isLoading) {
    return (
      <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "256px" }}>
        <Loader size="lg" />
      </Box>
    );
  }

  const hasUnread = notifications.some((n: Notification) => n.unread);
  const hasRead = notifications.some((n: Notification) => !n.unread);

  const formatText = (text?: string) => {
    if (!text) {
      return t("page.unknown");
    }
    return text
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Box maw={1024} mx="auto" p={16}>
      <PageMeta title={t("page.title")} />
      <Group justify="space-between" align="center" mb={24} gap={16} wrap="wrap">
        <Group gap={8}>
          <Title order={1} fz={24} fw={700}>
            {t("page.title")}
          </Title>
          {isFetching && <Loader size="sm" />}
        </Group>
        <Group gap="sm">
          {hasUnread && (
            <Button onClick={handleMarkAllRead} size="sm">
              <IconCheck style={{ width: 16, height: 16, marginRight: 4 }} />
              {t("page.markAllRead")}
            </Button>
          )}
          {hasRead && (
            <Button onClick={handleDeleteAllRead} variant="destructive" size="sm">
              <IconTrash style={{ width: 16, height: 16, marginRight: 4 }} />
              {t("page.deleteAllRead")}
            </Button>
          )}
        </Group>
      </Group>

      <Group mb={16} gap={16} align="flex-end">
        <SegmentedControl
          value={unreadFilter}
          onChange={val => {
            setUnreadFilter(val);
            setPage(1);
          }}
          data={[
            { label: t("page.filterAll"), value: "all" },
            { label: t("page.filterUnread"), value: "unread" },
            { label: t("page.filterRead"), value: "read" },
          ]}
        />
        <Select
          placeholder={t("page.filterCategory")}
          value={categoryFilter}
          onChange={val => {
            setCategoryFilter(val);
            setPage(1);
          }}
          data={[
            { label: t("page.categorySystem"), value: "system" },
            { label: t("page.categoryFriendship"), value: "friendship" },
            { label: t("page.categoryGameRelease"), value: "game_release" },
            { label: t("page.categoryTranslation"), value: "translation" },
          ]}
          clearable
          style={{ width: 200 }}
        />
        <Select
          placeholder={t("page.filterLevel")}
          value={levelFilter}
          onChange={val => {
            setLevelFilter(val);
            setPage(1);
          }}
          data={[
            { label: t("page.levelInfo"), value: "info" },
            { label: t("page.levelSuccess"), value: "success" },
            { label: t("page.levelWarning"), value: "warning" },
            { label: t("page.levelError"), value: "error" },
          ]}
          clearable
          style={{ width: 200 }}
        />
        {(unreadFilter !== "all" || categoryFilter !== null || levelFilter !== null) && (
          <Button
            variant="ghost"
            onClick={() => {
              setUnreadFilter("all");
              setCategoryFilter(null);
              setLevelFilter(null);
              setPage(1);
            }}
          >
            {t("page.clearFilters")}
          </Button>
        )}
      </Group>

      <Box
        style={{ overflowX: "auto", background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <Table highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>{t("page.tableStatus")}</Table.Th>
              <Table.Th>{t("page.tableUser")}</Table.Th>
              <Table.Th>{t("page.tableAction")}</Table.Th>
              <Table.Th>{t("page.tableCategory")}</Table.Th>
              <Table.Th>{t("page.tableLevel")}</Table.Th>
              <Table.Th>{t("page.tableDate")}</Table.Th>
              <Table.Th>{t("page.tableActions")}</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {notifications.length === 0 ? (
              <Table.Tr>
                <Table.Td
                  colSpan={7}
                  style={{ textAlign: "center", paddingBlock: "32px", color: "var(--color-text-400)" }}
                >
                  {t("page.noNotifications")}
                </Table.Td>
              </Table.Tr>
            ) : (
              notifications.map((notification: Notification) => {
                const actor = notification.actor;
                const target = notification.target;

                let displayEntity;
                if (actor?.type === "user") {
                  displayEntity = actor;
                } else if (target?.type === "user") {
                  displayEntity = target;
                }

                return (
                  <Table.Tr
                    key={notification.id}
                    bg={notification.unread ? "var(--mantine-color-primary-0)" : undefined}
                  >
                    <Table.Td>
                      {notification.unread ? (
                        <Badge size="sm" color="blue">
                          {t("page.badgeNew")}
                        </Badge>
                      ) : (
                        <Badge size="sm" variant="light" color="gray" style={{ opacity: 0.5 }}>
                          {t("page.badgeRead")}
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
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
                    </Table.Td>
                    <Table.Td>{notification.verb}</Table.Td>
                    <Table.Td>
                      <Badge size="sm" variant="light" color={getCategoryColor(notification.category)}>
                        {formatText(notification.category)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge size="sm" variant="dot" color={getLevelColor(notification.level)}>
                        {formatText(notification.level)}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Text component="span" fz="sm" style={{ opacity: 0.7 }}>
                        {new Date(notification.timestamp).toLocaleString()}
                      </Text>
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        {notification.unread && (
                          <Tooltip label={t("page.tooltipMarkRead")}>
                            <ActionIcon
                              variant="subtle"
                              color="blue"
                              size="sm"
                              onClick={() => handleMarkAsRead(notification.id)}
                            >
                              <IconCheck style={{ width: 16, height: 16 }} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                        {!notification.unread && (
                          <Tooltip label={t("page.tooltipDelete")}>
                            <ActionIcon
                              variant="subtle"
                              color="red"
                              size="sm"
                              onClick={() => handleDeleteOne(notification.id)}
                            >
                              <IconTrash style={{ width: 16, height: 16 }} />
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            )}
          </Table.Tbody>
        </Table>
      </Box>

      {(hasNext || hasPrevious) && (
        <Group justify="center" mt={24}>
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </Group>
      )}
    </Box>
  );
}
