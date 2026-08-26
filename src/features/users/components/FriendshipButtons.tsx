import { Group } from "@mantine/core";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { Friendship, FriendshipRequest } from "@/client";
import { Button } from "@/components/ui/Button";
import { useRequireAuth } from "@/features/auth";
import { useConfirm } from "@/hooks/useConfirm";

import {
  useSendFriendRequest,
  useGetFriendshipRequests,
  useGetFriendships,
  useAcceptFriendRequest,
  useRejectFriendRequest,
  useDeleteFriendship,
} from "../hooks/friendshipQueries";

interface FriendshipButtonsProps {
  currentUserId: number | null;
  userId: number;
}

export default function FriendshipButtons({ currentUserId, userId }: Readonly<FriendshipButtonsProps>) {
  const { t } = useTranslation("users");
  const requireAuth = useRequireAuth();
  const { confirm, confirmModal } = useConfirm();
  const { mutate: sendRequest } = useSendFriendRequest();
  const { mutate: acceptRequest } = useAcceptFriendRequest();
  const { mutate: rejectRequest } = useRejectFriendRequest();
  const { mutate: deleteFriendship } = useDeleteFriendship();

  const { data: friendshipsData } = useGetFriendships(currentUserId ? { user: String(currentUserId) } : undefined, {
    enabled: !!currentUserId,
  });
  const { data: sentRequestsData } = useGetFriendshipRequests({ receiver: String(userId) });
  // Fetch requests sent BY this user. We will check if any are sent TO us.
  const { data: incomingRequestsData } = useGetFriendshipRequests({ sender: String(userId) });

  const isOwnProfile = Number(currentUserId) === Number(userId);

  // Find existing friendship object if any
  const friendship = friendshipsData?.results?.find((f: Friendship) => {
    const isCurrentUserInvolved = f.user.id === currentUserId || f.friend.id === currentUserId;
    const isTargetUserInvolved = f.user.id === userId || f.friend.id === userId;
    return isCurrentUserInvolved && isTargetUserInvolved;
  });

  const isFriend = !!friendship;

  // Check if we sent a request to them
  const outgoingRequest = sentRequestsData?.results?.find((request: FriendshipRequest) => {
    const requestSenderId = request.sender.id;
    return Number(requestSenderId) === Number(currentUserId);
  });

  // Check if they sent a request to us
  const incomingRequest = incomingRequestsData?.results?.find((request: FriendshipRequest) => {
    const requestReceiverId = request.receiver.id;
    return Number(requestReceiverId) === Number(currentUserId);
  });

  const isIncomingRejected = !!incomingRequest?.rejected_at;
  const isRequestSent = !!outgoingRequest;
  const isOutgoingRejected = !!outgoingRequest?.rejected_at;

  const handleAddFriend = () => {
    if (currentUserId) {
      sendRequest({ sender: currentUserId, receiver: userId });
    }
  };

  const handleAccept = () => {
    if (incomingRequest) {
      acceptRequest({ id: incomingRequest.id });
    }
  };

  const handleReject = () => {
    if (incomingRequest) {
      rejectRequest({ id: incomingRequest.id });
    }
  };

  const handleUnfriend = async () => {
    if (
      friendship &&
      (await confirm({
        title: t("friendship.unfriend"),
        message: t("friendship.unfriendConfirm"),
        isDestructive: true,
      }))
    ) {
      deleteFriendship({ id: friendship.id });
    }
  };

  if (isOwnProfile) {
    return null;
  }

  if (isFriend) {
    return (
      <>
        <Button type="button" onClick={handleUnfriend} variant="destructive" fullWidth>
          {t("friendship.unfriend")}
        </Button>
        {confirmModal}
      </>
    );
  }

  if (incomingRequest) {
    return (
      <Group gap={8} w="100%" wrap="nowrap">
        <Button type="button" onClick={handleAccept} variant="success" style={{ flex: 1 }}>
          {t("friendship.accept")}
        </Button>
        <Button
          type="button"
          onClick={handleReject}
          disabled={isIncomingRejected}
          variant="destructive"
          style={{ flex: 1 }}
        >
          {isIncomingRejected ? t("friendship.rejected") : t("friendship.reject")}
        </Button>
      </Group>
    );
  }

  if (isRequestSent) {
    return (
      <Button type="button" disabled variant="secondary" fullWidth style={{ cursor: "default" }}>
        {isOutgoingRejected ? t("friendship.requestRejected") : t("friendship.requestSent")}
      </Button>
    );
  }

  return (
    <Button type="button" onClick={() => requireAuth(handleAddFriend)} fullWidth>
      {t("friendship.addFriend")}
    </Button>
  );
}
