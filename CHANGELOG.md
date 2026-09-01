# CHANGELOG

> Date format is DD.MM.YYYY.

## v. [1.0.0] -

**Compatible backend version: [5.3.3]**

- Title import: added the release date to the CandidateCard for easier identification of the game.
- Game import: the "configure the games to import" step (Steam and Title import) no longer lags while typing — rows are virtualized and only the row being edited re-renders.
- Modal forms now keep what you have typed when the dialog is closed — by an accidental click outside, Escape, or Cancel. The draft is restored the next time you open the dialog and is only cleared after a successful save. Covers game reviews, game list entries, translation suggestions, collection create/edit, add-to-collection, ranking and tier-list descriptions, reports, and the staff warn/ban actions.
- Collection collaborator picker: search results and selected collaborators now show the user's avatar, already-added collaborators are marked with a check icon, the dropdown no longer disappears behind the dialog buttons, and search now filters by the collaborator's username.
- Game list dialog: fixed the "started"/"completed" date fields, and playtime is now entered and displayed in hours while still being stored in minutes.
- Gaming background graphic: the close icon no longer looks like a plus sign.
- Polish translations reworded to be gender-neutral.

## v. [0.1.0] - 27.08.2026

**Compatible backend version: [5.3.2]**

- Initial version.
