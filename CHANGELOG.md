# CHANGELOG

> Date format is DD.MM.YYYY.

## v. [1.0.0] - 02.09.2026

**Compatible backend version: [5.3.3]**

- Result lists can now be viewed as a paginated table instead of the infinite-scroll grid. A toggle (grid / table icons) switches between them, and the choice is remembered across sessions and applies everywhere it is offered: search results, your game list, collections, a collection's games, the release calendar list and day pop-up, a company's developed/published games, a game's related titles, and your friends. The table shows First / Previous / numbered pages / Next, plus a "go to page" box when there are many pages; on search, the page number is part of the URL so paged links can be shared and the back button steps through pages.
- Game List page: the separate list view was removed — it is now grid or table.
- Notifications, Admin Reports, Admin Translation Suggestions and Game Reviews now use the same pager; Game Reviews previously mis-counted its pages and could land on an empty page.
- Title import: added the release date to the CandidateCard for easier identification of the game.
- Game import: the "configure the games to import" step (Steam and Title import) no longer lags while typing — rows are virtualized and only the row being edited re-renders.
- Modal forms now keep what you have typed when the dialog is closed — by an accidental click outside, Escape, or Cancel. The draft is restored the next time you open the dialog and is only cleared after a successful save. Covers game reviews, game list entries, translation suggestions, collection create/edit, add-to-collection, ranking and tier-list descriptions, reports, and the staff warn/ban actions.
- Collection collaborator picker: search results and selected collaborators now show the user's avatar, already-added collaborators are marked with a check icon, the dropdown no longer disappears behind the dialog buttons, and search now filters by the collaborator's username.
- Game list dialog: fixed the "started"/"completed" date fields, and playtime is now entered and displayed in hours while still being stored in minutes.
- Gaming background graphic: the close icon no longer looks like a plus sign.
- Polish translations reworded to be gender-neutral.
- Added the common layout for modals.
- Emoji and text-character icons were replaced with monochrome SVG icons everywhere they were used — game list status labels, empty-state and info graphics, the Steam "not found" warning, collection filters, the ranking screens, and the back/continue arrows in the import flows.
- Game list status now shows a coloured icon consistently across the app: the list, the compare table, the profile statistics and recent-activity, the add/edit dialog (the icon now also shows in the status field itself, not only in the dropdown), and the import "configure games" step.
- Collections list: the type filter uses a filled yellow folder ("All") and a filled red heart ("Favorites").
- Collection and collections pages: an empty collection or an empty result set no longer shows two "nothing here" messages at once.
- Pairwise ranking button now uses an icon instead of an emoji.

## v. [0.1.0] - 27.08.2026

**Compatible backend version: [5.3.2]**

- Initial version.
