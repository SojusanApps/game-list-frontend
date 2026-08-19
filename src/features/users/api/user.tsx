import { UserService, UserUsersListData } from "@/client";
import { handleApiError } from "@/utils/apiUtils";
import StatusCode from "@/utils/StatusCode";

export type UserUsersListDataQuery = UserUsersListData["query"];

export const getUserLists = async (query?: UserUsersListDataQuery) => {
  const { data, error, response } = await UserService.userUsersList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response, "Error fetching users");
  }
  return data;
};

export const getUserDetails = async (id: number) => {
  const { data, error, response } = await UserService.userUsersRetrieve({ path: { id } });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response, "Error fetching user details");
  }
  return data;
};

export const getCurrentUser = async () => {
  const { data, error, response } = await UserService.userUsersMeRetrieve();
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(error, response, "Error fetching current user");
  }
  return data;
};
