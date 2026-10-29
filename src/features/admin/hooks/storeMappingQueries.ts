import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppMutation } from "@/hooks/useAppMutation";
import { storeMappingKeys } from "@/lib/queryKeys";

import {
  acceptStoreMapping,
  createStoreMapping,
  getStoreMappings,
  rejectStoreMapping,
  StoreMappingCreateBody,
  StoreMappingListQuery,
  StoreMappingModerationPath,
  StoreMappingRejectBody,
} from "../api/storeMappings";

export const useGetStoreMappings = (query?: StoreMappingListQuery) => {
  return useQuery({
    queryKey: storeMappingKeys.list(query),
    queryFn: () => getStoreMappings(query),
  });
};

export const useCreateStoreMapping = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (body: StoreMappingCreateBody) => createStoreMapping(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeMappingKeys.all });
    },
  });
};

export const useAcceptStoreMapping = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (path: StoreMappingModerationPath) => acceptStoreMapping(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeMappingKeys.all });
    },
  });
};

export const useRejectStoreMapping = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (variables: StoreMappingModerationPath & StoreMappingRejectBody) =>
      rejectStoreMapping({ id: variables.id }, { rejection_reason: variables.rejection_reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: storeMappingKeys.all });
    },
  });
};
