# ADR 0010: Confirm Every Destructive Action

**Status:** Accepted
**Date:** 2026-10-29

## Context

Removing a Game List Entry or a Review was instant and irreversible, while "Mark all as read" asked for confirmation. The audit (UX-001) proposed an undo toast for list entries and confirms for the rest. Game List Entry removal is optimistic (ADR 0008), which would have made undo possible.

## Decision

Every action that deletes data asks for confirmation through `useConfirm` (destructive styling, outline Cancel). This covers Game List Entry removal, Review deletion, Collection deletion, deleting notifications and "Mark all as read". There are no undo toasts.

## Consequences

- One predictable rule for new features; no undo state to maintain.
- Extra click for frequent actions such as removing an entry from the grid.
- "Mark all as read" keeps its confirm even though it is reversible — a deliberate choice for consistency.
