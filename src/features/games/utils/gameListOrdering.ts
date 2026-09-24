import type { GameListGameFilters } from "../hooks/useGameListQueries";

export const GAME_LIST_ORDERING_VALUES = ["title", "-title", "-score", "score"] as const;

export type GameListOrdering = (typeof GAME_LIST_ORDERING_VALUES)[number];

export const DEFAULT_GAME_LIST_ORDERING: GameListOrdering = "title";

export function isGameListOrdering(value: unknown): value is GameListOrdering {
  return (GAME_LIST_ORDERING_VALUES as readonly unknown[]).includes(value);
}

function isEmptyFilterValue(value: unknown): boolean {
  return value === "" || value === undefined || value === null || (Array.isArray(value) && value.length === 0);
}

/** Ordering sorts the list rather than narrowing it, so it never counts as an active filter. */
export function countActiveGameListFilters(filters: GameListGameFilters): number {
  return Object.entries(filters).filter(([key, value]) => key !== "ordering" && !isEmptyFilterValue(value)).length;
}

/** Turns the filter drawer's form data into query filters; an unset ordering falls back to the default. */
export function buildGameListFilters(data: Record<string, unknown>): GameListGameFilters {
  const filters: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(data)) {
    if (key === "ordering" || isEmptyFilterValue(value)) {
      continue;
    }
    filters[key] = value instanceof Date ? value.toISOString().split("T")[0] : value;
  }
  filters.ordering = isGameListOrdering(data.ordering) ? data.ordering : DEFAULT_GAME_LIST_ORDERING;
  return filters as GameListGameFilters;
}
