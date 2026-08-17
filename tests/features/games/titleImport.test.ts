import { describe, expect, it } from "vitest";

import {
  TITLE_IMPORT_BATCH_SIZE,
  parseTitles,
  chunkTitles,
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

describe("chunkTitles", () => {
  const titles = Array.from({ length: 23 }, (_, i) => `Game ${i}`);

  it("chunks by the batch size with a smaller remainder", () => {
    const chunks = chunkTitles(titles);
    expect(chunks).toHaveLength(3);
    expect(chunks[0]).toHaveLength(TITLE_IMPORT_BATCH_SIZE);
    expect(chunks[1]).toHaveLength(TITLE_IMPORT_BATCH_SIZE);
    expect(chunks[2]).toHaveLength(3);
    expect(chunks.flat()).toEqual(titles);
  });

  it("returns no chunks for an empty list", () => {
    expect(chunkTitles([])).toEqual([]);
  });

  it("returns a single chunk when under the batch size", () => {
    expect(chunkTitles(["a", "b"])).toEqual([["a", "b"]]);
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
