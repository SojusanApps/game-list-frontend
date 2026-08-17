# Migrate authentication to Keycloak

**Status**: accepted

## Context

Login and registration were previously handled entirely by this frontend: local forms (`LoginForm`, `RegisterForm`) posted directly to a backend that issued its own SimpleJWT-style access/refresh tokens, and the frontend derived identity by decoding the JWT (`user_id` claim assumed to equal the backend `User.id`). We're moving token issuance and credential management to Keycloak so the frontend and backend no longer own passwords or the login UI.

## Decision

Keycloak becomes the sole issuer of tokens and owner of the login/registration UI. The frontend uses **keycloak-js** (not a generic OIDC client or a hand-rolled PKCE flow) because it's purpose-built for Keycloak, ships silent-SSO restore via a hidden iframe, and exposes Keycloak-specific concepts (realm/client roles) directly if ever needed.

### Identity vs. User

A Keycloak **Identity** (the `sub` claim plus token contents) is not the same thing as the app's **User** record (numeric `id`, `is_staff`, `slug`, `gravatar_url`, `username`). The frontend never derives a User by decoding the token client-side. Instead, the backend's `GET /api/user/users/me/` resolves the local User from the current Identity's claims. This is the seam between "who Keycloak says you are" and "what our app knows about you."

`username` is synced from Keycloak's `nickname` claim into the backend User; it is never edited locally. Password is entirely Keycloak's concern. `is_staff` stays backend-owned (an app-specific authorization concept, not an identity attribute) and is not modeled as a Keycloak role.

**Confirmed against the backend's actual implementation** (its `add-keycloak` branch, ADRs 0005–0013 in that repo): provisioning (create-on-first-sight, or linking a Keycloak-less admin account by verified email) and `username` reconciliation both happen in the backend's Keycloak authentication class, on _every_ authenticated request — not scoped to `/me`. So `/me` is a thin read, and any API call keeps `username` fresh, not just calls to `/me`. The backend also confirmed a **hard cutover**: no dual-token transition period, old SimpleJWT tokens are rejected outright once the new authentication class deploys — so this frontend's rollout must be coordinated with that backend deploy, not shipped independently on its own schedule.

### Session lifecycle

- On load, the app blocks on a full-screen loading state until `keycloak.init()` (with `onLoad: 'check-sso'`) resolves, so route guards and components never see an ambiguous "auth not yet known" state. If init fails (Keycloak unreachable), the app fails **closed** — a persistent error screen, not silent anonymous fallback — because we can't be sure whether the user is actually logged in.
- Silent check-sso targets a static `public/silent-check-sso.html`, not the SPA itself, so the full app doesn't bootstrap a second time inside the hidden iframe on every page load.
- Tokens live in memory only (no `localStorage` persistence) — session restore across reloads goes through Keycloak's own SSO cookie via check-sso, not a locally cached token. This closes an XSS token-theft surface that existed in the old `zustand`-persisted store.
- Requests proactively call `keycloak.updateToken(30)` before going out, rather than reacting to a 401 and retrying — this was the existing `clientSetup.tsx` pattern and keycloak-js's documented approach.
- Logout performs a full Keycloak end-session redirect, not a local-only clear — otherwise silent check-sso would immediately re-authenticate the user on the next load, making logout a no-op.
- Guards requiring authentication (e.g. `requireStaff`) call `keycloak.login()` directly; there is no local `/login` route to bounce through.

### Removed from scope

Login/register forms, pages, and routes (`LoginForm`, `RegisterForm`, `LoginPage`, `RegisterPage`, `routes/login.tsx`, `routes/register.tsx`, `useCreateUser`) are deleted outright rather than left as dead code. The never-wired-up social login buttons (Google/Facebook/X) are dropped; if social login is wanted later, it's configured as an identity provider on the Keycloak realm, invisible to this frontend. `ChangePasswordForm` and `ChangeUsernameForm`'s backend-write paths are dead; both actions should point users at Keycloak's account console instead.

## Consequences

- `useCurrentUserId` (previously a synchronous JWT decode) becomes a thin derivation of a new cached `useCurrentUser()` React Query hook backed by `/me`. Every consumer (`useIsOwner`, `useIsStaff`, `TopBar`, `GameDetailPage`, `requireStaff`) now depends on a hook that can be loading/undefined, not a synchronous value.
- New env vars are required for Keycloak's URL, realm, and client ID (`VITE_KEYCLOAK_URL`/`VITE_KEYCLOAK_REALM`/`VITE_KEYCLOAK_CLIENT_ID`); `VITE_KEYCLOAK_CLIENT_ID` must match the backend's `KEYCLOAK_AUDIENCE` value exactly (same underlying Keycloak client). Real values still depend on a provisioned Keycloak realm/client; placeholders until then.
- Username collisions on sync get a numeric suffix on the backend side (`nickname`, `nickname2`, ...) — the frontend has no input into this and just displays whatever `username` comes back.
