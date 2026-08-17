import { describe, expect, it } from "vitest";

import { GameListCompareRow, GameListCompareResponse } from "@/client";
import { buildCompareSections } from "@/features/games/utils/gameListCompare";

const makeRow = (overrides: Partial<GameListCompareRow> = {}): GameListCompareRow => ({
  game_id: 1,
  game_slug: "hades",
  title: "Hades",
  game_cover_image: null,
  first_user_score: null,
  first_user_status: null,
  first_user_status_code: null,
  second_user_score: null,
  second_user_status: null,
  second_user_status_code: null,
  ...overrides,
});

describe("buildCompareSections", () => {
  it("returns the three sections in fixed order: common, firstUserUnique, secondUserUnique", () => {
    const response: GameListCompareResponse = {
      common: [makeRow()],
      first_user_unique: [makeRow()],
      second_user_unique: [makeRow()],
    };

    const sections = buildCompareSections(response);

    expect(sections.map(section => section.key)).toEqual(["common", "firstUserUnique", "secondUserUnique"]);
  });

  it("counts each section's rows independently", () => {
    const response: GameListCompareResponse = {
      common: [makeRow(), makeRow(), makeRow()],
      first_user_unique: [makeRow()],
      second_user_unique: [],
    };

    const sections = buildCompareSections(response);

    expect(sections.map(section => section.count)).toEqual([3, 1, 0]);
  });

  it("still returns all three sections when every group is empty", () => {
    const response: GameListCompareResponse = {
      common: [],
      first_user_unique: [],
      second_user_unique: [],
    };

    const sections = buildCompareSections(response);

    expect(sections).toHaveLength(3);
    expect(sections.every(section => section.count === 0 && section.rows.length === 0)).toBe(true);
  });

  it("passes each group's rows through unmodified and in their original order", () => {
    const first = makeRow({ game_id: 1, title: "Celeste" });
    const second = makeRow({ game_id: 2, title: "Hades" });
    const response: GameListCompareResponse = {
      common: [first, second],
      first_user_unique: [],
      second_user_unique: [],
    };

    const sections = buildCompareSections(response);

    expect(sections[0].rows).toEqual([first, second]);
  });
});
