import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppMutation } from "@/hooks/useAppMutation";
import { notificationKeys } from "@/lib/queryKeys";

import {
  getNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllReadNotifications,
  NotificationListDataQuery,
  NotificationMarkAsReadCreateDataPath,
  NotificationDestroyDataPath,
} from "../api/notification";

export const useGetNotifications = (query?: NotificationListDataQuery) => {
  return useQuery({
    queryKey: notificationKeys.list(query),
    queryFn: () => getNotifications(query),
  });
};

export const useGetUnreadNotificationCount = () => {
  return useQuery({
    queryKey: notificationKeys.unreadCount,
    queryFn: getUnreadNotificationCount,
  });
};

export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (path: NotificationMarkAsReadCreateDataPath) => markNotificationAsRead(path),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
};

export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
};

export const useDeleteNotification = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (path: NotificationDestroyDataPath) => deleteNotification(path),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
};

export const useDeleteAllReadNotifications = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: deleteAllReadNotifications,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: notificationKeys.all,
      });
    },
  });
};
