import { ReportStatusEnum, SourceEnum, TargetTypeEnum, type Report } from "@/client/types.gen";

export function canReport(ownerId: number, currentUserId: number | null): boolean {
  return currentUserId !== null && currentUserId !== ownerId;
}

export function canWarnAndRemove(ownerId: number, currentUserId: number | null, isStaff: boolean): boolean {
  return isStaff && currentUserId !== null && currentUserId !== ownerId;
}

export const REPORT_REASON_MIN_LENGTH = 10;

export type ReportReasonError = "required" | "tooShort";

export function validateReportReason(reason: string): ReportReasonError | null {
  const trimmed = reason.trim();
  if (trimmed.length === 0) {
    return "required";
  }
  if (trimmed.length < REPORT_REASON_MIN_LENGTH) {
    return "tooShort";
  }
  return null;
}

export function canModerateReport(report: Report, isStaff: boolean): boolean {
  return isStaff && report.status === ReportStatusEnum.PENDING;
}

export interface ReportFilterState {
  status?: ReportStatusEnum | "all";
  targetType?: TargetTypeEnum;
  source?: SourceEnum;
  reportedUser?: number;
  page?: number;
}

export interface ReportListQuery {
  status?: string;
  target_type?: string;
  source?: string;
  reported_user?: string;
  page?: number;
}

export function buildReportFilters(state: ReportFilterState): ReportListQuery {
  const query: ReportListQuery = { page: state.page };
  if (state.status === undefined) {
    query.status = ReportStatusEnum.PENDING;
  } else if (state.status !== "all") {
    query.status = state.status;
  }
  if (state.targetType !== undefined) {
    query.target_type = state.targetType;
  }
  if (state.source !== undefined) {
    query.source = state.source;
  }
  if (state.reportedUser !== undefined) {
    query.reported_user = String(state.reportedUser);
  }
  return query;
}
