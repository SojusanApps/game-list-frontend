import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";

import { useAuth } from "@/features/auth/context/AuthProvider";
import { getCurrentUser } from "@/features/users/api/user";
import { userKeys } from "@/lib/queryKeys";

export const useCurrentUser = () => {
  const { isAuthenticated } = useAuth();

  return useQuery({
    queryKey: userKeys.me(),
    queryFn: getCurrentUser,
    enabled: isAuthenticated,
  });
};

export const useCurrentUserId = () => {
  const { data } = useCurrentUser();
  return data?.id ?? null;
};

export const useIsOwner = (ownerId?: number | string | null) => {
  const currentUserId = useCurrentUserId();

  return useMemo(() => {
    if (currentUserId === null || (!ownerId && ownerId !== 0)) return false;
    return currentUserId === Number(ownerId);
  }, [currentUserId, ownerId]);
};

export const useIsStaff = () => {
  const { data } = useCurrentUser();
  return !!data?.is_staff;
};
