import { getUserDetails } from "../api/user";
import { useQuery } from "@tanstack/react-query";
import { userKeys } from "@/lib/queryKeys";

export const useGetUserDetails = (id?: number) => {
  return useQuery({
    queryKey: userKeys.detail(id ?? -1),
    queryFn: () => getUserDetails(id as number),
    enabled: !!id,
  });
};
