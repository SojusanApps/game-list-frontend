import { describe, expect, it } from "vitest";

import { GameListStatusEnum } from "@/client";
import { createGameRow, GameRow } from "@/features/games/components/import/types";
import { getSortedRowIndices } from "@/features/games/utils/sortGameRows";

function titles(rows: GameRow[], order: number[]): string[] {
  return order.map(i => rows[i].game.title);
}

describe("getSortedRowIndices", () => {
  it("sorts by title ascending/descending, case-insensitively", () => {
    const rows = [
      createGameRow({ id: 1, title: "hollow knight" }),
      createGameRow({ id: 2, title: "Amnesia" }),
      createGameRow({ id: 3, title: "The Witcher 3" }),
    ];

    expect(titles(rows, getSortedRowIndices(rows, { column: "title", direction: "asc" }))).toEqual([
      "Amnesia",
      "hollow knight",
      "The Witcher 3",
    ]);
    expect(titles(rows, getSortedRowIndices(rows, { column: "title", direction: "desc" }))).toEqual([
      "The Witcher 3",
      "hollow knight",
      "Amnesia",
    ]);
  });

  it("sorts by status in logical progress order, not enum declaration order", () => {
    const rows = [
      { ...createGameRow({ id: 1, title: "Dropped" }), status: GameListStatusEnum.D },
      { ...createGameRow({ id: 2, title: "Completed" }), status: GameListStatusEnum.C },
      { ...createGameRow({ id: 3, title: "Plan to Play" }), status: GameListStatusEnum.PTP },
      { ...createGameRow({ id: 4, title: "Playing" }), status: GameListStatusEnum.P },
      { ...createGameRow({ id: 5, title: "On Hold" }), status: GameListStatusEnum.OH },
    ];

    expect(titles(rows, getSortedRowIndices(rows, { column: "status", direction: "asc" }))).toEqual([
      "Plan to Play",
      "Playing",
      "On Hold",
      "Completed",
      "Dropped",
    ]);
    expect(titles(rows, getSortedRowIndices(rows, { column: "status", direction: "desc" }))).toEqual([
      "Dropped",
      "Completed",
      "On Hold",
      "Playing",
      "Plan to Play",
    ]);
  });

  it("sorts by score with unscored rows always last, in both directions", () => {
    const rows = [
      { ...createGameRow({ id: 1, title: "No score" }), score: null },
      { ...createGameRow({ id: 2, title: "Score 7" }), score: 7 },
      { ...createGameRow({ id: 3, title: "Score 3" }), score: 3 },
    ];

    expect(titles(rows, getSortedRowIndices(rows, { column: "score", direction: "asc" }))).toEqual([
      "Score 3",
      "Score 7",
      "No score",
    ]);
    expect(titles(rows, getSortedRowIndices(rows, { column: "score", direction: "desc" }))).toEqual([
      "Score 7",
      "Score 3",
      "No score",
    ]);
  });

  it("keeps the original relative order for ties (stable sort)", () => {
    const rows = [
      { ...createGameRow({ id: 1, title: "First on hold" }), status: GameListStatusEnum.OH },
      { ...createGameRow({ id: 2, title: "Playing" }), status: GameListStatusEnum.P },
      { ...createGameRow({ id: 3, title: "Second on hold" }), status: GameListStatusEnum.OH },
    ];

    expect(titles(rows, getSortedRowIndices(rows, { column: "status", direction: "asc" }))).toEqual([
      "Playing",
      "First on hold",
      "Second on hold",
    ]);
  });
});
