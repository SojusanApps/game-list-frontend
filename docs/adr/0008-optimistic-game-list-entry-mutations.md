# ADR 0008: Optimistic Game List Entry Mutations

**Status:** Accepted
**Date:** 2026-09-24

## Context

Changing a Game List Entry (its Game List Status, Score, note, dates, playtime) felt laggy. `GameListModal`
awaited the PATCH, and then `onSuccess` invalidated all of `gameListKeys.all`, so the list kept
showing the old entry until the refetch landed — and refetching an infinite query re-requests every
loaded page in sequence. The user paid two round-trips, the second one potentially several requests
long. No mutation in the app did optimistic updates yet.

## Decision

Updating and deleting a Game List Entry is **optimistic, via the cache**:

- `onMutate` cancels in-flight game-list queries, snapshots them, and writes the change into the
  `infinite`, `list` and `byFilters` caches with `setQueryData`. An entry whose new status no longer
  matches a cache's status filter is removed from it; entries are **not** re-sorted client-side.
- The modal closes immediately on Save/Remove. There is no success toast.
- On success, the server's `GameList` response is written back over the optimistic values (only the
  response for the latest pending edit of that entry; older ones are ignored), and the entry's modal
  draft is cleared.
- On error, the snapshots are restored and an error toast naming the game is shown. The modal draft
  is **kept**, so reopening the modal restores what the user typed.
- `gameListKeys.all` is invalidated once the last pending Game List Entry mutation settles, not after
  each one. This refetch is what re-sorts by Score and refreshes `compare` and `randomPtp`, which are
  never patched. User statistics (`userKeys.details()`) are invalidated as before.

Creating an entry is **not** optimistic: it has no id yet and cannot be correctly placed in a
filtered, sorted, paginated list. It keeps invalidation and its "Added" toast.

## Considered Options

- **Write the server response into the cache, no optimism.** Removes the refetch wait and never shows
  a change that didn't happen, but still costs one visible round-trip with the modal open.
- **UI-based optimism (`useMutationState` overlays).** No rollback to get wrong, but every view that
  renders entries would have to merge pending edits itself, including filtered-out removal. Rejected
  in favour of keeping it all in the mutation hooks.
- **Client-side re-sort / cross-page moves.** Rejected as fragile across infinite pages; the
  post-settle refetch handles ordering.

## Consequences

- The modal closes before the save is confirmed, so "success" for draft-clearing purposes means the
  server confirmed, not that the modal closed (see ADR 0006). Draft-clearing must happen in the
  mutation hook, since the modal is no longer awaiting the result.
- A save made while offline pauses (TanStack's default network mode) with the optimistic change
  visible, and is sent on reconnect. This is accepted as-is.
- This is the template for making other mutations optimistic (Collection Favorite, notification
  mark-as-read are the likely next ones). Mutations with server-side effects the client cannot
  predict (moderation, imports, friendships) should stay invalidation-based.
