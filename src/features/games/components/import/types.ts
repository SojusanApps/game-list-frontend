/**
 * The minimal game shape both import flows work with. Satisfied by
 * `GameSimpleList` (catalogue search).
 */
export interface ImportedGame {
  id: number;
  title: string;
  cover_image_id?: string | null;
}

/**
 * What the user decided for one imported title on the match step: the game it
 * is, or "not a game" (a soundtrack, for example). A title without a
 * resolution is skipped from the import.
 */
export type TitleResolution = { kind: "game"; game: ImportedGame } | { kind: "not-a-game" };
