# My Game List Frontend

A React SPA for tracking, reviewing, and organizing video game collections. Users browse games and each other's profiles anonymously; personalized actions (lists, reviews, collections) require an authenticated Identity.

## Language

**Identity**:
The authenticated principal as Keycloak knows it — a `sub` (Keycloak UUID) plus whatever claims are in the access token. The frontend never treats the Identity as the app's user record; it's only a credential proving "this session is authenticated as this Keycloak subject."
_Avoid_: Token user, JWT user

**User**:
The app's own account record — numeric `id`, `username`, `is_staff`, `slug`, `gravatar_url`. Resolved (and upserted, on first sight of a new Identity) via the `/users/me` endpoint, never derived by decoding the access token client-side. Not every field is backend-authored — see `username` — but the record itself, and its numeric `id`, exist only on the backend.
_Avoid_: Account, profile (UI-only term for the page that displays a User)

**Session**:
The state of being authenticated in the browser, backed by Keycloak (access token, refresh token, silent-SSO restore on page load). Distinct from the app's notion of User — a Session can exist before the corresponding User has been resolved.
_Avoid_: Login state, auth state

**username**:
The backend User's display name, synced from Keycloak's `nickname` claim on every `/users/me` call — never edited locally. Editing happens exclusively in Keycloak (account console); the backend just reconciles its cached copy on next lookup.
_Avoid_: Nickname (Keycloak's term for the source claim; use "username" for the backend's synced field), display name

**Credentials**:
Password and nickname (username) are both owned and edited exclusively by Keycloak. The backend never accepts a credential change directly — `ChangePasswordForm` and `ChangeUsernameForm`'s backend-write path are dead once Keycloak is live; both actions redirect to Keycloak's account console instead.
_Avoid_: Account settings (still a valid UI grouping, just no longer backed by local write endpoints for these two fields)
