import { useQuery, useQueryClient, useInfiniteQuery } from "@tanstack/react-query";
import {
  getFriendshipRequests,
  sendFriendRequest,
  acceptFriendRequest,
  rejectFriendRequest,
  getFriendships,
  deleteFriendship,
  FriendshipFriendshipRequestsListDataQuery,
  FriendshipFriendshipRequestsCreateDataBody,
  FriendshipFriendshipRequestsAcceptCreateDataPath,
  FriendshipFriendshipRequestsRejectCreateDataPath,
  FriendshipFriendshipsListDataQuery,
  FriendshipFriendshipsDestroyDataPath,
} from "../api/friendship";
import { friendshipKeys } from "@/lib/queryKeys";
import { useAppMutation } from "@/hooks/useAppMutation";
import { PaginatedFriendshipList } from "@/client";

export const useGetFriendshipRequests = (query?: FriendshipFriendshipRequestsListDataQuery) => {
  return useQuery({
    queryKey: friendshipKeys.requestList(query),
    queryFn: () => getFriendshipRequests(query),
  });
};

export const useSendFriendRequest = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (body: FriendshipFriendshipRequestsCreateDataBody) => sendFriendRequest(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendshipKeys.requests,
      });
    },
  });
};

export const useAcceptFriendRequest = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (path: FriendshipFriendshipRequestsAcceptCreateDataPath) => acceptFriendRequest(path),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendshipKeys.requests,
      });
      queryClient.invalidateQueries({
        queryKey: friendshipKeys.all,
      });
    },
  });
};

export const useRejectFriendRequest = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (path: FriendshipFriendshipRequestsRejectCreateDataPath) => rejectFriendRequest(path),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendshipKeys.requests,
      });
    },
  });
};

export const useGetFriendships = (query?: FriendshipFriendshipsListDataQuery) => {
  return useQuery({
    queryKey: friendshipKeys.list(query),
    queryFn: () => getFriendships(query),
  });
};

export const useGetFriendshipsInfiniteQuery = (query?: FriendshipFriendshipsListDataQuery) => {
  return useInfiniteQuery<PaginatedFriendshipList, Error>({
    queryKey: friendshipKeys.listInfinite(query),
    queryFn: ({ pageParam = 1 }) => getFriendships({ ...query, page: pageParam as number }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return;
    },
    enabled: !!query?.user,
  });
};

export const useDeleteFriendship = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (path: FriendshipFriendshipsDestroyDataPath) => deleteFriendship(path),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: friendshipKeys.all,
      });
      queryClient.invalidateQueries({
        queryKey: friendshipKeys.requests,
      });
    },
  });
};
