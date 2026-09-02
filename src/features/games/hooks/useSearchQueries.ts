import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { getUserLists } from "@/features/users/api/user";
import { searchKeys } from "@/lib/queryKeys";

import { getGamesList, getCompaniesList } from "../api/game";

export type SearchCategory = "games" | "companies" | "users";

const fetchSearchResultsPage = async (category: SearchCategory, filters: object, page: number) => {
  const query = { page, ...filters };

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
    queryFn: ({ pageParam }) => fetchSearchResultsPage(category as SearchCategory, filters, pageParam),
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

export const useSearchQuery = (
  category: SearchCategory | null,
  filters: object,
  page: number,
  options: { enabled?: boolean } = {},
) => {
  return useQuery({
    queryKey: searchKeys.paginated(category, filters, page),
    queryFn: () => fetchSearchResultsPage(category as SearchCategory, filters, page),
    // Keep the previous page visible while the next one loads, but only within the
    // same category — a category switch renders different columns, so stale rows
    // from the old category must not leak through.
    placeholderData: (previous, previousQuery) => (previousQuery?.queryKey[2] === category ? previous : undefined),
    enabled: (options.enabled ?? true) && !!category,
  });
};
