import { describe, expect, it } from "vitest";

import { PlatformEnum } from "@/client";
import {
  STORE_IMPORT_CHUNK_SIZE,
  addStoreRefs,
  chunkStoreEntries,
  storeLinksForPicks,
  storeRefsForTitle,
  storeRefsForTitles,
  parseTitles,
  findDuplicateGroups,
  uniquePickedGames,
} from "@/features/games/utils/titleImport";

describe("parseTitles", () => {
  it("splits lines and trims whitespace", () => {
    expect(parseTitles("  Hades  \nHollow Knight\n")).toEqual(["Hades", "Hollow Knight"]);
  });

  it("drops empty and whitespace-only lines", () => {
    expect(parseTitles("Hades\n\n   \nCeleste")).toEqual(["Hades", "Celeste"]);
  });

  it("dedupes case-insensitively keeping the first occurrence", () => {
    expect(parseTitles("Hades\nHADES\nhades\nCeleste")).toEqual(["Hades", "Celeste"]);
  });

  it("handles windows line endings", () => {
    expect(parseTitles("Hades\r\nCeleste")).toEqual(["Hades", "Celeste"]);
  });

  it("returns an empty array for blank input", () => {
    expect(parseTitles("   \n \n")).toEqual([]);
  });
});

describe("findDuplicateGroups", () => {
  const hades = { id: 1, title: "Hades" };
  const celeste = { id: 2, title: "Celeste" };

  it("groups titles that picked the same game", () => {
    const groups = findDuplicateGroups([
      { title: "Hades", game: hades },
      { title: "Hades II", game: hades },
      { title: "Celeste", game: celeste },
    ]);
    expect(groups).toEqual([{ game: hades, titles: ["Hades", "Hades II"] }]);
  });

  it("returns nothing when every pick is unique", () => {
    const groups = findDuplicateGroups([
      { title: "Hades", game: hades },
      { title: "Celeste", game: celeste },
    ]);
    expect(groups).toEqual([]);
  });
});

describe("uniquePickedGames", () => {
  const hades = { id: 1, title: "Hades" };
  const celeste = { id: 2, title: "Celeste" };

  it("dedupes picked games by id keeping first-pick order", () => {
    const games = uniquePickedGames([
      { title: "Celeste", game: celeste },
      { title: "Hades", game: hades },
      { title: "Hades II", game: hades },
    ]);
    expect(games).toEqual([celeste, hades]);
  });
});

describe("addStoreRefs", () => {
  it("keys refs by trimmed lowercased title", () => {
    const refs = addStoreRefs({}, PlatformEnum.STEAM, [{ store_id: "1", title: "  Hades " }]);
    expect(refs).toEqual({ hades: [{ platform: PlatformEnum.STEAM, store_id: "1", store_title: "Hades" }] });
  });

  it("never adds the same platform and store id twice", () => {
    const once = addStoreRefs({}, PlatformEnum.STEAM, [{ store_id: "1", title: "Hades" }]);
    const twice = addStoreRefs(once, PlatformEnum.STEAM, [{ store_id: "1", title: "HADES" }]);
    expect(twice.hades).toHaveLength(1);
  });

  it("keeps different store ids under the same title and does not mutate the input", () => {
    const input = addStoreRefs({}, PlatformEnum.STEAM, [{ store_id: "1", title: "Hades" }]);
    const next = addStoreRefs(input, PlatformEnum.GOG, [{ store_id: "9", title: "Hades" }]);
    expect(next.hades).toHaveLength(2);
    expect(input.hades).toHaveLength(1);
  });
});

describe("storeRefsForTitles", () => {
  const refs = addStoreRefs({}, PlatformEnum.EPIC, [
    { store_id: "a", title: "Hades" },
    { store_id: "b", title: "Celeste" },
  ]);

  it("collects the refs of every given title, case-insensitively", () => {
    expect(storeRefsForTitles(refs, ["HADES", " celeste "]).map(ref => ref.store_id)).toEqual(["a", "b"]);
  });

  it("returns nothing for titles without refs", () => {
    expect(storeRefsForTitles(refs, ["Unknown"])).toEqual([]);
  });
});

describe("storeRefsForTitle", () => {
  const refs = addStoreRefs({}, PlatformEnum.STEAM, [{ store_id: "a", title: "Hades" }]);

  it("returns the refs of one title, case-insensitively", () => {
    expect(storeRefsForTitle(refs, " HADES ").map(ref => ref.store_id)).toEqual(["a"]);
  });

  it("returns nothing for a title without refs", () => {
    expect(storeRefsForTitle(refs, "Unknown")).toEqual([]);
  });
});

describe("chunkStoreEntries", () => {
  it("splits into chunks of the request limit", () => {
    const entries = Array.from({ length: STORE_IMPORT_CHUNK_SIZE * 2 + 1 }, (_, i) => i);
    expect(chunkStoreEntries(entries).map(chunk => chunk.length)).toEqual([
      STORE_IMPORT_CHUNK_SIZE,
      STORE_IMPORT_CHUNK_SIZE,
      1,
    ]);
  });

  it("returns no chunks for no entries", () => {
    expect(chunkStoreEntries([])).toEqual([]);
  });
});

const linkEntry = (store_id: string, title: string, wishlisted = false) => ({
  platform: PlatformEnum.GOG,
  store_id,
  title,
  wishlisted,
});

describe("storeLinksForPicks", () => {
  it("links every store entry whose title was picked, keeping the wishlist flag", () => {
    const entries = [linkEntry("1", "Hades"), linkEntry("2", "hades ", true), linkEntry("3", "Other")];

    expect(storeLinksForPicks(entries, [{ title: "Hades", game: { id: 7 } }])).toEqual([
      { ...entries[0], game: 7 },
      { ...entries[1], game: 7 },
    ]);
  });

  it("returns nothing when no pick matches an entry", () => {
    expect(storeLinksForPicks([linkEntry("1", "Hades")], [{ title: "Celeste", game: { id: 1 } }])).toEqual([]);
  });
});
