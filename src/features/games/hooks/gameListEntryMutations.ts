import type { InfiniteData, MutationOptions, QueryClient, QueryKey } from "@tanstack/react-query";

import type { GameList, GameListCreate, GameListStatusEnum, PaginatedGameListList } from "@/client";
import { useDraftStore } from "@/lib/draftStore";
import { gameListKeys, userKeys } from "@/lib/queryKeys";

import {
  createGameList,
  deleteGameList,
  partialUpdateGameList,
  type GameListCreateDataBody,
  type GameListPartialUpdateDataBody,
} from "../api/game";

/**
 * Optimistic Game List Entry mutations — see docs/adr/0008-optimistic-game-list-entry-mutations.md.
 *
 * Update and delete patch the `infinite`, `list` and `byFilters` caches before the request is sent,
 * roll them back on error, and write the server's response over the optimistic values on success.
 * Create is not optimistic. All three share one mutation key so that `gameListKeys.all` is
 * invalidated only once, after the last in-flight entry mutation settles.
 *
 * These are plain `MutationOptions` factories (no React) so they can be exercised against a real
 * `QueryClient`; the hooks in `gameQueries.tsx` add the toasts on top.
 */

/** Fields common to the PATCH body and the server's response that can be merged into a cached entry. */
type EntryFields = Partial<
  Pick<
    GameListCreate,
    "status" | "score" | "description" | "completed_at" | "started_at" | "playtime" | "owned_on" | "last_modified_at"
  >
>;

type EntryMutationMeta = {
  /** Game title for the error toast. */
  title?: string;
  /** Modal draft to clear once the server confirms (ADR 0006). */
  draftKey?: string;
};

export type UpdateGameListEntryVariables = EntryMutationMeta & { id: number; body: GameListPartialUpdateDataBody };
export type DeleteGameListEntryVariables = EntryMutationMeta & { id: number };
export type CreateGameListEntryVariables = EntryMutationMeta & { body: GameListCreateDataBody };

type Snapshot = Array<[QueryKey, unknown]>;
export type OptimisticContext = { snapshot: Snapshot; seq: number };

type CacheKind = "infinite" | "list" | "by-filters";

const PATCHED_KINDS: ReadonlySet<unknown> = new Set<CacheKind>(["infinite", "list", "by-filters"]);

/** The status filter a cached list is scoped to, or null when it holds every status. */
const statusFilterOf = (queryKey: QueryKey): string | null => {
  const kind = queryKey[1] as CacheKind;
  if (kind === "infinite") {
    return (queryKey[3] as string | null) ?? null;
  }
  const query = queryKey[2] as { status?: string } | undefined;
  return query?.status ?? null;
};

const mergeIntoEntry = (entry: GameList, fields: EntryFields): GameList => {
  const next: GameList = { ...entry };
  // `undefined` means "not sent", so it leaves the cached value alone; `null` clears it.
  if (fields.status !== undefined) next.status_code = fields.status;
  if (fields.score !== undefined) next.score = fields.score;
  if (fields.description !== undefined) (next as { description: string }).description = fields.description;
  if (fields.completed_at !== undefined) next.completed_at = fields.completed_at;
  if (fields.started_at !== undefined) next.started_at = fields.started_at;
  if (fields.playtime !== undefined) next.playtime = fields.playtime;
  if (fields.last_modified_at !== undefined) {
    (next as { last_modified_at: string }).last_modified_at = fields.last_modified_at;
  }
  if (fields.owned_on !== undefined) {
    // The body and response carry media ids only. Keep the known {id, name} records; a newly added
    // medium gets an empty name until the follow-up refetch (only its id is read from these caches).
    const known = new Map(entry.owned_on.map(media => [media.id, media]));
    next.owned_on = fields.owned_on.map(id => known.get(id) ?? { id, name: "" });
  }
  return next;
};

/**
 * Apply `transform` to the entry with `id` in every patched cache. Returning null removes the entry
 * (and decrements the paginated `count`).
 */
const updateEntryInCaches = (
  queryClient: QueryClient,
  id: number,
  transform: (entry: GameList, queryKey: QueryKey) => GameList | null,
) => {
  for (const [queryKey, data] of queryClient.getQueriesData({ queryKey: gameListKeys.all })) {
    const kind = queryKey[1];
    if (!PATCHED_KINDS.has(kind) || data == null) {
      continue;
    }

    if (kind === "by-filters") {
      const entry = data as GameList;
      if (entry.id === id) {
        queryClient.setQueryData(queryKey, transform(entry, queryKey));
      }
      continue;
    }

    const patchResults = (results: GameList[]) =>
      results.flatMap(entry => {
        if (entry.id !== id) return [entry];
        const next = transform(entry, queryKey);
        return next ? [next] : [];
      });

    const pages =
      kind === "infinite" ? (data as InfiniteData<PaginatedGameListList>).pages : [data as PaginatedGameListList];
    const patchedResults = pages.map(page => patchResults(page.results));
    const removed = pages.reduce((sum, page, index) => sum + page.results.length - patchedResults[index].length, 0);
    // Every page carries the same total `count`.
    const patchedPages = pages.map((page, index): PaginatedGameListList => ({
      count: page.count - removed,
      next: page.next,
      previous: page.previous,
      results: patchedResults[index],
    }));

    queryClient.setQueryData(
      queryKey,
      kind === "infinite" ? { ...(data as InfiniteData<PaginatedGameListList>), pages: patchedPages } : patchedPages[0],
    );
  }
};

const snapshotCaches = (queryClient: QueryClient): Snapshot =>
  queryClient.getQueriesData({ queryKey: gameListKeys.all }).filter(([queryKey]) => PATCHED_KINDS.has(queryKey[1]));

const pendingEntryMutations = (queryClient: QueryClient) =>
  queryClient.isMutating({ mutationKey: gameListKeys.entryMutation() });

// The most recent edit per entry id. With overlapping edits of the same entry only the newest one's
// response may be written into the cache; an older response arriving late would show stale values.
let editSeq = 0;
const latestEditById = new Map<number, number>();

const beginEdit = (id: number) => {
  editSeq += 1;
  latestEditById.set(id, editSeq);
  return editSeq;
};

const isLatestEdit = (id: number, seq: number | undefined) => latestEditById.get(id) === seq;

const endEdit = (id: number, seq: number | undefined) => {
  if (isLatestEdit(id, seq)) {
    latestEditById.delete(id);
  }
};

const rollback = (queryClient: QueryClient, context: OptimisticContext | undefined) => {
  // With other entry mutations still in flight the snapshot would also wipe their optimistic changes;
  // leave the caches to the refetch that runs once the last of them settles.
  if (!context || pendingEntryMutations(queryClient) > 1) {
    return;
  }
  for (const [queryKey, data] of context.snapshot) {
    queryClient.setQueryData(queryKey, data);
  }
};

const clearDraft = (draftKey: string | undefined) => {
  if (draftKey) {
    useDraftStore.getState().clearDraft(draftKey);
  }
};

/** Refetch once the last in-flight entry mutation settles (this one still counts as pending here). */
const settle = (queryClient: QueryClient) => {
  if (pendingEntryMutations(queryClient) === 1) {
    queryClient.invalidateQueries({ queryKey: gameListKeys.all });
  }
  // User statistics (per-status counts) are never patched, only refetched.
  queryClient.invalidateQueries({ queryKey: userKeys.details() });
};

export const updateGameListEntryOptions = (
  queryClient: QueryClient,
): MutationOptions<GameListCreate, Error, UpdateGameListEntryVariables, OptimisticContext> => ({
  mutationKey: gameListKeys.entryMutation(),
  mutationFn: ({ id, body }) => partialUpdateGameList(id, body),
  onMutate: async ({ id, body }) => {
    await queryClient.cancelQueries({ queryKey: gameListKeys.all });
    const snapshot = snapshotCaches(queryClient);
    const seq = beginEdit(id);
    const newStatus = body?.status as GameListStatusEnum | undefined;
    updateEntryInCaches(queryClient, id, (entry, queryKey) => {
      const statusFilter = statusFilterOf(queryKey);
      // An entry whose new status no longer matches a status-filtered list leaves it right away.
      if (newStatus && statusFilter && statusFilter !== newStatus) {
        return null;
      }
      return mergeIntoEntry(entry, body ?? {});
    });
    return { snapshot, seq };
  },
  onError: (_error, _variables, context) => rollback(queryClient, context),
  onSuccess: (data, { id, draftKey }, context) => {
    if (isLatestEdit(id, context?.seq)) {
      updateEntryInCaches(queryClient, id, entry => mergeIntoEntry(entry, data));
    }
    clearDraft(draftKey);
  },
  onSettled: (_data, _error, { id }, context) => {
    endEdit(id, context?.seq);
    settle(queryClient);
  },
});

export const deleteGameListEntryOptions = (
  queryClient: QueryClient,
): MutationOptions<void, Error, DeleteGameListEntryVariables, OptimisticContext> => ({
  mutationKey: gameListKeys.entryMutation(),
  mutationFn: ({ id }) => deleteGameList(id),
  onMutate: async ({ id }) => {
    await queryClient.cancelQueries({ queryKey: gameListKeys.all });
    const snapshot = snapshotCaches(queryClient);
    const seq = beginEdit(id);
    updateEntryInCaches(queryClient, id, () => null);
    return { snapshot, seq };
  },
  onError: (_error, _variables, context) => rollback(queryClient, context),
  onSuccess: (_data, { draftKey }) => clearDraft(draftKey),
  onSettled: (_data, _error, { id }, context) => {
    endEdit(id, context?.seq);
    settle(queryClient);
  },
});

/** Not optimistic: a new entry has no id yet and can't be placed in a filtered, sorted, paginated list. */
export const createGameListEntryOptions = (
  queryClient: QueryClient,
): MutationOptions<GameListCreate, Error, CreateGameListEntryVariables> => ({
  mutationKey: gameListKeys.entryMutation(),
  mutationFn: ({ body }) => createGameList(body),
  onSuccess: (_data, { draftKey }) => clearDraft(draftKey),
  onSettled: () => settle(queryClient),
});
