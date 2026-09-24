import { UserService, UserUsersBanCreateData, UserUsersListData } from "@/client";
import { handleApiError } from "@/utils/apiUtils";
import StatusCode from "@/utils/StatusCode";

export type UserUsersListDataQuery = UserUsersListData["query"];
export interface BanUserBody {
  reason: string;
}

export const getUserLists = async (query?: UserUsersListDataQuery) => {
  const { data, error, response } = await UserService.userUsersList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getUserDetails = async (id: number) => {
  const { data, error, response } = await UserService.userUsersRetrieve({ path: { id } });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const getCurrentUser = async () => {
  const { data, error, response } = await UserService.userUsersMeRetrieve();
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};

export const banUser = async (id: number, body: BanUserBody) => {
  const { data, error, response } = await UserService.userUsersBanCreate({
    path: { id },
    body: body as UserUsersBanCreateData["body"],
  });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response);
  }
  return data;
};
