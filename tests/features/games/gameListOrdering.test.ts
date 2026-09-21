import { describe, expect, it } from "vitest";

import {
  buildGameListFilters,
  countActiveGameListFilters,
  DEFAULT_GAME_LIST_ORDERING,
  isGameListOrdering,
} from "@/features/games/utils/gameListOrdering";

describe("gameListOrdering", () => {
  describe("DEFAULT_GAME_LIST_ORDERING", () => {
    it("is title A-Z", () => {
      expect(DEFAULT_GAME_LIST_ORDERING).toBe("title");
    });
  });

  describe("isGameListOrdering", () => {
    it.each(["title", "-title", "score", "-score"])("accepts %s", value => {
      expect(isGameListOrdering(value)).toBe(true);
    });

    it.each(["", "popularity", "created_at", undefined, null])("rejects %s", value => {
      expect(isGameListOrdering(value)).toBe(false);
    });
  });

  describe("countActiveGameListFilters", () => {
    it("does not count the ordering", () => {
      expect(countActiveGameListFilters({ ordering: "-score" })).toBe(0);
    });

    it("counts non-empty filters and skips empty ones", () => {
      expect(
        countActiveGameListFilters({
          ordering: "title",
          developer: "Valve",
          genres: ["1", "2"],
          platforms: [],
          publisher: "",
        }),
      ).toBe(2);
    });
  });

  describe("buildGameListFilters", () => {
    it("keeps a valid ordering", () => {
      expect(buildGameListFilters({ ordering: "-score" }).ordering).toBe("-score");
    });

    it.each(["", undefined, "popularity"])("falls back to the default ordering for %s", ordering => {
      expect(buildGameListFilters({ ordering }).ordering).toBe(DEFAULT_GAME_LIST_ORDERING);
    });

    it("drops empty values and formats dates", () => {
      expect(
        buildGameListFilters({
          ordering: "title",
          developer: "",
          genres: [],
          publisher: undefined,
          release_date_after: new Date("2020-01-01T00:00:00Z"),
          release_date_before: null,
          platforms: ["7"],
        }),
      ).toEqual({ ordering: "title", release_date_after: "2020-01-01", platforms: ["7"] });
    });
  });
});
