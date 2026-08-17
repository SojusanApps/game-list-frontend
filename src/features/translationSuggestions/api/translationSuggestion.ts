import {
  GameService,
  GameTranslationSuggestionsListData,
  GameTranslationSuggestionsRejectCreateData,
  GameTranslationSuggestionsWithdrawCreateData,
  TranslationSuggestionCreateWritable,
} from "@/client";
import { handleApiError } from "@/utils/apiUtils";
import StatusCode from "@/utils/StatusCode";

export type TranslationSuggestionListQuery = GameTranslationSuggestionsListData["query"];
export type TranslationSuggestionWithdrawPath = GameTranslationSuggestionsWithdrawCreateData["path"];
export type TranslationSuggestionModerationPath = GameTranslationSuggestionsRejectCreateData["path"];
export interface TranslationSuggestionRejectBody {
  rejection_reason?: string;
}

export const getTranslationSuggestions = async (query?: TranslationSuggestionListQuery) => {
  const { data, response } = await GameService.gameTranslationSuggestionsList({ query });
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(response, "Error fetching translation suggestions");
  }
  return data;
};

export const createTranslationSuggestion = async (body: TranslationSuggestionCreateWritable) => {
  const { data, response } = await GameService.gameTranslationSuggestionsCreate({ body });
  if (response?.status !== StatusCode.CREATED) {
    return await handleApiError(response, "Error creating translation suggestion");
  }
  return data;
};

export const withdrawTranslationSuggestion = async (path: TranslationSuggestionWithdrawPath) => {
  const { data, response } = await GameService.gameTranslationSuggestionsWithdrawCreate({ path });
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(response, "Error withdrawing translation suggestion");
  }
  return data;
};

export const acceptTranslationSuggestion = async (path: TranslationSuggestionModerationPath) => {
  const { data, response } = await GameService.gameTranslationSuggestionsAcceptCreate({ path });
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(response, "Error accepting translation suggestion");
  }
  return data;
};

export const rejectTranslationSuggestion = async (
  path: TranslationSuggestionModerationPath,
  body?: TranslationSuggestionRejectBody,
) => {
  const { data, response } = await GameService.gameTranslationSuggestionsRejectCreate({
    path,
    body: body as GameTranslationSuggestionsRejectCreateData["body"],
  });
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(response, "Error rejecting translation suggestion");
  }
  return data;
};
