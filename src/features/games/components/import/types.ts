import { GameListStatusEnum } from "@/client";

/**
 * The minimal game shape both import flows work with. Satisfied by
 * `GameSimpleList` (catalogue search).
 */
export interface ImportedGame {
  id: number;
  title: string;
  cover_image_id?: string | null;
}

export interface GameRow {
  game: ImportedGame;
  status: GameListStatusEnum;
  score: number | null;
  owned_on: string[];
  started_at: string | null;
  completed_at: string | null;
  /** Entered in hours; converted to minutes for the backend on submit. */
  playtime: number | null;
  description: string;
}

/**
 * What the user decided for one imported title on the match step: the game it
 * is, or "not a game" (a soundtrack, for example). A title without a
 * resolution is skipped from the import.
 */
export type TitleResolution = { kind: "game"; game: ImportedGame } | { kind: "not-a-game" };

export function createGameRow(game: ImportedGame, ownedOn: string[] = []): GameRow {
  return {
    game,
    status: GameListStatusEnum.PTP,
    score: null,
    owned_on: ownedOn,
    started_at: null,
    completed_at: null,
    playtime: null,
    description: "",
  };
}
