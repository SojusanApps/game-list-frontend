import { useQuery } from "@tanstack/react-query";

import { versionKeys } from "@/lib/queryKeys";

import { getApiVersion } from "../api/admin";

export const useGetApiVersion = () => {
  return useQuery({
    queryKey: versionKeys.apiVersion,
    queryFn: getApiVersion,
  });
};
