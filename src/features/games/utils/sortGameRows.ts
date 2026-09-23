import { GameListStatusEnum } from "@/client";

import { GameRow } from "../components/import/types";

export type SortColumn = "title" | "status" | "score";
export type SortDirection = "asc" | "desc";

export interface SortState {
  column: SortColumn;
  direction: SortDirection;
}

/**
 * Logical progress order for sorting by status (plan to play through not
 * planned), not the enum's declaration order or its translated label.
 */
const STATUS_SORT_RANK: Record<GameListStatusEnum, number> = {
  [GameListStatusEnum.PTP]: 0,
  [GameListStatusEnum.P]: 1,
  [GameListStatusEnum.OH]: 2,
  [GameListStatusEnum.C]: 3,
  [GameListStatusEnum.D]: 4,
  [GameListStatusEnum.NP]: 5,
};

/** Ascending comparison with unscored (`null`) rows placed last. */
function compareAscending(a: GameRow, b: GameRow, column: SortColumn): number {
  switch (column) {
    case "title": {
      return a.game.title.localeCompare(b.game.title, undefined, { sensitivity: "base" });
    }
    case "status": {
      return STATUS_SORT_RANK[a.status] - STATUS_SORT_RANK[b.status];
    }
    case "score": {
      if (a.score === null && b.score === null) {
        return 0;
      }
      if (a.score === null) {
        return 1;
      }
      if (b.score === null) {
        return -1;
      }
      return a.score - b.score;
    }
  }
}

/**
 * Returns the original indices of `rows` reordered per `column`/`direction`.
 * Unscored rows always sort last regardless of direction. Ties keep their
 * original relative order (stable sort).
 */
export function getSortedRowIndices(rows: GameRow[], { column, direction }: SortState): number[] {
  const sign = direction === "asc" ? 1 : -1;
  return rows
    .map((_, index) => index)
    .toSorted((indexA, indexB) => {
      const a = rows[indexA];
      const b = rows[indexB];
      const cmp = compareAscending(a, b, column);
      // Null-score placement is fixed (always last), independent of direction.
      if (column === "score" && (a.score === null || b.score === null)) {
        return cmp;
      }
      return cmp * sign;
    });
}
