import { useQuery, useQueryClient } from "@tanstack/react-query";

import { TranslationSuggestionCreateWritable } from "@/client";
import { useAppMutation } from "@/hooks/useAppMutation";
import { translationSuggestionKeys, gameKeys } from "@/lib/queryKeys";

import {
  getTranslationSuggestions,
  createTranslationSuggestion,
  withdrawTranslationSuggestion,
  acceptTranslationSuggestion,
  rejectTranslationSuggestion,
  TranslationSuggestionListQuery,
  TranslationSuggestionWithdrawPath,
  TranslationSuggestionModerationPath,
  TranslationSuggestionRejectBody,
} from "../api/translationSuggestion";

export const useGetTranslationSuggestions = (
  query?: TranslationSuggestionListQuery,
  options?: { enabled?: boolean },
) => {
  return useQuery({
    queryKey: translationSuggestionKeys.list(query),
    queryFn: () => getTranslationSuggestions(query),
    ...options,
  });
};

export const useCreateTranslationSuggestion = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (body: TranslationSuggestionCreateWritable) => createTranslationSuggestion(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: translationSuggestionKeys.all });
    },
  });
};

export const useWithdrawTranslationSuggestion = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (path: TranslationSuggestionWithdrawPath) => withdrawTranslationSuggestion(path),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: translationSuggestionKeys.all });
    },
  });
};

export const useAcceptTranslationSuggestion = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (variables: TranslationSuggestionModerationPath & { gameId: number }) =>
      acceptTranslationSuggestion({ id: variables.id }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: translationSuggestionKeys.all });
      queryClient.invalidateQueries({ queryKey: gameKeys.detail(variables.gameId) });
    },
  });
};

export const useRejectTranslationSuggestion = () => {
  const queryClient = useQueryClient();

  return useAppMutation({
    mutationFn: (variables: TranslationSuggestionModerationPath & TranslationSuggestionRejectBody) =>
      rejectTranslationSuggestion({ id: variables.id }, { rejection_reason: variables.rejection_reason }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: translationSuggestionKeys.all });
    },
  });
};
