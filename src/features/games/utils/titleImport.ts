export const TITLE_IMPORT_BATCH_SIZE = 10;

/**
 * Parse the raw textarea content into a clean list of titles:
 * one per line, trimmed, empty lines dropped, deduped case-insensitively
 * (first occurrence wins).
 */
export function parseTitles(raw: string): string[] {
  const seen = new Set<string>();
  const titles: string[] = [];
  for (const line of raw.split(/\r?\n/)) {
    const title = line.trim();
    if (!title) {
      continue;
    }
    const key = title.toLowerCase();
    if (seen.has(key)) {
      continue;
    }
    seen.add(key);
    titles.push(title);
  }
  return titles;
}

/** Append `incoming` titles to the textarea content, one per line, skipping ones already present. */
export function appendTitles(raw: string, incoming: string[]): string {
  return parseTitles([raw, ...incoming].join("\n")).join("\n");
}

export function chunkTitles(titles: string[], size: number = TITLE_IMPORT_BATCH_SIZE): string[][] {
  const chunks: string[][] = [];
  for (let i = 0; i < titles.length; i += size) {
    chunks.push(titles.slice(i, i + size));
  }
  return chunks;
}

export interface TitleGamePick<TGame extends { id: number }> {
  title: string;
  game: TGame;
}

export interface DuplicateGroup<TGame extends { id: number }> {
  game: TGame;
  titles: string[];
}

/** Group picks by game and return only the games chosen for more than one title. */
export function findDuplicateGroups<TGame extends { id: number }>(
  picks: Array<TitleGamePick<TGame>>,
): Array<DuplicateGroup<TGame>> {
  const byGameId = new Map<number, DuplicateGroup<TGame>>();
  for (const pick of picks) {
    const group = byGameId.get(pick.game.id);
    if (group) {
      group.titles.push(pick.title);
    } else {
      byGameId.set(pick.game.id, { game: pick.game, titles: [pick.title] });
    }
  }
  return [...byGameId.values()].filter(group => group.titles.length > 1);
}

/** The picked games deduped by ID, keeping first-pick order. */
export function uniquePickedGames<TGame extends { id: number }>(picks: Array<TitleGamePick<TGame>>): TGame[] {
  const seen = new Set<number>();
  const games: TGame[] = [];
  for (const pick of picks) {
    if (!seen.has(pick.game.id)) {
      seen.add(pick.game.id);
      games.push(pick.game);
    }
  }
  return games;
}
