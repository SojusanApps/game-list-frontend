import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as React from "react";

import { BlankEnum, TierEnum } from "@/client";
import { useCurrentUserId } from "@/features/auth";
import { useGetFriendshipsInfiniteQuery } from "@/features/users/hooks/friendshipQueries";
import { collectionKeys } from "@/lib/queryKeys";

import {
  getCollectionsList,
  createCollection,
  getCollectionDetail,
  getCollectionItems,
  updateCollection,
  deleteCollection,
  addCollectionItem,
  removeCollectionItem,
  updateCollectionItem,
  reorderCollectionItem,
  bulkReorderCollectionItems,
  updateCollectionItemTier,
} from "../api/collection";

const fetchCollections = async ({ pageParam = 1, queryKey }: { pageParam?: number; queryKey: readonly unknown[] }) => {
  const [, _kind, userId, filters, useMember] = queryKey as [string, string, number, object, boolean];
  const query = useMember
    ? { page: pageParam, member: String(userId), ...filters }
    : { page: pageParam, user: String(userId), ...filters };
  return await getCollectionsList(query);
};

export const useCollectionsInfiniteQuery = (userId?: number, filters: object = {}, useMember = false) => {
  return useInfiniteQuery({
    queryKey: collectionKeys.infinite(userId ?? -1, filters, useMember),
    queryFn: fetchCollections,
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.next !== null && lastPage.next !== undefined) {
        return lastPageParam + 1;
      }
      return null;
    },
    enabled: !!userId,
  });
};

export const useCreateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCollection,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.all });
    },
  });
};

export const useUpdateCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof updateCollection>[1] }) =>
      updateCollection(id, body),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(data.id) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
};

export const useDeleteCollection = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCollection,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(id) });
      queryClient.invalidateQueries({ queryKey: collectionKeys.lists() });
    },
  });
};

export const useCollectionDetail = (id?: number) => {
  return useQuery({
    queryKey: collectionKeys.detail(id ?? -1),
    queryFn: () => getCollectionDetail(id!),
    enabled: !!id,
  });
};

const fetchCollectionItems = async ({
  pageParam = 1,
  queryKey,
}: {
  pageParam?: number;
  queryKey: readonly unknown[];
}) => {
  const [, _kind, collectionId, filters] = queryKey as [string, string, number, object];
  const query = {
    page: pageParam,
    collection: String(collectionId),
    ...filters,
  };
  return await getCollectionItems(query);
};

export const useCollectionItemsInfiniteQuery = (collectionId?: number, filters: object = {}) => {
  return useInfiniteQuery({
    queryKey: collectionKeys.items(collectionId ?? -1, filters),
    queryFn: fetchCollectionItems,
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.next !== null && lastPage.next !== undefined) {
        return lastPageParam + 1;
      }
      return null;
    },
    enabled: !!collectionId,
  });
};

export const useCollectionItemsQuery = (collectionId?: number, page: number = 1, filters: object = {}) => {
  return useQuery({
    queryKey: [...collectionKeys.items(collectionId ?? -1, filters), page],
    queryFn: () => fetchCollectionItems({ pageParam: page, queryKey: ["", "", collectionId ?? -1, filters] }),
    enabled: !!collectionId,
  });
};

export const useCollectionItemsByTierInfiniteQuery = (collectionId: number, tier: TierEnum | "UNRANKED") => {
  const filters = React.useMemo(() => {
    if (tier === "UNRANKED") {
      return { has_tier: false };
    }
    return { tier: [tier] };
  }, [tier]);

  return useCollectionItemsInfiniteQuery(collectionId, filters);
};

export const useCollectionItemsByTierQuery = (collectionId: number, tier: TierEnum | "UNRANKED", page: number = 1) => {
  const filters = React.useMemo(() => {
    if (tier === "UNRANKED") {
      return { has_tier: false };
    }
    return { tier: [tier] };
  }, [tier]);

  return useCollectionItemsQuery(collectionId, page, filters);
};

export const useAddCollectionItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addCollectionItem,
    onSuccess: data => {
      // Invalidate all item lists for this collection regardless of filters
      queryClient.invalidateQueries({ queryKey: [...collectionKeys.all, "items", data.collection] });
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(data.collection) });
    },
  });
};

export const useRemoveCollectionItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ itemId }: { itemId: number; collectionId: number }) => removeCollectionItem(itemId),
    onSuccess: (_, { collectionId }) => {
      queryClient.invalidateQueries({ queryKey: [...collectionKeys.all, "items", collectionId] });
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) });
    },
  });
};

export const useUpdateCollectionItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: number; body: Parameters<typeof updateCollectionItem>[1] }) =>
      updateCollectionItem(id, body),
    onSuccess: data => {
      queryClient.invalidateQueries({ queryKey: [...collectionKeys.all, "items", data.collection] });
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(data.collection) });
    },
  });
};

export const useReorderCollectionItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, itemId, position }: { collectionId: number; itemId: number; position: number }) =>
      reorderCollectionItem(collectionId, itemId, position),
    onSuccess: (data, variables) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: [...collectionKeys.all, "items", variables.collectionId] });
        queryClient.invalidateQueries({ queryKey: collectionKeys.detail(variables.collectionId) });
      }
    },
  });
};

export const useBulkReorderCollectionItems = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionId, items }: { collectionId: number; items: Array<{ id: number; position: number }> }) =>
      bulkReorderCollectionItems(collectionId, items),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [...collectionKeys.all, "items", variables.collectionId] });
      queryClient.invalidateQueries({ queryKey: collectionKeys.detail(variables.collectionId) });
    },
  });
};

export const useUpdateCollectionItemTier = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionId,
      itemId,
      tier,
      position,
      // oldTier is used in the onSuccess handler
      oldTier,
    }: {
      collectionId: number;
      itemId: number;
      tier: TierEnum | BlankEnum;
      position?: number;
      oldTier?: TierEnum | "UNRANKED" | null;
    }) => updateCollectionItemTier(collectionId, itemId, tier, position),
    onSuccess: (data, variables) => {
      if (data) {
        const { collectionId, tier, oldTier } = variables;

        // Convert tier values to match filter formats
        const newTierFilter = tier === "" ? "UNRANKED" : tier;

        // Invalidate the old tier query if provided
        if (oldTier) {
          const oldFilters = oldTier === "UNRANKED" ? { has_tier: false } : { tier: [oldTier] };
          queryClient.invalidateQueries({ queryKey: collectionKeys.items(collectionId, oldFilters) });
        }

        // Only invalidate new tier if it's different from old tier
        if (!oldTier || oldTier !== newTierFilter) {
          const newFilters = newTierFilter === "UNRANKED" ? { has_tier: false } : { tier: [newTierFilter] };
          queryClient.invalidateQueries({ queryKey: collectionKeys.items(collectionId, newFilters) });
        }

        queryClient.invalidateQueries({ queryKey: collectionKeys.detail(collectionId) });
      }
    },
  });
};

export const useFriendSearch = (searchTerm: string) => {
  const currentUserId = useCurrentUserId();

  // Use a query object that always includes user to trigger initial load
  const query = React.useMemo(
    () => ({
      user: currentUserId ? String(currentUserId) : undefined,
      friend_username: searchTerm || undefined, // Keep as friend_username if that's what the user expected, or try friend__username
      search: searchTerm || undefined, // Also try standard search parameter
    }),
    [currentUserId, searchTerm],
  );

  return useGetFriendshipsInfiniteQuery(query);
};
