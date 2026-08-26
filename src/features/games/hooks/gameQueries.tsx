import {
  useInfiniteQuery,
  useQuery,
  useQueryClient,
  UseQueryOptions,
  UseInfiniteQueryOptions,
  InfiniteData,
} from "@tanstack/react-query";

import {
  GameList,
  PaginatedGameSimpleListList,
  PaginatedGameListList,
  PaginatedGameFollowList,
  GameListCreateWritable,
} from "@/client";
import { gameKeys, gameListKeys, gameReviewKeys, userKeys, gameFollowKeys } from "@/lib/queryKeys";

import {
  getGenresList,
  getGamesList,
  GameGamesListDataQuery,
  getGamesDetail,
  getGameReviewsDetail,
  GameGameReviewsListDataQuery,
  getGameReviewsList,
  GameGameListsListDataQuery,
  getGameListsList,
  deleteGameList,
  createGameList,
  GameListCreateDataBody,
  GameListPartialUpdateDataBody,
  partialUpdateGameList,
  getGameListByFilters,
  getGameMediaList,
  getCompaniesList,
  getCompanyDetail,
  GameCompaniesListDataQuery,
  getPlatformsList,
  getGameEnginesList,
  getGameModesList,
  getGameStatusesList,
  getGameTypesList,
  getPlayerPerspectivesList,
  getReleaseCalendar,
  GameGameFollowsListDataQuery,
  GameFollowCreateDataBody,
  getGameFollowsList,
  createGameFollow,
  deleteGameFollow,
  steamImportGameList,
  titleImportGameList,
  bulkCreateGameList,
  exportGameList,
  createGameReview,
  updateGameReview,
  deleteGameReview,
  GameReviewCreateDataBody,
  GameReviewPartialUpdateDataBody,
} from "../api/game";

export const useGetPlatformsInfiniteQuery = (name?: string) => {
  return useInfiniteQuery({
    queryKey: gameKeys.platformsInfinite(name),
    queryFn: ({ pageParam = 1 }) => getPlatformsList({ name, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return;
    },
  });
};

export const useGetGameEnginesInfiniteQuery = (name?: string) => {
  return useInfiniteQuery({
    queryKey: gameKeys.enginesInfinite(name),
    queryFn: ({ pageParam = 1 }) => getGameEnginesList({ name, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return;
    },
  });
};

export const useGetGameModesInfiniteQuery = (name?: string) => {
  return useInfiniteQuery({
    queryKey: gameKeys.modesInfinite(name),
    queryFn: ({ pageParam = 1 }) => getGameModesList({ name, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return;
    },
  });
};

export const useGetGameStatusesInfiniteQuery = (status?: string) => {
  return useInfiniteQuery({
    queryKey: gameKeys.statusesInfinite(status),
    queryFn: ({ pageParam = 1 }) => getGameStatusesList({ status, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return;
    },
  });
};

export const useGetGameTypesInfiniteQuery = (type?: string) => {
  return useInfiniteQuery({
    queryKey: gameKeys.typesInfinite(type),
    queryFn: ({ pageParam = 1 }) => getGameTypesList({ type, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return;
    },
  });
};

export const useGetPlayerPerspectivesInfiniteQuery = (name?: string) => {
  return useInfiniteQuery({
    queryKey: gameKeys.perspectivesInfinite(name),
    queryFn: ({ pageParam = 1 }) => getPlayerPerspectivesList({ name, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return;
    },
  });
};
import { useAppMutation } from "@/hooks/useAppMutation";

export const useGetGenresInfiniteQuery = (name?: string) => {
  return useInfiniteQuery({
    queryKey: gameKeys.genresInfinite(name),
    queryFn: ({ pageParam = 1 }) => getGenresList({ name, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return;
    },
  });
};

export const useGetGameMediasInfiniteQuery = (name?: string) => {
  return useInfiniteQuery({
    queryKey: gameKeys.mediasInfinite(name),
    queryFn: ({ pageParam = 1 }) => getGameMediaList({ name, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return;
    },
  });
};

export const useGetGameMediasByName = (name: string, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: [...gameKeys.medias, name],
    queryFn: () => getGameMediaList({ name }),
    enabled: options?.enabled ?? true,
  });
};

export const useGetGamesInfinite = (
  query?: GameGamesListDataQuery,
  options?: Omit<
    UseInfiniteQueryOptions<
      PaginatedGameSimpleListList,
      Error,
      InfiniteData<PaginatedGameSimpleListList, unknown>,
      any,
      any
    >,
    "queryKey" | "queryFn" | "initialPageParam" | "getNextPageParam"
  >,
) => {
  return useInfiniteQuery({
    queryKey: [...gameKeys.lists(), "infinite", query],
    queryFn: ({ pageParam = 1 }) => getGamesList({ ...query, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage?.next) {
        return allPages.length + 1;
      }
      return;
    },
    ...options,
  });
};

export const useGetGamesList = (
  query?: GameGamesListDataQuery,
  options?: Omit<UseQueryOptions<unknown, Error, PaginatedGameSimpleListList>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: gameKeys.list(query),
    queryFn: async () => {
      const data = await getGamesList(query);
      return data;
    },
    ...options,
  });
};

export const useGetGamesDetails = (id?: number) => {
  return useQuery({
    queryKey: gameKeys.detail(id ?? -1),
    queryFn: () => getGamesDetail(id as number),
    enabled: !!id,
  });
};

export const useGetReleaseCalendar = (params: { start_date: string; end_date: string }) => {
  return useQuery({
    queryKey: gameKeys.releaseCalendar(params),
    queryFn: () => getReleaseCalendar(params),
  });
};

export const useGetGameReviewsList = (query?: GameGameReviewsListDataQuery, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: gameReviewKeys.list(query),
    queryFn: () => getGameReviewsList(query),
    ...options,
  });
};

export const useGetGameReviewsDetail = (id: number) => {
  return useQuery({
    queryKey: gameReviewKeys.detail(id),
    queryFn: () => getGameReviewsDetail(id),
  });
};

export const useGetGameListsList = (
  query?: GameGameListsListDataQuery,
  options?: Omit<UseQueryOptions<unknown, Error, PaginatedGameListList>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: gameListKeys.list(query),
    queryFn: () => getGameListsList(query),
    ...options,
  });
};

export const useGetGameListByFilters = (
  query?: GameGameListsListDataQuery,
  options?: Omit<UseQueryOptions<GameList | null, Error, GameList | null>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: gameListKeys.byFilters(query),
    queryFn: () => getGameListByFilters(query),
    ...options,
  });
};

export const useCreateGameList = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (body: GameListCreateDataBody) => createGameList(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gameListKeys.all,
      });
      // Also invalidate user details to update statistics
      queryClient.invalidateQueries({
        queryKey: userKeys.details(),
      });
    },
  });
};

export const usePartialUpdateGameList = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: ({ id, body }: { id: number; body: GameListPartialUpdateDataBody }) => partialUpdateGameList(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gameListKeys.all,
      });
      // Also invalidate user details to update statistics
      queryClient.invalidateQueries({
        queryKey: userKeys.details(),
      });
    },
  });
};

export const useDeleteGameList = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (id: number) => deleteGameList(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gameListKeys.all,
      });
      // Also invalidate user details to update statistics
      queryClient.invalidateQueries({
        queryKey: userKeys.details(),
      });
    },
  });
};

export const useGetCompaniesInfiniteQuery = (name?: string) => {
  return useInfiniteQuery({
    queryKey: gameKeys.companiesInfinite(name),
    queryFn: ({ pageParam = 1 }) => getCompaniesList({ name, page: pageParam }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      if (lastPage.next) {
        return allPages.length + 1;
      }
      return;
    },
  });
};

export const useGetCompaniesList = (query?: GameCompaniesListDataQuery) => {
  return useQuery({
    queryKey: gameKeys.companyList(query),
    queryFn: () => getCompaniesList(query),
  });
};

export const useGetCompanyDetail = (id?: number) => {
  return useQuery({
    queryKey: gameKeys.companyDetail(id ?? -1),
    queryFn: () => getCompanyDetail(id as number),
    enabled: !!id,
  });
};

export const useGetGameFollowsList = (
  query?: GameGameFollowsListDataQuery,
  options?: Omit<UseQueryOptions<unknown, Error, PaginatedGameFollowList>, "queryKey" | "queryFn">,
) => {
  return useQuery({
    queryKey: gameFollowKeys.list(query),
    queryFn: () => getGameFollowsList(query),
    ...options,
  });
};

export const useCreateGameFollow = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (body: GameFollowCreateDataBody) => createGameFollow(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gameFollowKeys.all,
      });
    },
  });
};

export const useDeleteGameFollow = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (id: number) => deleteGameFollow(id),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gameFollowKeys.all,
      });
    },
  });
};

export const useSteamImport = () => {
  return useAppMutation({
    mutationFn: (steamProfileId: string) => steamImportGameList(steamProfileId),
  });
};

export const useTitleImport = () => {
  return useAppMutation({
    mutationFn: (titles: Array<string>) => titleImportGameList(titles),
  });
};

export const useGetExportedGameList = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: gameListKeys.export(),
    queryFn: () => exportGameList(),
    enabled: options?.enabled ?? true,
  });
};

export const useBulkCreateGameList = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (body: Array<GameListCreateWritable>) => bulkCreateGameList(body),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: gameListKeys.all,
      });
      // Also invalidate user details to update statistics
      queryClient.invalidateQueries({
        queryKey: userKeys.details(),
      });
    },
  });
};

export const useCreateGameReview = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (body: GameReviewCreateDataBody) => createGameReview(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameReviewKeys.all });
    },
  });
};

export const useUpdateGameReview = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: ({ id, body }: { id: number; body: GameReviewPartialUpdateDataBody }) => updateGameReview(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameReviewKeys.all });
    },
  });
};

export const useDeleteGameReview = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (id: number) => deleteGameReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: gameReviewKeys.all });
    },
  });
};
