import { VersionService } from "@/client";
import { handleApiError } from "@/utils/apiUtils";
import StatusCode from "@/utils/StatusCode";

export const getApiVersion = async () => {
  const { data, error, response } = await VersionService.versionRetrieve();
  if (response?.status !== StatusCode.OK) {
    return await handleApiError(error, response, "Error fetching API version");
  }
  return data;
};
