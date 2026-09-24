import type { Collection } from "@/client";

/**
 * A Shared Collection, from the viewer's side: one owned by someone else that lists the viewer as a collaborator.
 * The `member` collections scope returns own and shared collections together, so ownership is what tells them apart.
 */
export function isSharedCollection(collection: Pick<Collection, "user">, viewerId: number | null | undefined): boolean {
  return viewerId != null && Number(collection.user.id) !== viewerId;
}
