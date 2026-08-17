import {
  FriendshipService,
  FriendshipFriendshipRequestsListData,
  FriendshipFriendshipRequestsCreateData,
  FriendshipFriendshipRequestsAcceptCreateData,
  FriendshipFriendshipRequestsRejectCreateData,
  FriendshipFriendshipsListData,
  FriendshipFriendshipsDestroyData,
} from "@/client";
import { handleApiError } from "@/utils/apiUtils";
import StatusCode from "@/utils/StatusCode";

// --- Friendship Requests ---

export type FriendshipFriendshipRequestsListDataQuery = FriendshipFriendshipRequestsListData["query"];

export const getFriendshipRequests = async (query?: FriendshipFriendshipRequestsListDataQuery) => {
  const { data, response } = await FriendshipService.friendshipFriendshipRequestsList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(response, "Error fetching friendship requests");
  }
  return data;
};

export type FriendshipFriendshipRequestsCreateDataBody = FriendshipFriendshipRequestsCreateData["body"];

export const sendFriendRequest = async (body: FriendshipFriendshipRequestsCreateDataBody) => {
  const { data, response } = await FriendshipService.friendshipFriendshipRequestsCreate({ body });
  if (response?.status !== StatusCode.CREATED || !data) {
    return await handleApiError(response, "Error sending friend request");
  }
  return data;
};

export type FriendshipFriendshipRequestsAcceptCreateDataPath = FriendshipFriendshipRequestsAcceptCreateData["path"];

export const acceptFriendRequest = async (path: FriendshipFriendshipRequestsAcceptCreateDataPath) => {
  const { data, response } = await FriendshipService.friendshipFriendshipRequestsAcceptCreate({ path });
  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(response, "Error accepting friend request");
  }
  return data;
};

export type FriendshipFriendshipRequestsRejectCreateDataPath = FriendshipFriendshipRequestsRejectCreateData["path"];

export const rejectFriendRequest = async (path: FriendshipFriendshipRequestsRejectCreateDataPath) => {
  const { data, response } = await FriendshipService.friendshipFriendshipRequestsRejectCreate({ path });
  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(response, "Error rejecting friend request");
  }
  return data;
};

// --- Friendships ---

export type FriendshipFriendshipsListDataQuery = FriendshipFriendshipsListData["query"];

export const getFriendships = async (query?: FriendshipFriendshipsListDataQuery) => {
  const { data, response } = await FriendshipService.friendshipFriendshipsList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(response, "Error fetching friendships");
  }
  return data;
};

export type FriendshipFriendshipsDestroyDataPath = FriendshipFriendshipsDestroyData["path"];

export const deleteFriendship = async (path: FriendshipFriendshipsDestroyDataPath) => {
  const { data, response } = await FriendshipService.friendshipFriendshipsDestroy({ path });
  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(response, "Error deleting friendship");
  }
  return data;
};
