import type { PlatformEnum, StoreEntry, StoreLinkItem } from "@/client";

/** The backend accepts this many store entries per store-import request. */
export const STORE_IMPORT_CHUNK_SIZE = 5000;

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

/** A store id a title came from, sent along with the picked game so the pick can be recorded as a Store Mapping. */
export interface StoreRef {
  platform: PlatformEnum;
  store_id: string;
  store_title: string;
}

/** Store refs by lowercased title, matching how `parseTitles` treats titles. */
export type StoreRefsByTitle = Record<string, StoreRef[]>;

const titleKey = (title: string) => title.trim().toLowerCase();

const entryKey = (entry: Pick<StoreEntry, "platform" | "store_id">) => `${entry.platform}:${entry.store_id}`;

/** Add the refs of unmatched store entries; the same store id is never added twice. */
export function addStoreRefs(
  refs: StoreRefsByTitle,
  platform: PlatformEnum,
  entries: ReadonlyArray<{ store_id: string; title: string }>,
): StoreRefsByTitle {
  const next: StoreRefsByTitle = { ...refs };
  for (const { store_id, title } of entries) {
    const key = titleKey(title);
    const existing = next[key] ?? [];
    if (!existing.some(ref => ref.platform === platform && ref.store_id === store_id)) {
      next[key] = [...existing, { platform, store_id, store_title: title.trim() }];
    }
  }
  return next;
}

/** The store refs of one title. */
export function storeRefsForTitle(refs: StoreRefsByTitle, title: string): StoreRef[] {
  return refs[titleKey(title)] ?? [];
}

/** The store refs of every title in `titles`, for one picked game. */
export function storeRefsForTitles(refs: StoreRefsByTitle, titles: readonly string[]): StoreRef[] {
  return titles.flatMap(title => storeRefsForTitle(refs, title));
}

/** The store entries behind picks of games already on the user's list, as store link requests. */
export function storeLinksForPicks(
  entries: readonly StoreEntry[],
  picks: ReadonlyArray<{ title: string; game: { id: number } }>,
): StoreLinkItem[] {
  const links = new Map<string, StoreLinkItem>();
  for (const pick of picks) {
    for (const entry of entries) {
      if (titleKey(entry.title) === titleKey(pick.title)) {
        links.set(entryKey(entry), { ...entry, game: pick.game.id });
      }
    }
  }
  return [...links.values()];
}

/** Splits store entries into request-sized chunks. */
export function chunkStoreEntries<T>(entries: readonly T[]): T[][] {
  const chunks: T[][] = [];
  for (let start = 0; start < entries.length; start += STORE_IMPORT_CHUNK_SIZE) {
    chunks.push(entries.slice(start, start + STORE_IMPORT_CHUNK_SIZE));
  }
  return chunks;
}

/** Add `incoming` store entries to the pending list, skipping ones whose platform and store id are already there. */
export function mergeStoreEntries(current: readonly StoreEntry[], incoming: readonly StoreEntry[]): StoreEntry[] {
  const seen = new Set(current.map(entry => entryKey(entry)));
  const added = incoming.filter(entry => {
    const key = entryKey(entry);
    if (seen.has(key)) {
      return false;
    }
    seen.add(key);
    return true;
  });
  return [...current, ...added];
}

/** The store refs of all `entries`, keyed by title. */
export function storeRefsFromEntries(entries: readonly StoreEntry[]): StoreRefsByTitle {
  let refs: StoreRefsByTitle = {};
  for (const entry of entries) {
    refs = addStoreRefs(refs, entry.platform, [entry]);
  }
  return refs;
}
