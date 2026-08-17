import {
  NotificationService,
  NotificationListData,
  NotificationMarkAsReadCreateData,
  NotificationDestroyData,
} from "@/client";
import { handleApiError } from "@/utils/apiUtils";
import StatusCode from "@/utils/StatusCode";

export type NotificationListDataQuery = NotificationListData["query"];

export const getNotifications = async (query?: NotificationListDataQuery) => {
  const { data, response } = await NotificationService.notificationList({ query });
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(response, "Error fetching notifications");
  }
  return data;
};

export const getUnreadNotificationCount = async () => {
  const { data, response } = await NotificationService.notificationUnreadCountRetrieve();
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(response, "Error fetching unread notification count");
  }
  return data;
};

export type NotificationMarkAsReadCreateDataPath = NotificationMarkAsReadCreateData["path"];

export const markNotificationAsRead = async (path: NotificationMarkAsReadCreateDataPath) => {
  const { data, response } = await NotificationService.notificationMarkAsReadCreate({ path });
  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(response, "Error marking notification as read");
  }
  return data;
};

export const markAllNotificationsAsRead = async () => {
  const { data, response } = await NotificationService.notificationMarkAllAsReadCreate();
  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(response, "Error marking all notifications as read");
  }
  return data;
};

export type NotificationDestroyDataPath = NotificationDestroyData["path"];

export const deleteNotification = async (path: NotificationDestroyDataPath) => {
  const { data, response } = await NotificationService.notificationDestroy({ path });
  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(response, "Error deleting notification");
  }
  return data;
};

export const deleteAllReadNotifications = async () => {
  const { data, response } = await NotificationService.notificationDeleteAllReadDestroy();
  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(response, "Error deleting all read notifications");
  }
  return data;
};
