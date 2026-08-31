# ADR 0006: In-Memory Drafts for Modal Forms

**Status:** Accepted
**Date:** 2026-08-31

## Context

Every data-entry modal in the app (game review, game list entry, translation suggestion, collection create/edit, add-to-collection, ranking/tier description, report, warn & remove, ban) discarded its form state the moment it closed. The always-mounted modals re-seeded from props on every open via a `useEffect`; the conditionally-mounted ones (`{open && <Modal/>}`) unmounted outright. An accidental overlay click or Escape press — or a deliberate Cancel followed by "wait, I wasn't done" — lost everything the user had typed.

We wanted a close (of any kind) to preserve the draft and only a **successful** mutation to clear it.

A precedent already existed: `src/features/ranking/store/rankingStore.ts` keeps pairwise-ranking sessions in a `zustand` store with the `persist` middleware (localStorage), behind the `useRankingStorage` adapter hook.

## Decision

Drafts are held in a **non-persisted** `zustand` store (`src/lib/draftStore.ts`), keyed by modal type + entity id(s), and consumed through one hook (`src/hooks/useModalDraft.ts`) that wraps `@mantine/form`. The hook seeds from the stored draft if present (else the baseline), mirrors diverging values back into the store while the modal is open, and exposes `clearDraft()` (called in each mutation's `onSuccess`) and `discardDraft()` (the user's explicit "Discard", surfaced by the shared `DraftNotice` bar).

Two deliberate choices within that:

1. **In-memory, not `localStorage`.** Unlike `rankingStore`, drafts do **not** survive a reload. They cover the accidental-close case and nothing more.
2. **Modal mounting was left as-is.** The conditionally-mounted modals still unmount on close; the store — not a kept-mounted component — is what carries the draft across.

## Consequences

- A future reader comparing this to its `rankingStore` neighbour will see the missing `persist` and should read it as intentional: a half-finished review is not worth resurrecting days later, and persisting it would add cache-invalidation questions (stale drafts vs. changed server data, per-user cleanup, TTLs) we chose not to take on. Logout is covered by the Keycloak full-page redirect, with a `useAuthStore` subscription in `draftStore` as the safety net.
- `useModalDraft` is now the sanctioned way to add a modal form. New modals should use it rather than a bare `useForm` + reset-on-open effect.
- The draft store is global and unbounded within a session. Keys must stay unique per entity, and every success path must call `clearDraft()` or a stale draft will shadow fresh server data on the next open.
- Draft values are JSON-compared against the baseline to decide divergence, so modal form values must stay JSON-serializable (already true — the one non-primitive, `CreateCollectionModal`'s collaborator records, is plain data).
