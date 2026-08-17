import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ReportCreateWritable } from "@/client";
import { useAppMutation } from "@/hooks/useAppMutation";
import { reportKeys } from "@/lib/queryKeys";

import {
  acceptReport,
  createReport,
  getReports,
  ModerationReportsListQuery,
  rejectReport,
  ReportRejectBody,
} from "../api/moderation";

export const useCreateReport = () => {
  return useAppMutation({
    mutationFn: (body: ReportCreateWritable) => createReport(body),
  });
};

export const useGetReports = (query?: ModerationReportsListQuery) => {
  return useQuery({
    queryKey: reportKeys.list(query),
    queryFn: () => getReports(query),
  });
};

export const useAcceptReport = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (id: number) => acceptReport(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
};

export const useRejectReport = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (variables: { id: number } & ReportRejectBody) =>
      rejectReport(variables.id, { rejection_reason: variables.rejection_reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
};
