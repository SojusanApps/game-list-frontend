# Defer Keycloak redirects to explicit user intent

**Status**: accepted (supersedes the "Guards requiring authentication... call `keycloak.login()` directly" line in [ADR 0001](./0001-migrate-auth-to-keycloak.md))

## Context

Route guards for `require-login` (e.g. on `/home`, `/notifications`, `/import`, staff routes) called `keycloak.login()` directly on `beforeLoad`, so any unauthenticated navigation to a guarded route — including a top-bar logo link into `/home` that every visitor could click — hard-redirected to Keycloak with no click on an actual login control. This contradicted this repo's own stated intent (see `CONTEXT.md`: "Users browse games and each other's profiles anonymously") and made pre-signup exploration impossible for some pages.

## Decision

A Keycloak redirect now only ever happens as the direct result of the user clicking something whose entire purpose is "log in" — the top-bar Login button, or the "Log in" button in a new shared login-required modal. Nothing redirects to Keycloak on its own:

- `/home` (and `/`, which now renders the same content) dropped its auth guard entirely — it has no personalized data, so there was nothing to protect.
- `/notifications`, `/import`, and staff-only routes keep their guard, but `require-login` now does an in-app `redirect({ to: "/" })` instead of calling `keycloak.login()` — the same pattern already used for their `forbidden` (logged in, not staff) outcome.
- Actions that need an Identity (add-to-list, follow, write a review) are shown to anonymous visitors instead of hidden; clicking one opens the login-required modal (`useRequireAuth`) rather than performing the action or redirecting.

## Consequences

- A stale bookmark or typed URL for `/notifications`/`/import`/an admin route now lands an anonymous visitor on the home page instead of Keycloak — no in-app "you were redirected because..." messaging exists for that case.
- The login-required modal does not retry the original action after a successful login; the user re-clicks it.
