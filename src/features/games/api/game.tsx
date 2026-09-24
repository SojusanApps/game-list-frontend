import {
  GameService,
  GameGamesListData,
  GameCompaniesListData,
  GameGameListsListData,
  GameGameReviewsListData,
  GameGameListsCreateData,
  GameGameListsPartialUpdateData,
  GamePlatformsListData,
  GameGenresListData,
  GameGameMediasListData,
  GameGameEnginesListData,
  GameGameModesListData,
  GameGameStatusesListData,
  GameGameTypesListData,
  GamePlayerPerspectivesListData,
  GameGamesReleaseCalendarListData,
  GameGameFollowsListData,
  GameGameFollowsCreateData,
  GameListCreateWritable,
  GameGameReviewsCreateData,
  GameGameReviewsPartialUpdateData,
} from "@/client";
import { handleApiError } from "@/utils/apiUtils";
import StatusCode from "@/utils/StatusCode";

export type GameCompaniesListDataQuery = GameCompaniesListData["query"];
export type GameGamesListDataQuery = GameGamesListData["query"];
export type GameGameListsListDataQuery = GameGameListsListData["query"];
export type GameGameReviewsListDataQuery = GameGameReviewsListData["query"];
export type GameGameFollowsListDataQuery = GameGameFollowsListData["query"];
export type GamePlatformsListDataQuery = GamePlatformsListData["query"];
export type GameGenresListDataQuery = GameGenresListData["query"];
export type GameGameEnginesListDataQuery = GameGameEnginesListData["query"];
export type GameGameModesListDataQuery = GameGameModesListData["query"];
export type GameGameStatusesListDataQuery = GameGameStatusesListData["query"];
export type GameGameTypesListDataQuery = GameGameTypesListData["query"];
export type GamePlayerPerspectivesListDataQuery = GamePlayerPerspectivesListData["query"];
export type GameGamesReleaseCalendarListDataQuery = GameGamesReleaseCalendarListData["query"];

export const getGenresList = async (query?: GameGenresListDataQuery) => {
  const { data, error, response } = await GameService.gameGenresList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getGameEnginesList = async (query?: GameGameEnginesListDataQuery) => {
  const { data, error, response } = await GameService.gameGameEnginesList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getGameModesList = async (query?: GameGameModesListDataQuery) => {
  const { data, error, response } = await GameService.gameGameModesList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getGameStatusesList = async (query?: GameGameStatusesListDataQuery) => {
  const { data, error, response } = await GameService.gameGameStatusesList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getGameTypesList = async (query?: GameGameTypesListDataQuery) => {
  const { data, error, response } = await GameService.gameGameTypesList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getPlayerPerspectivesList = async (query?: GamePlayerPerspectivesListDataQuery) => {
  const { data, error, response } = await GameService.gamePlayerPerspectivesList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getPlatformsList = async (query?: GamePlatformsListDataQuery) => {
  const { data, error, response } = await GameService.gamePlatformsList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getCompaniesList = async (query?: GameCompaniesListDataQuery) => {
  const { data, error, response } = await GameService.gameCompaniesList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getCompanyDetail = async (id: number) => {
  const { data, error, response } = await GameService.gameCompaniesRetrieve({ path: { id } });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getGamesList = async (query?: GameGamesListDataQuery) => {
  const { data, error, response } = await GameService.gameGamesList({
    query,
    querySerializer: { array: { explode: true, style: "form" } },
  });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getGamesDetail = async (id: number) => {
  const { data, error, response } = await GameService.gameGamesRetrieve({ path: { id } });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getReleaseCalendar = async (query: GameGamesReleaseCalendarListDataQuery) => {
  const { data, error, response } = await GameService.gameGamesReleaseCalendarList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getGameListsList = async (query?: GameGameListsListDataQuery) => {
  const { data, error, response } = await GameService.gameGameListsList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getGameListByFilters = async (query?: GameGameListsListDataQuery) => {
  const data = await getGameListsList(query);
  if (data.count > 1) {
    throw new Error("Multiple game list entries found for these filters");
  }
  return data.count === 0 ? null : data.results[0];
};

export const deleteGameList = async (id: number) => {
  const { error, response } = await GameService.gameGameListsDestroy({ path: { id } });
  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(error, response);
  }
};

export type GameListCreateDataBody = GameGameListsCreateData["body"];
export const createGameList = async (body: GameListCreateDataBody) => {
  const { data, error, response } = await GameService.gameGameListsCreate({ body });
  if (response?.status !== StatusCode.CREATED || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export type GameListPartialUpdateDataBody = GameGameListsPartialUpdateData["body"];
export const partialUpdateGameList = async (id: number, body: GameListPartialUpdateDataBody) => {
  const { data, error, response } = await GameService.gameGameListsPartialUpdate({ path: { id }, body });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const exportGameList = async () => {
  const { data, error, response } = await GameService.gameGameListsExportList();
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getGameListCompare = async (firstUserId: number, secondUserId: number) => {
  const { data, error, response } = await GameService.gameGameListsCompareRetrieve({
    path: { first_user_id: String(firstUserId), second_user_id: String(secondUserId) },
  });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getRandomPtpGame = async () => {
  const { data, error, response } = await GameService.gameGameListsRandomPtpRetrieve();
  if (response?.status === StatusCode.NOT_FOUND) {
    return null;
  }
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getGameReviewsList = async (query?: GameGameReviewsListDataQuery) => {
  const { data, error, response } = await GameService.gameGameReviewsList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getGameReviewsDetail = async (id: number) => {
  const { data, error, response } = await GameService.gameGameReviewsRetrieve({ path: { id } });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export type GameReviewCreateDataBody = GameGameReviewsCreateData["body"];
export const createGameReview = async (body: GameReviewCreateDataBody) => {
  const { data, error, response } = await GameService.gameGameReviewsCreate({ body });
  if (response?.status !== StatusCode.CREATED || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export type GameReviewPartialUpdateDataBody = GameGameReviewsPartialUpdateData["body"];
export const updateGameReview = async (id: number, body: GameReviewPartialUpdateDataBody) => {
  const { data, error, response } = await GameService.gameGameReviewsPartialUpdate({ path: { id }, body });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const deleteGameReview = async (id: number) => {
  const { error, response } = await GameService.gameGameReviewsDestroy({ path: { id } });
  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(error, response);
  }
};

export type GameGameMediasListDataQuery = GameGameMediasListData["query"];
export const getGameMediaList = async (query?: GameGameMediasListDataQuery) => {
  const { data, error, response } = await GameService.gameGameMediasList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getGameFollowsList = async (query?: GameGameFollowsListDataQuery) => {
  const { data, error, response } = await GameService.gameGameFollowsList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export type GameFollowCreateDataBody = GameGameFollowsCreateData["body"];
export const createGameFollow = async (body: GameFollowCreateDataBody) => {
  const { data, error, response } = await GameService.gameGameFollowsCreate({ body });
  if (response?.status !== StatusCode.CREATED || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const deleteGameFollow = async (id: number) => {
  const { error, response } = await GameService.gameGameFollowsDestroy({ path: { id } });
  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(error, response);
  }
  return true;
};

export const steamImportGameList = async (steamProfileId: string) => {
  const { data, error, response } = await GameService.gameGameListsSteamImportRetrieve({
    query: { steam_profile_id: steamProfileId },
  });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const titleImportGameList = async (titles: Array<string>) => {
  const { data, error, response } = await GameService.gameGameListsTitleImportCreate({ body: { titles } });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const bulkCreateGameList = async (body: Array<GameListCreateWritable>) => {
  const { data, error, response } = await GameService.gameGameListsBulkCreateCreate({ body });
  if (response?.status !== StatusCode.OK && response?.status !== StatusCode.CREATED) {
    return await handleApiError(error, response);
  }
  return data;
};
