# CHANGELOG

> Date format is DD.MM.YYYY.

## v. [1.1.0] - 24.09.2026

**Compatible backend version: [5.4.0]**

- Game List page: entries are now sorted by title (A–Z) by default, and the filter panel has a new "Sort Results By" field as its first field. You can sort by title (A–Z or Z–A) or by your score (high to low or low to high); entries without a score always come last when sorting by score. The sort applies to both the grid and the table, and also to the results when you search by title (they are no longer ordered by best match). It resets to title A–Z when you reload the page.
- Grid views: the grid now fills the whole box around it instead of stopping partway and leaving empty space (and clipping the cards) below it. This applies to your game list, search results, collections, a collection's games, and your friends. The box height now follows the window height (between 500 and 850 px), and the space between rows of game covers now matches the space between columns.
- Collection page: in collaborative mode, the "BY" / "PRZEZ" label on the "added by" badge is no longer larger than the username next to it.
- Collections: favorites are now personal. Each user has their own favorites, so a collection you favorite is no longer shown as a favorite to anyone else, and a collection's owner no longer decides it for everyone. You can favorite any collection you can see, not just your own, using the heart on the collection card, in the table row, or next to the title on the collection page (signed-out visitors are asked to log in). The "Mark as Favorite" checkbox is gone from the create/edit collection window. The favorites filter on the collections list is now called "My favorites" and shows the collections you have favorited; on your own profile that includes collections owned by other people, while on someone else's profile it shows only their collections that you have favorited. It is hidden when you are not logged in. Collections that were favorited before stay favorited for their owners only.
- Game page: the "Add to Collection" window now also lists collections shared with you (collaborative collections you were added to as a collaborator), not just your own. Shared ones are marked with a "Shared" badge and show who owns them, so they are easy to tell apart from your own collections.
- Game covers: the score chip in the corner of a cover is no longer shown when the game has no score yet (a score of 0), instead of showing a red "0.0".
- Game import: the "configure the games to import" step (Steam and Title import) now lets you sort by Title, Status or Score — click a column header to sort ascending, click again for descending, and a third click returns to the original order. Games without a score always sort last, and editing a row while sorted does not move it until you re-sort. You can also set the status for every game at once (handy if most of what you imported is already completed) using the new "Set status for all games" control above the table, then adjust individual games afterward.
- New game list status: "Not Planned", for games you own but don't intend to play. It appears everywhere the other statuses do — the status dropdown, list and table badges, the import flow, the FAQ, and your profile's status breakdown.
- Game List page: the status filter is now a single dropdown instead of a row of buttons that could wrap onto multiple lines.
- Reviews now have a language (English or Polish). The review window first asks which language you are writing in — there is no default, so you always choose — and only then shows the recommendation and text fields. A chip on the second step shows the chosen language and takes you back to change it without losing what you typed; when you edit an existing review it opens straight on the text, with the same chip. Each review shows an EN / PL badge. The game page's review preview and the Reviews page have a new English / Polish / All filter, which starts on your interface language (or All if it is neither); on the Reviews page the choice is kept in the address, so a filtered list can be shared, and "View all reviews" carries your choice over. Your own review always stays at the top, whatever the filter. Language names are shown in the language of the interface.
- Game list: editing or removing a game on your list now shows up immediately. The window closes as soon as you click Save or Remove, and your list and the game page update right away instead of after a reload. If you're viewing one status (for example Playing) and change a game to another, it leaves that view at once; a changed score is re-sorted a moment later. If saving fails, the change is undone, an error names the game, and reopening the window brings back what you typed. The "Updated" and "Removed" messages are gone, since the change is visible on its own.
- Error messages now appear in your interface language. When the server can't be reached or doesn't explain what went wrong, you get a message in English or Polish that says what kind of problem it was (no connection, not logged in, no permission, not found, too many requests, or a server problem) instead of an English message such as "Error fetching game list" or "Internal Server Error". Validation errors shown in a pop-up no longer start with internal field names such as "owned_on:".
- Updated dependencies, including Pragmatic drag and drop to version 4. The drag-and-drop code in rankings and tier lists now uses the library's new import paths, because version 4 removed the old ones.

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
