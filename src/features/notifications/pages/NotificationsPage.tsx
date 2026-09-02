import { Loader, Group, Box, Title, SegmentedControl, Select } from "@mantine/core";
import { IconTrash, IconCheck } from "@tabler/icons-react";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Notification } from "@/client";
import { Button } from "@/components/ui/Button";
import { PageMeta } from "@/components/ui/PageMeta";
import { LIST_PAGE_SIZE, PaginatedTable } from "@/components/ui/PaginatedTable";
import { useConfirm } from "@/hooks/useConfirm";

import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllReadNotifications,
} from "../hooks/notificationQueries";
import { createNotificationColumns } from "./NotificationsPage.columns";

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

  const { confirm, confirmModal } = useConfirm();
  const { data: notificationsData, isLoading, isFetching } = useGetNotifications(queryParams);
  const { mutate: markAsRead } = useMarkNotificationAsRead();
  const { mutate: markAllAsRead } = useMarkAllNotificationsAsRead();
  const { mutate: deleteOne } = useDeleteNotification();
  const { mutate: deleteAllRead } = useDeleteAllReadNotifications();

  const notifications = notificationsData?.results ?? [];

  const handleMarkAsRead = React.useCallback(
    (id: number) => {
      markAsRead({ id });
    },
    [markAsRead],
  );

  const handleMarkAllRead = async () => {
    if (await confirm({ title: t("page.markAllRead"), message: t("page.confirmMarkAll") })) {
      markAllAsRead();
    }
  };

  const handleDeleteOne = React.useCallback(
    async (id: number) => {
      if (await confirm({ title: t("page.tooltipDelete"), message: t("page.confirmDelete"), isDestructive: true })) {
        deleteOne({ id });
      }
    },
    [t, confirm, deleteOne],
  );

  const handleDeleteAllRead = async () => {
    if (await confirm({ title: t("page.deleteAllRead"), message: t("page.confirmDeleteAll"), isDestructive: true })) {
      deleteAllRead();
    }
  };

  const columns = React.useMemo(
    () => createNotificationColumns({ t, onMarkAsRead: handleMarkAsRead, onDelete: handleDeleteOne }),
    [t, handleMarkAsRead, handleDeleteOne],
  );

  const resetToFirstPage = () => setPage(1);

  const hasUnread = notifications.some((n: Notification) => n.unread);
  const hasRead = notifications.some((n: Notification) => !n.unread);

  return (
    <Box maw={1024} mx="auto" p={16}>
      {confirmModal}
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
            resetToFirstPage();
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
            resetToFirstPage();
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
            resetToFirstPage();
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
              resetToFirstPage();
            }}
          >
            {t("page.clearFilters")}
          </Button>
        )}
      </Group>

      <PaginatedTable
        columns={columns}
        data={notifications}
        count={notificationsData?.count ?? 0}
        page={page}
        onPageChange={setPage}
        pageSize={LIST_PAGE_SIZE}
        getRowId={(row: Notification) => row.id.toString()}
        isLoading={isLoading}
        isFetching={isFetching}
        emptyLabel={t("page.noNotifications")}
        rowStyle={(row: Notification) =>
          row.unread
            ? { background: "var(--color-row-highlight-bg)", color: "var(--color-row-highlight-text)" }
            : undefined
        }
      />
    </Box>
  );
}
