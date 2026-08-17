import { describe, expect, it } from "vitest";

import { ReportStatusEnum, TargetTypeEnum, type Report, type UserSimple } from "@/client/types.gen";
import {
  buildReportFilters,
  canModerateReport,
  canReport,
  REPORT_REASON_MIN_LENGTH,
  validateReportReason,
} from "@/features/moderation/utils/report";

function makeUser(id: number): UserSimple {
  return { id, username: `user-${id}`, gravatar_url: "", slug: `user-${id}` };
}

function makeReport(overrides: Partial<Report> = {}): Report {
  return {
    id: 1,
    target_type: TargetTypeEnum.REVIEW,
    target_review: 123,
    target_translation_suggestion: null,
    target_game_list: null,
    target_collection: null,
    target_collection_item: null,
    reported_by: makeUser(7),
    reported_user: makeUser(9),
    reported_value: "This is the offending review text.",
    reason: "This review contains harassment.",
    status: ReportStatusEnum.PENDING,
    submitted_at: "2026-07-09T12:00:00Z",
    reviewed_by: makeUser(0),
    reviewed_at: null,
    rejection_reason: "",
    ...overrides,
  };
}

describe("canReport", () => {
  it("returns true when the viewer does not own the target", () => {
    expect(canReport(7, 42)).toBe(true);
  });

  it("returns false when the viewer owns the target", () => {
    expect(canReport(42, 42)).toBe(false);
  });

  it("returns false when the viewer is logged out", () => {
    expect(canReport(42, null)).toBe(false);
  });
});

describe("validateReportReason", () => {
  it("returns null for a well-formed reason", () => {
    expect(validateReportReason("This review contains harassment.")).toBeNull();
  });

  it('returns "required" for an empty or whitespace-only reason', () => {
    expect(validateReportReason("")).toBe("required");
    expect(validateReportReason("      ")).toBe("required");
  });

  it('returns "tooShort" one character under the minimum, and null exactly at it', () => {
    const atLimit = "a".repeat(REPORT_REASON_MIN_LENGTH);
    const underLimit = atLimit.slice(0, -1);
    expect(validateReportReason(underLimit)).toBe("tooShort");
    expect(validateReportReason(atLimit)).toBeNull();
  });
});

describe("canModerateReport", () => {
  it("returns true for a staff member reviewing a pending report", () => {
    expect(canModerateReport(makeReport({ status: ReportStatusEnum.PENDING }), true)).toBe(true);
  });

  it("returns false for a non-staff member, even on a pending report", () => {
    expect(canModerateReport(makeReport({ status: ReportStatusEnum.PENDING }), false)).toBe(false);
  });

  it("returns false for a staff member once the report is no longer pending", () => {
    expect(canModerateReport(makeReport({ status: ReportStatusEnum.ACCEPTED }), true)).toBe(false);
    expect(canModerateReport(makeReport({ status: ReportStatusEnum.REJECTED }), true)).toBe(false);
  });
});

describe("buildReportFilters", () => {
  it("defaults to pending status when no status is given", () => {
    expect(buildReportFilters({})).toEqual({ status: "pending", page: undefined });
  });

  it("respects an explicit status override", () => {
    expect(buildReportFilters({ status: ReportStatusEnum.ACCEPTED })).toEqual({
      status: "accepted",
      page: undefined,
    });
  });

  it('omits the status filter entirely when "all" is selected', () => {
    expect(buildReportFilters({ status: "all" })).toEqual({ page: undefined });
  });

  it("combines target_type, reported_user, status and page filters together", () => {
    expect(buildReportFilters({ status: "all", targetType: TargetTypeEnum.AVATAR, reportedUser: 9, page: 2 })).toEqual({
      target_type: "avatar",
      reported_user: "9",
      page: 2,
    });
  });
});
