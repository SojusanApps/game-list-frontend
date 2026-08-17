import { UserService, UserUsersListData } from "@/client";
import StatusCode from "@/utils/StatusCode";
import { handleApiError } from "@/utils/apiUtils";

export type UserUsersListDataQuery = UserUsersListData["query"];

export const getUserLists = async (query?: UserUsersListDataQuery) => {
  const { data, response } = await UserService.userUsersList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(response, "Error fetching users");
  }
  return data;
};

export const getUserDetails = async (id: number) => {
  const { data, response } = await UserService.userUsersRetrieve({ path: { id } });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(response, "Error fetching user details");
  }
  return data;
};

export const getCurrentUser = async () => {
  const { data, response } = await UserService.userUsersMeRetrieve();
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(response, "Error fetching current user");
  }
  return data;
};
