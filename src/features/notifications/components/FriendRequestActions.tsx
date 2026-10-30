import { Group } from "@mantine/core";
import { useTranslation } from "react-i18next";

import { Button } from "@/components/ui/Button";
import { useCurrentUserId } from "@/features/auth";
import {
  useAcceptFriendRequest,
  useGetFriendshipRequests,
  useRejectFriendRequest,
} from "@/features/users/hooks/friendshipQueries";

interface FriendRequestActionsProps {
  /** The user who may have sent the signed-in user a friend request. */
  senderId: number;
}

/**
 * Accept/Decline for a pending friend request from `senderId`, so it can be answered straight from a
 * notification. Renders nothing when no pending request from that user exists (any more).
 * Friend-request notifications carry no request id, so the request is matched by its sender.
 */
export function FriendRequestActions({ senderId }: Readonly<FriendRequestActionsProps>) {
  const { t } = useTranslation("notifications");
  const currentUserId = useCurrentUserId();
  // One shared query for every notification: all requests waiting for the signed-in user.
  const { data } = useGetFriendshipRequests(currentUserId ? { receiver: String(currentUserId) } : undefined);
  const { mutate: accept, isPending: isAccepting } = useAcceptFriendRequest();
  const { mutate: reject, isPending: isRejecting } = useRejectFriendRequest();

  const pending = currentUserId
    ? data?.results?.find(request => request.sender.id === senderId && !request.rejected_at)
    : undefined;
  if (!pending) {
    return null;
  }

  return (
    <Group gap={8}>
      <Button size="sm" isLoading={isAccepting} disabled={isRejecting} onClick={() => accept({ id: pending.id })}>
        {t("friendRequest.accept")}
      </Button>
      <Button
        size="sm"
        variant="outline"
        isLoading={isRejecting}
        disabled={isAccepting}
        onClick={() => reject({ id: pending.id })}
      >
        {t("friendRequest.decline")}
      </Button>
    </Group>
  );
}
