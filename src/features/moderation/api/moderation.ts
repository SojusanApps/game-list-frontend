import {
  ModerationReportsListData,
  ModerationReportsRejectCreateData,
  ModerationService,
  ReportCreateWritable,
} from "@/client";
import { handleApiError } from "@/utils/apiUtils";
import StatusCode from "@/utils/StatusCode";

export type ModerationReportsListQuery = ModerationReportsListData["query"];
export interface ReportRejectBody {
  rejection_reason?: string;
}

export const getReports = async (query?: ModerationReportsListQuery) => {
  const { data, response } = await ModerationService.moderationReportsList({ query });
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(response, "Error fetching reports");
  }
  return data;
};

export const createReport = async (body: ReportCreateWritable) => {
  const { data, response } = await ModerationService.moderationReportsCreate({ body });
  if (response?.status !== StatusCode.CREATED) {
    return await handleApiError(response, "Error creating report");
  }
  return data;
};

export const acceptReport = async (id: number) => {
  const { data, response } = await ModerationService.moderationReportsAcceptCreate({ path: { id } });
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(response, "Error accepting report");
  }
  return data;
};

export const rejectReport = async (id: number, body?: ReportRejectBody) => {
  const { data, response } = await ModerationService.moderationReportsRejectCreate({
    path: { id },
    body: body as ModerationReportsRejectCreateData["body"],
  });
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(response, "Error rejecting report");
  }
  return data;
};
