import { Loader, Group, Pagination, Box, ScrollArea, Title, SegmentedControl, Select, Table } from "@mantine/core";
import { IconTrash, IconCheck } from "@tabler/icons-react";
import { flexRender, useTable } from "@tanstack/react-table";
import { useTanStackTableDevtools } from "@tanstack/react-table-devtools";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Notification } from "@/client";
import { Button } from "@/components/ui/Button";
import { PageMeta } from "@/components/ui/PageMeta";

import {
  useGetNotifications,
  useMarkNotificationAsRead,
  useMarkAllNotificationsAsRead,
  useDeleteNotification,
  useDeleteAllReadNotifications,
} from "../hooks/notificationQueries";

import { createNotificationColumns, notificationTableFeatures } from "./NotificationsPage.columns";

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

  const handleMarkAsRead = React.useCallback(
    (id: number) => {
      markAsRead({ id });
    },
    [markAsRead],
  );

  const handleMarkAllRead = () => {
    if (globalThis.confirm(t("page.confirmMarkAll"))) {
      markAllAsRead();
    }
  };

  const handleDeleteOne = React.useCallback(
    (id: number) => {
      if (globalThis.confirm(t("page.confirmDelete"))) {
        deleteOne({ id });
      }
    },
    [t, deleteOne],
  );

  const handleDeleteAllRead = () => {
    if (globalThis.confirm(t("page.confirmDeleteAll"))) {
      deleteAllRead();
    }
  };

  const columns = React.useMemo(
    () => createNotificationColumns({ t, onMarkAsRead: handleMarkAsRead, onDelete: handleDeleteOne }),
    [t, handleMarkAsRead, handleDeleteOne],
  );

  const table = useTable({
    key: "notifications-table",
    features: notificationTableFeatures,
    data: notifications,
    columns,
    getRowId: (row: Notification) => row.id.toString(),
  });

  useTanStackTableDevtools(table);

  if (isLoading) {
    return (
      <Box style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "256px" }}>
        <Loader size="lg" />
      </Box>
    );
  }

  const hasUnread = notifications.some((n: Notification) => n.unread);
  const hasRead = notifications.some((n: Notification) => !n.unread);

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

      <ScrollArea
        scrollbars="x"
        style={{ background: "white", borderRadius: "8px", boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}
      >
        <Table highlightOnHover>
          <Table.Thead>
            {table.getHeaderGroups().map(headerGroup => (
              <Table.Tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <Table.Th key={header.id}>
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </Table.Th>
                ))}
              </Table.Tr>
            ))}
          </Table.Thead>
          <Table.Tbody>
            {notifications.length === 0 ? (
              <Table.Tr>
                <Table.Td
                  colSpan={table.getAllLeafColumns().length}
                  style={{ textAlign: "center", paddingBlock: "32px", color: "var(--color-text-400)" }}
                >
                  {t("page.noNotifications")}
                </Table.Td>
              </Table.Tr>
            ) : (
              table.getRowModel().rows.map(row => (
                <Table.Tr key={row.id} bg={row.original.unread ? "var(--mantine-color-primary-0)" : undefined}>
                  {row.getAllCells().map(cell => (
                    <Table.Td key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</Table.Td>
                  ))}
                </Table.Tr>
              ))
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {(hasNext || hasPrevious) && (
        <Group justify="center" mt={24}>
          <Pagination total={totalPages} value={page} onChange={setPage} />
        </Group>
      )}
    </Box>
  );
}
