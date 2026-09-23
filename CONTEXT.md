# Sojusan GameList Frontend

A game-tracking and review platform. This context covers user-generated content moderation (how users report content and how staff act on it) plus core game-tracking vocabulary.

## Language

**Game List Status**:
The state a user assigns to a game on their list — one of six: `P` playing, `C` completed, `PTP` plan to play, `OH` on hold, `D` dropped, `NP` not planned. `D` dropped means the user started the game then abandoned it (stopped playing with no intent to finish); it does not mean the list entry was deleted. `NP` not planned means the user owns the game but does not intend to play it — never started, and no future intent, which distinguishes it from both `D` dropped (implies it was started) and `PTP` plan to play (implies future intent). Backed by `GameListStatusEnum`.
_Avoid_: progress, list state; do not conflate "dropped" with removing/deleting an entry; do not conflate "not planned" with "dropped" (never started vs. abandoned) or "plan to play" (no intent vs. future intent)

**Target**:
A piece of user-generated content or a profile field that can be reported — one of: avatar, username, review, translation suggestion, game list note, collection, collection item note. Identified by a `target_type` plus the matching entity id (or the owning user's id, for avatar/username).
_Avoid_: Reportable item, entity

**Report**:
A record that a Target may be wrong or against the rules. Carries a free-text `reason` (≥10 characters), a lifecycle `status` (pending → accepted/rejected), and a `source` describing how it was created.
_Avoid_: Complaint, flag

**Source (of a Report)**:
Which of two paths created a Report: `user_submitted` (an ordinary user filed it and it waits in the queue) or `admin_direct` (staff created and resolved it in the same action, via Warn & Remove).
_Avoid_: Origin, type

**Warn & Remove**:
A staff-only action that skips the report queue: it creates and immediately accepts a Report (`source: admin_direct`) against a Target, which masks the content and issues a Warning to its author in one step. Also sweeps and closes any other pending Reports already filed against the same Target, without giving its author an extra Warning for those. Refuses Targets owned by staff.
_Avoid_: Warn, direct moderation, admin action

**Ban**:
A staff-only action that marks a user's account as banned, independent of any Report or Warning history. All of that user's content (reviews, notes, collections, translation suggestions, avatar, username) is automatically masked from other users by default — the same masking applied when a Report against it is accepted — but the account itself stays fully usable: the banned user can keep logging in and using every feature of the Service. Requires a reason. Refuses staff accounts. There is no un-ban flow.
_Avoid_: Suspend, deactivate, deactivation

**Warning**:
The consequence recorded against a user's account when a Report targeting them is accepted — whether via the normal queue (Accept) or via Warn & Remove. A user's `warning_count` is visible only to the account owner and to staff.
_Avoid_: Strike, violation

**Staff**:
A user with `is_staff` set, who can moderate Reports, use Warn & Remove, and Ban accounts. The codebase has no finer-grained roles than this single flag.
_Avoid_: Admin, moderator (the UI/backend consistently say "staff")

**Game List Entry**:
One user's record of one game on their list. Carries a Game List Status, an optional Score, and an optional note. The user's Game List is the collection of their entries.
_Avoid_: List item, library item; do not conflate with a Collection item (a game placed in a user-curated Collection)

**Score**:
The owner's own rating of a game on their list, an integer from 1 to 10. Optional: an entry without one is "unscored". Not an aggregate of other users' ratings (see **Average Score**).
_Avoid_: Rating (in prose about the domain), rank; do not conflate with `rank_position` (a game's position in the global ranking)

**Average Score**:
The mean of all users' Scores for a game, shown on game cards and in game tables. 0 means no one has scored the game yet — the API has no "unrated" null for it — so it is treated as "no score" and not displayed. Distinct from a **Score**, which is one owner's own rating of a game on their list.
_Avoid_: Rating, community score; do not conflate with `rank_position` (derived from it, but a different thing)

**Favorite**:
A user's own private bookmark on a Collection. Each user has their own set, independent of the Collection's owner and of every other viewer; any signed-in user who can see a Collection may favorite it. It is not a property of the Collection itself. Anonymous visitors have none. The "My favorites" filter on a Collections list narrows to the Collections the viewer has favorited: on the viewer's own profile that is every Collection they have favorited, whoever owns it; on another user's profile it is only that user's Collections the viewer has favorited (one user's Favorites are never visible to another).
_Avoid_: Liked, starred, pinned; do not describe it as a flag or attribute "set by the owner" (the old model)

**Game List Ordering**:
The sort a viewer applies to a user's Game List: by game title (A–Z or Z–A) or by Score (high to low or low to high). Defaults to title A–Z. An explicit ordering always applies, including while searching by title (best-match order is not used). Unscored entries always come last when ordering by Score, in either direction. Distinct from the search page's ordering, which sorts games by created date, rank position or popularity.
_Avoid_: Sort mode, filter (ordering does not narrow the list)

**Collection**:
A user-curated, named set of games with a visibility and a mode. Distinct from a Game List (a user's per-game tracking record); a game in a Collection is a "collection item", not a Game List Entry.
_Avoid_: Playlist, folder

**Collaborative**:
The mode of a Collection that its owner has opened to a chosen set of Collaborators, who may add games to it alongside the owner. The other mode is Solo, where only the owner edits.
_Avoid_: Team, group collection

**Collaborator**:
A user, other than the owner, whom the owner has added to a Collaborative Collection so they can contribute games to it.
_Avoid_: Member (as a domain word), co-owner, editor

**Shared Collection**:
From the viewer's point of view, a Collaborative Collection owned by someone else in which the viewer is a Collaborator — "shared with me". Relative to the viewer: the owner's own Collaborative Collection is not "shared" from the owner's side.
_Avoid_: Collaborative (that names the mode, not the viewer's relationship), team collection
