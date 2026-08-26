import { useQuery, useQueryClient } from "@tanstack/react-query";

import { useAppMutation } from "@/hooks/useAppMutation";
import { userKeys } from "@/lib/queryKeys";

import { banUser, getUserDetails } from "../api/user";

export const useGetUserDetails = (id?: number) => {
  return useQuery({
    queryKey: userKeys.detail(id ?? -1),
    queryFn: () => getUserDetails(id as number),
    enabled: !!id,
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (variables: { id: number; reason: string }) => banUser(variables.id, { reason: variables.reason }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: userKeys.detail(variables.id) });
    },
  });
};
