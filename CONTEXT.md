# My Game List Frontend

A game-tracking and review platform. This context covers user-generated content moderation: how users report content, and how staff act on it.

## Language

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
