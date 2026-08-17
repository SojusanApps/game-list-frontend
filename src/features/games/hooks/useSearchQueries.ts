import { useInfiniteQuery } from "@tanstack/react-query";
import { getGamesList, getCompaniesList } from "../api/game";
import { getUserLists } from "@/features/users/api/user";
import { searchKeys } from "@/lib/queryKeys";

export type SearchCategory = "games" | "companies" | "users";

const fetchSearchResults = async ({
  pageParam = 1,
  queryKey,
}: {
  pageParam?: number;
  queryKey: readonly unknown[];
}) => {
  const [, category, filters] = queryKey as [string, SearchCategory, object];
  const query = { page: pageParam, ...filters };

  switch (category) {
    case "games": {
      return await getGamesList(query);
    }
    case "companies": {
      return await getCompaniesList(query);
    }
    case "users": {
      return await getUserLists(query);
    }
    default: {
      throw new Error("Invalid search category");
    }
  }
};

export const useSearchInfiniteQuery = (
  category: SearchCategory | null,
  filters: object,
  options: { enabled?: boolean } = {},
) => {
  return useInfiniteQuery({
    queryKey: searchKeys.results(category, filters),
    queryFn: fetchSearchResults,
    initialPageParam: 1,
    getNextPageParam: (lastPage, _allPages, lastPageParam) => {
      if (lastPage.next !== null && lastPage.next !== undefined) {
        return (lastPageParam as number) + 1;
      }
      return null;
    },
    enabled: (options.enabled ?? true) && !!category,
  });
};
