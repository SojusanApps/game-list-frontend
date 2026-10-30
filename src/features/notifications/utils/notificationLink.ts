import type { Notification } from "@/client";

export type NotificationLink =
  | { to: "/game/$id/$slug"; params: { id: string; slug: string } }
  | { to: "/profile/$id/$slug"; params: { id: string; slug: string } }
  | { to: "/notifications"; params?: undefined };

function readGameData(data: unknown): { id: string; slug: string } | null {
  if (typeof data !== "object" || data === null) return null;
  const { game_id: id, game_slug: slug } = data as { game_id?: unknown; game_slug?: unknown };
  return typeof id === "number" && typeof slug === "string" ? { id: String(id), slug } : null;
}

/**
 * Where a notification should take the reader: the game for release notifications, otherwise the user
 * it is about, falling back to the notifications page when it has no destination of its own.
 */
export function getNotificationLink(notification: Notification): NotificationLink {
  const game = readGameData(notification.data);
  if (game) {
    return { to: "/game/$id/$slug", params: game };
  }
  const user = [notification.actor, notification.target].find(entity => entity?.type === "user");
  if (user) {
    return { to: "/profile/$id/$slug", params: { id: String(user.id), slug: "slug" in user ? (user.slug ?? "") : "" } };
  }
  return { to: "/notifications" };
}
