# ADR 0007: Offset Pagination with Jump-to-Page for Result Tables

**Status:** Accepted
**Date:** 2026-09-02

## Context

The search page ([`SearchEnginePage`](../../src/features/games/pages/SearchEnginePage.tsx)) has always
rendered results as an infinite-scroll grid (`useSearchInfiniteQuery` → `VirtualGridList`). We are
adding a second, user-selectable view: a dense paginated table, with the choice persisted per user in
a `zustand` store (`src/lib/listViewStore.ts`). The same infinite/table toggle was then rolled out to
every other user-facing result list that has server pagination (game list, collections list, a
collection's items, the release-calendar list + day modal, friends).

A requirement for the table view is that the user can jump directly to an arbitrary page ("there will
be a lot of pages"), not just step next/previous. The list endpoints backing search
(`/api/game/games/`, `/api/game/companies/`, `/api/user/users/`) all use DRF `PageNumberPagination`
with a fixed page size of 25, expose `count`, and take only a `page` query parameter — there is no
cursor and no `page_size` override.

## Decision

The table view uses **page-number (offset) pagination**. Total page count is derived on the client as
`Math.ceil(count / 25)` against a hardcoded `SEARCH_PAGE_SIZE = 25` constant (mirrors the backend
`DEFAULT_PAGINATION` `PAGE_SIZE` in `game_list/settings/base.py`). The current page lives in the URL
as a `page` search param on the `/search` route, alongside `q`, `category`, and the filters. It is
present only while the table view is active; switching back to infinite scroll drops it and resets to
page 1.

Cursor pagination was rejected: it cannot express "jump to page N", which is the point of this view.

## Consequences

- **Row drift is accepted.** `games` results are orderable (`ordering`) and the default ordering is
  not stable under writes; if the underlying set shifts between two page requests, a row can be
  skipped or shown twice across page boundaries. For a browse/search surface this is tolerable; it
  would not be for anything transactional.
- The `SEARCH_PAGE_SIZE` constant is coupled to a backend setting with no runtime check. If the
  backend changes its page size, jump-to-page math silently goes wrong until the constant is updated.
  A comment on the constant points at the backend source.
- `page` is now part of the shareable search URL, so paged result links are bookmarkable and the
  browser back button steps through pages.
- The presentational `PaginatedTable` component (`src/components/ui/PaginatedTable.tsx`) is built
  around this model (controlled `page` / `count` / `pageSize` props). Adopting it elsewhere
  (Notifications now renders through it; Admin Reports / Translation Suggestions / Game Reviews share
  its `PaginationControls` footer and `derivePageCount` helper) means accepting the same
  offset-pagination trade-offs.
- Endpoints with **no** server pagination (a company's games, a game's related titles) return the
  whole list embedded in the parent response. Their table view uses `ClientPaginatedTable`, which
  slices the in-memory array — same `LIST_PAGE_SIZE`, same look, no extra requests, and no row drift.
