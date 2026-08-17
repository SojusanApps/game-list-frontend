import { useInfiniteQuery, useQuery } from "@tanstack/react-query";

import { GameListStatusEnum } from "@/client";
import { gameListKeys } from "@/lib/queryKeys";

import { getGameListCompare, getGameListsList, getRandomPtpGame } from "../api/game";

export type GameListGameFilters = {
  developer?: string;
  publisher?: string;
  platforms?: string[];
  genres?: string[];
  game_engines?: string[];
  game_modes?: string[];
  game_status?: string[];
  game_type?: string[];
  player_perspectives?: string[];
  release_date_after?: string;
  release_date_before?: string;
};

const fetchGameListItems = async ({
  pageParam = 1,
  queryKey,
}: {
  pageParam?: number;
  queryKey: readonly unknown[];
}) => {
  const [, _kind, userId, status, filters] = queryKey as [
    string,
    string,
    number,
    GameListStatusEnum | null,
    GameListGameFilters | undefined,
  ];
  const query = {
    page: pageParam,
    user: String(userId),
    status: status ?? undefined,
    ...filters,
  };
  return await getGameListsList(query);
};

export const useGameListInfiniteQuery = (
  userId?: number,
  status?: GameListStatusEnum | null,
  filters?: GameListGameFilters,
) => {
  return useInfiniteQuery({
    queryKey: gameListKeys.infinite(userId ?? -1, status ?? null, filters),
    queryFn: fetchGameListItems,
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

export const useRandomPtpGame = (userId?: number, enabled?: boolean) => {
  return useQuery({
    queryKey: gameListKeys.randomPtp(userId ?? -1),
    queryFn: () => getRandomPtpGame(),
    enabled: !!userId && enabled !== false,
    retry: false, // Do not retry on 404
  });
};

export const useGameListCompareQuery = (firstUserId?: number, secondUserId?: number) => {
  return useQuery({
    queryKey: gameListKeys.compare(firstUserId ?? -1, secondUserId ?? -1),
    queryFn: () => getGameListCompare(firstUserId as number, secondUserId as number),
    enabled: !!firstUserId && !!secondUserId,
  });
};
