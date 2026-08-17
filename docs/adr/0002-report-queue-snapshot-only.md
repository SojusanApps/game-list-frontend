# ADR 0002: Report Admin Queue Shows Only the Report's Own Snapshot

**Status:** Accepted
**Date:** 2026-07-09

## Context

The `Report` API response carries a bare target id per type (`target_review`, `target_collection`, etc.) plus a `reported_value` text snapshot taken at submission time — it never nests the actual `GameReview`/`Collection`/`TranslationSuggestion`/etc. object. Building a moderator queue that deep-links to the _live_ source content would require a bespoke resolver per target type (5 of the 7 types), each needing extra lookups the backend handoff doc doesn't describe an endpoint for (e.g., there's no "fetch a single review by id" outside a game's review list).

## Decision

The admin reports queue (`/admin/reports`) renders only what's already on the `Report` object: `reported_value`, `reason`, reporter/reported-user chips, and target type — no deep link to the original content's live location.

## Consequences

- Moderators judge each report from the snapshot text alone, not the content's current (possibly since-edited-by-nobody, since these fields are otherwise immutable once flagged) state.
- If a future need arises for "jump to this review on its game page," that's new scope requiring either new backend fields (e.g., nesting the parent game id on `Report`) or per-type resolver logic — not a frontend-only addition.
- Avatar and username reports have no text `reported_value` to show (blank for avatar); the queue must handle an empty snapshot gracefully rather than assuming every report has reportable text.
