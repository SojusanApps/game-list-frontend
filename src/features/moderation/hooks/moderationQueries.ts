import { useQuery, useQueryClient } from "@tanstack/react-query";

import { ReportCreateWritable, ReportDirectModerateWritable, TargetTypeEnum } from "@/client";
import { useAppMutation } from "@/hooks/useAppMutation";
import {
  collectionKeys,
  gameListKeys,
  gameReviewKeys,
  reportKeys,
  translationSuggestionKeys,
  userKeys,
} from "@/lib/queryKeys";

import {
  acceptReport,
  createDirectModerateReport,
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

const AFFECTED_QUERY_KEYS_BY_TARGET_TYPE: Record<TargetTypeEnum, readonly unknown[]> = {
  [TargetTypeEnum.REVIEW]: gameReviewKeys.all,
  [TargetTypeEnum.TRANSLATION_SUGGESTION]: translationSuggestionKeys.all,
  [TargetTypeEnum.GAME_LIST_NOTE]: gameListKeys.all,
  [TargetTypeEnum.COLLECTION]: collectionKeys.all,
  [TargetTypeEnum.COLLECTION_ITEM_NOTE]: collectionKeys.all,
  [TargetTypeEnum.AVATAR]: userKeys.all,
  [TargetTypeEnum.USERNAME]: userKeys.all,
};

export const useCreateDirectModerateReport = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (body: ReportDirectModerateWritable) => createDirectModerateReport(body),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
      queryClient.invalidateQueries({ queryKey: AFFECTED_QUERY_KEYS_BY_TARGET_TYPE[variables.target_type] });
    },
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
