import {
  GameService,
  GameStoreMappingsAcceptCreateData,
  GameStoreMappingsListData,
  GameStoreMappingsRejectCreateData,
  StoreMappingCreate,
} from "@/client";
import { handleApiError } from "@/utils/apiUtils";
import StatusCode from "@/utils/StatusCode";

export type StoreMappingListQuery = GameStoreMappingsListData["query"];
export type StoreMappingModerationPath = GameStoreMappingsAcceptCreateData["path"];
export type StoreMappingCreateBody = Pick<
  StoreMappingCreate,
  "platform" | "store_id" | "store_title" | "game" | "not_a_game"
>;
export interface StoreMappingRejectBody {
  rejection_reason?: string;
}

export const getStoreMappings = async (query?: StoreMappingListQuery) => {
  const { data, error, response } = await GameService.gameStoreMappingsList({ query });
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(error, response);
  }
  return data;
};

export const createStoreMapping = async (body: StoreMappingCreateBody) => {
  const { data, error, response } = await GameService.gameStoreMappingsCreate({ body });
  if (response?.status !== StatusCode.CREATED) {
    return await handleApiError(error, response);
  }
  return data;
};

export const acceptStoreMapping = async (path: StoreMappingModerationPath) => {
  const { data, error, response } = await GameService.gameStoreMappingsAcceptCreate({ path });
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(error, response);
  }
  return data;
};

export const rejectStoreMapping = async (path: StoreMappingModerationPath, body?: StoreMappingRejectBody) => {
  const { data, error, response } = await GameService.gameStoreMappingsRejectCreate({
    path,
    body: body as GameStoreMappingsRejectCreateData["body"],
  });
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(error, response);
  }
  return data;
};
