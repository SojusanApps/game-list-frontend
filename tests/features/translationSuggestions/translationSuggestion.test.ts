import { describe, expect, it } from "vitest";

import {
  FieldEnum,
  TranslationSuggestionStatusEnum,
  type TranslationSuggestion,
  type UserSimple,
} from "@/client/types.gen";
import {
  PROPOSED_VALUE_MAX_LENGTH,
  buildSuggestionFilters,
  canModerate,
  canWithdraw,
  findOwnPendingSuggestion,
  validateProposedValue,
} from "@/features/translationSuggestions/utils/translationSuggestion";

function makeUser(id: number): UserSimple {
  return { id, username: `user-${id}`, gravatar_url: "", slug: `user-${id}` };
}

function makeSuggestion(overrides: Partial<TranslationSuggestion> = {}): TranslationSuggestion {
  return {
    id: 1,
    game: { id: 42, title: "Test Game", slug: "test-game", cover_image_id: "abc123" },
    field: FieldEnum.SUMMARY,
    submitted_by: makeUser(7),
    current_value: "Stary opis.",
    proposed_value: "Nowy opis.",
    status: TranslationSuggestionStatusEnum.PENDING,
    submitted_at: "2026-07-07T12:00:00Z",
    reviewed_by: makeUser(0),
    reviewed_at: null,
    rejection_reason: "",
    ...overrides,
  };
}

describe("validateProposedValue", () => {
  it("returns null for a valid value", () => {
    expect(validateProposedValue(FieldEnum.SUMMARY, "Poprawiony opis gry.")).toBeNull();
  });

  it('returns "required" for an empty or whitespace-only value', () => {
    expect(validateProposedValue(FieldEnum.SUMMARY, "")).toBe("required");
    expect(validateProposedValue(FieldEnum.SUMMARY, "   ")).toBe("required");
  });

  it('returns "tooLong" one character past the field\'s max length, and null exactly at it', () => {
    const atLimit = "a".repeat(PROPOSED_VALUE_MAX_LENGTH[FieldEnum.TITLE]);
    const overLimit = atLimit + "a";
    expect(validateProposedValue(FieldEnum.TITLE, atLimit)).toBeNull();
    expect(validateProposedValue(FieldEnum.TITLE, overLimit)).toBe("tooLong");
  });

  it("enforces the summary field's own, higher max length", () => {
    const atLimit = "a".repeat(PROPOSED_VALUE_MAX_LENGTH[FieldEnum.SUMMARY]);
    const overLimit = atLimit + "a";
    expect(validateProposedValue(FieldEnum.SUMMARY, atLimit)).toBeNull();
    expect(validateProposedValue(FieldEnum.SUMMARY, overLimit)).toBe("tooLong");
  });
});

describe("findOwnPendingSuggestion", () => {
  it("finds the current user's pending suggestion for the given field", () => {
    const mine = makeSuggestion({ id: 1, submitted_by: makeUser(7), field: FieldEnum.SUMMARY });
    expect(findOwnPendingSuggestion([mine], 7, FieldEnum.SUMMARY)).toEqual(mine);
  });

  it("ignores another user's competing pending suggestion for the same field", () => {
    const someoneElses = makeSuggestion({ id: 1, submitted_by: makeUser(99), field: FieldEnum.SUMMARY });
    expect(findOwnPendingSuggestion([someoneElses], 7, FieldEnum.SUMMARY)).toBeUndefined();
  });

  it("ignores the current user's own pending suggestion for a different field", () => {
    const titlePending = makeSuggestion({ id: 1, submitted_by: makeUser(7), field: FieldEnum.TITLE });
    expect(findOwnPendingSuggestion([titlePending], 7, FieldEnum.SUMMARY)).toBeUndefined();
  });

  it("ignores the current user's own suggestions that are no longer pending", () => {
    const accepted = makeSuggestion({
      id: 1,
      submitted_by: makeUser(7),
      status: TranslationSuggestionStatusEnum.ACCEPTED,
    });
    const rejected = makeSuggestion({
      id: 2,
      submitted_by: makeUser(7),
      status: TranslationSuggestionStatusEnum.REJECTED,
    });
    const withdrawn = makeSuggestion({
      id: 3,
      submitted_by: makeUser(7),
      status: TranslationSuggestionStatusEnum.WITHDRAWN,
    });
    expect(findOwnPendingSuggestion([accepted, rejected, withdrawn], 7, FieldEnum.SUMMARY)).toBeUndefined();
  });
});

describe("canWithdraw", () => {
  it("is true only for the submitter's own pending suggestion", () => {
    const pending = makeSuggestion({ submitted_by: makeUser(7), status: TranslationSuggestionStatusEnum.PENDING });
    expect(canWithdraw(pending, 7)).toBe(true);
  });

  it("is false for another user's pending suggestion", () => {
    const pending = makeSuggestion({ submitted_by: makeUser(7), status: TranslationSuggestionStatusEnum.PENDING });
    expect(canWithdraw(pending, 99)).toBe(false);
  });

  it("is false for the submitter's own suggestion once it's no longer pending", () => {
    const accepted = makeSuggestion({ submitted_by: makeUser(7), status: TranslationSuggestionStatusEnum.ACCEPTED });
    expect(canWithdraw(accepted, 7)).toBe(false);
  });

  it("is false when there is no logged-in user", () => {
    const pending = makeSuggestion({ submitted_by: makeUser(7), status: TranslationSuggestionStatusEnum.PENDING });
    expect(canWithdraw(pending, null)).toBe(false);
  });
});

describe("canModerate", () => {
  it("is true for staff viewing a pending suggestion", () => {
    const pending = makeSuggestion({ status: TranslationSuggestionStatusEnum.PENDING });
    expect(canModerate(pending, true)).toBe(true);
  });

  it("is false for a non-staff user viewing a pending suggestion", () => {
    const pending = makeSuggestion({ status: TranslationSuggestionStatusEnum.PENDING });
    expect(canModerate(pending, false)).toBe(false);
  });

  it("is false for staff once the suggestion is no longer pending", () => {
    const accepted = makeSuggestion({ status: TranslationSuggestionStatusEnum.ACCEPTED });
    expect(canModerate(accepted, true)).toBe(false);
  });
});

describe("buildSuggestionFilters", () => {
  it("defaults to pending status when no status is given", () => {
    expect(buildSuggestionFilters({})).toEqual({ status: "pending", page: undefined });
  });

  it("respects an explicit status override", () => {
    expect(buildSuggestionFilters({ status: TranslationSuggestionStatusEnum.ACCEPTED })).toEqual({
      status: "accepted",
      page: undefined,
    });
  });

  it('omits the status filter entirely when "all" is selected', () => {
    expect(buildSuggestionFilters({ status: "all" })).toEqual({ page: undefined });
  });

  it("combines game, submittedBy, status and page filters together", () => {
    expect(buildSuggestionFilters({ status: "all", game: 42, submittedBy: 7, page: 2 })).toEqual({
      game: "42",
      submitted_by: "7",
      page: 2,
    });
  });
});
