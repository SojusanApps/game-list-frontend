import { type InfiniteData, type MutationOptions, QueryClient } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { type GameList, type GameListCreate, GameListStatusEnum, type PaginatedGameListList } from "@/client";
import {
  createGameListEntryOptions,
  deleteGameListEntryOptions,
  updateGameListEntryOptions,
} from "@/features/games/hooks/gameListEntryMutations";
import { useDraftStore } from "@/lib/draftStore";
import { gameListKeys, userKeys } from "@/lib/queryKeys";

type GameApi = typeof import("@/features/games/api/game");

const { partialUpdateGameList, deleteGameList, createGameList } = vi.hoisted(() => ({
  partialUpdateGameList: vi.fn<GameApi["partialUpdateGameList"]>(),
  deleteGameList: vi.fn<GameApi["deleteGameList"]>(),
  createGameList: vi.fn<GameApi["createGameList"]>(),
}));

vi.mock("@/features/games/api/game", () => ({ partialUpdateGameList, deleteGameList, createGameList }));

const deferred = <T>() => {
  let resolve!: (value: T) => void;
  let reject!: (error: Error) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const entry = (id: number, overrides: Partial<GameList> = {}): GameList => ({
  id,
  status: "Playing",
  status_code: GameListStatusEnum.P,
  score: 5,
  description: "",
  completed_at: null,
  started_at: null,
  playtime: null,
  created_at: "2026-01-01T00:00:00Z",
  last_modified_at: "2026-01-01T00:00:00Z",
  game_id: id * 10,
  game_slug: `game-${id}`,
  title: `Game ${id}`,
  game_cover_image: "",
  user: 1,
  owned_on: [{ id: 3, name: "Steam" }],
  ...overrides,
});

const serverEntry = (id: number, overrides: Partial<GameListCreate> = {}): GameListCreate => ({
  id,
  status: GameListStatusEnum.P,
  score: 5,
  description: "",
  completed_at: null,
  started_at: null,
  playtime: null,
  created_at: "2026-01-01T00:00:00Z",
  last_modified_at: "2026-09-24T12:00:00Z",
  game: id * 10,
  owned_on: [3],
  ...overrides,
});

const page = (results: GameList[], count = results.length): PaginatedGameListList => ({
  count,
  next: null,
  previous: null,
  results,
});

const keys = {
  allInfinite: gameListKeys.infinite(1, null, { ordering: "title" }),
  playingInfinite: gameListKeys.infinite(1, GameListStatusEnum.P, { ordering: "title" }),
  playingTable: gameListKeys.list({ user: "1", status: GameListStatusEnum.P, page: 1 }),
  detail: gameListKeys.byFilters({ game: "10", user: "1" }),
};

const seed = (queryClient: QueryClient) => {
  queryClient.setQueryData<InfiniteData<PaginatedGameListList>>(keys.allInfinite, {
    pages: [page([entry(1), entry(2)], 3), page([entry(3)], 3)],
    pageParams: [1, 2],
  });
  queryClient.setQueryData<InfiniteData<PaginatedGameListList>>(keys.playingInfinite, {
    pages: [page([entry(1), entry(2)])],
    pageParams: [1],
  });
  queryClient.setQueryData(keys.playingTable, page([entry(1), entry(2)]));
  queryClient.setQueryData(keys.detail, entry(1));
};

const infiniteIds = (queryClient: QueryClient, key: readonly unknown[]) =>
  queryClient.getQueryData<InfiniteData<PaginatedGameListList>>(key)!.pages.flatMap(p => p.results.map(e => e.id));

const findInInfinite = (queryClient: QueryClient, key: readonly unknown[], id: number) =>
  queryClient
    .getQueryData<InfiniteData<PaginatedGameListList>>(key)!
    .pages.flatMap(p => p.results)
    .find(e => e.id === id);

const run = <TData, TVariables, TContext>(
  queryClient: QueryClient,
  options: MutationOptions<TData, Error, TVariables, TContext>,
  variables: TVariables,
) => queryClient.getMutationCache().build(queryClient, options).execute(variables);

const flush = () => new Promise(resolve => setTimeout(resolve, 0));

const gameListInvalidations = (spy: { mock: { calls: unknown[][] } }) =>
  spy.mock.calls.filter(([filters]) => (filters as { queryKey?: unknown }).queryKey === gameListKeys.all).length;

describe("Game List Entry mutations", () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient();
    seed(queryClient);
    partialUpdateGameList.mockReset();
    deleteGameList.mockReset();
    createGameList.mockReset();
    useDraftStore.getState().clearAllDrafts();
  });

  describe("update", () => {
    it("patches the entry in every list and the detail cache before the server answers", async () => {
      const request = deferred<GameListCreate>();
      partialUpdateGameList.mockReturnValue(request.promise);

      const mutation = run(queryClient, updateGameListEntryOptions(queryClient), {
        id: 1,
        body: { score: 9, owned_on: [3, 4] },
      });
      await flush();

      expect(findInInfinite(queryClient, keys.allInfinite, 1)?.score).toBe(9);
      expect(findInInfinite(queryClient, keys.playingInfinite, 1)?.score).toBe(9);
      expect(queryClient.getQueryData<PaginatedGameListList>(keys.playingTable)!.results[0].score).toBe(9);
      expect(queryClient.getQueryData<GameList>(keys.detail)!.score).toBe(9);
      expect(queryClient.getQueryData<GameList>(keys.detail)!.owned_on.map(m => m.id)).toEqual([3, 4]);

      request.resolve(serverEntry(1, { score: 9, owned_on: [3, 4] }));
      await mutation;
    });

    it("removes the entry from status-filtered lists it no longer matches, keeping unfiltered ones", async () => {
      partialUpdateGameList.mockReturnValue(new Promise(() => {}));

      void run(queryClient, updateGameListEntryOptions(queryClient), { id: 1, body: { status: GameListStatusEnum.C } });
      await flush();

      expect(infiniteIds(queryClient, keys.playingInfinite)).toEqual([2]);
      expect(queryClient.getQueryData<InfiniteData<PaginatedGameListList>>(keys.playingInfinite)!.pages[0].count).toBe(
        1,
      );
      const table = queryClient.getQueryData<PaginatedGameListList>(keys.playingTable)!;
      expect(table.results.map(e => e.id)).toEqual([2]);
      expect(table.count).toBe(1);

      expect(infiniteIds(queryClient, keys.allInfinite)).toEqual([1, 2, 3]);
      expect(findInInfinite(queryClient, keys.allInfinite, 1)?.status_code).toBe(GameListStatusEnum.C);
      expect(queryClient.getQueryData<GameList>(keys.detail)!.status_code).toBe(GameListStatusEnum.C);
    });

    it("writes the server's response over the optimistic values and clears the draft", async () => {
      partialUpdateGameList.mockResolvedValue(serverEntry(1, { score: 9, last_modified_at: "2026-09-24T13:00:00Z" }));
      useDraftStore.getState().setDraft("game-list:10", { score: 9 });

      await run(queryClient, updateGameListEntryOptions(queryClient), {
        id: 1,
        body: { score: 9 },
        draftKey: "game-list:10",
      });

      expect(queryClient.getQueryData<GameList>(keys.detail)!.last_modified_at).toBe("2026-09-24T13:00:00Z");
      expect(useDraftStore.getState().drafts).not.toHaveProperty("game-list:10");
    });

    it("restores every cache and keeps the draft when the save fails", async () => {
      partialUpdateGameList.mockRejectedValue(new Error("boom"));
      useDraftStore.getState().setDraft("game-list:10", { status: GameListStatusEnum.C });
      const before = {
        allInfinite: queryClient.getQueryData(keys.allInfinite),
        playingInfinite: queryClient.getQueryData(keys.playingInfinite),
        playingTable: queryClient.getQueryData(keys.playingTable),
        detail: queryClient.getQueryData(keys.detail),
      };

      await expect(
        run(queryClient, updateGameListEntryOptions(queryClient), {
          id: 1,
          body: { status: GameListStatusEnum.C },
          draftKey: "game-list:10",
        }),
      ).rejects.toThrow("boom");

      expect(queryClient.getQueryData(keys.allInfinite)).toEqual(before.allInfinite);
      expect(queryClient.getQueryData(keys.playingInfinite)).toEqual(before.playingInfinite);
      expect(queryClient.getQueryData(keys.playingTable)).toEqual(before.playingTable);
      expect(queryClient.getQueryData(keys.detail)).toEqual(before.detail);
      expect(useDraftStore.getState().drafts).toHaveProperty("game-list:10");
    });

    it("refetches the game lists once, after the last of several overlapping edits settles", async () => {
      const invalidate = vi.spyOn(queryClient, "invalidateQueries");
      const first = deferred<GameListCreate>();
      const second = deferred<GameListCreate>();
      partialUpdateGameList.mockReturnValueOnce(first.promise).mockReturnValueOnce(second.promise);

      const options = updateGameListEntryOptions(queryClient);
      const a = run(queryClient, options, { id: 1, body: { score: 8 } });
      const b = run(queryClient, options, { id: 2, body: { score: 7 } });
      await flush();

      first.resolve(serverEntry(1, { score: 8 }));
      await a;
      expect(gameListInvalidations(invalidate)).toBe(0);

      second.resolve(serverEntry(2, { score: 7 }));
      await b;
      expect(gameListInvalidations(invalidate)).toBe(1);
      expect(invalidate).toHaveBeenCalledWith({ queryKey: userKeys.details() });
    });

    it("ignores an older edit's response that arrives after a newer edit of the same entry", async () => {
      const older = deferred<GameListCreate>();
      const newer = deferred<GameListCreate>();
      partialUpdateGameList.mockReturnValueOnce(older.promise).mockReturnValueOnce(newer.promise);

      const options = updateGameListEntryOptions(queryClient);
      const a = run(queryClient, options, { id: 1, body: { score: 8 } });
      await flush();
      const b = run(queryClient, options, { id: 1, body: { score: 2 } });
      await flush();

      newer.resolve(serverEntry(1, { score: 2 }));
      await b;
      older.resolve(serverEntry(1, { score: 8 }));
      await a;

      expect(queryClient.getQueryData<GameList>(keys.detail)!.score).toBe(2);
    });
  });

  describe("delete", () => {
    it("removes the entry from every list and empties the detail cache before the server answers", async () => {
      deleteGameList.mockReturnValue(new Promise(() => {}));

      void run(queryClient, deleteGameListEntryOptions(queryClient), { id: 1 });
      await flush();

      expect(infiniteIds(queryClient, keys.allInfinite)).toEqual([2, 3]);
      expect(queryClient.getQueryData<InfiniteData<PaginatedGameListList>>(keys.allInfinite)!.pages[1].count).toBe(2);
      expect(infiniteIds(queryClient, keys.playingInfinite)).toEqual([2]);
      expect(queryClient.getQueryData<PaginatedGameListList>(keys.playingTable)!.results.map(e => e.id)).toEqual([2]);
      expect(queryClient.getQueryData(keys.detail)).toBeNull();
    });

    it("puts the entry back when the delete fails", async () => {
      deleteGameList.mockRejectedValue(new Error("boom"));
      const before = queryClient.getQueryData(keys.allInfinite);

      await expect(run(queryClient, deleteGameListEntryOptions(queryClient), { id: 1 })).rejects.toThrow("boom");

      expect(queryClient.getQueryData(keys.allInfinite)).toEqual(before);
      expect(queryClient.getQueryData<GameList>(keys.detail)!.id).toBe(1);
    });
  });

  describe("create", () => {
    it("is not optimistic: leaves the caches alone, then refetches and clears the draft", async () => {
      const invalidate = vi.spyOn(queryClient, "invalidateQueries");
      const request = deferred<GameListCreate>();
      createGameList.mockReturnValue(request.promise);
      useDraftStore.getState().setDraft("game-list:40", { status: GameListStatusEnum.PTP });
      const before = queryClient.getQueryData(keys.allInfinite);

      const mutation = run(queryClient, createGameListEntryOptions(queryClient), {
        body: { game: 40, status: GameListStatusEnum.PTP, owned_on: [] },
        draftKey: "game-list:40",
      });
      await flush();
      expect(queryClient.getQueryData(keys.allInfinite)).toBe(before);

      request.resolve(serverEntry(4, { status: GameListStatusEnum.PTP }));
      await mutation;

      expect(gameListInvalidations(invalidate)).toBe(1);
      expect(useDraftStore.getState().drafts).not.toHaveProperty("game-list:40");
    });
  });
});
