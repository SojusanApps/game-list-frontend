import {
  CollectionService,
  CollectionCollectionsListData,
  CollectionCollectionsCreateData,
  CollectionCollectionsPartialUpdateData,
  CollectionCollectionItemsListData,
  CollectionCollectionItemsCreateData,
  CollectionCollectionItemsPartialUpdateData,
  CollectionItemPosition,
  CollectionItemTierUpdate,
  TierEnum,
  BlankEnum,
} from "@/client";
import { handleApiError } from "@/utils/apiUtils";
import StatusCode from "@/utils/StatusCode";

export type CollectionCollectionsListDataQuery = CollectionCollectionsListData["query"];

export const getCollectionsList = async (query?: CollectionCollectionsListDataQuery) => {
  const { data, response } = await CollectionService.collectionCollectionsList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(response, "Error fetching collections");
  }
  return data;
};

export const getCollectionDetail = async (id: number) => {
  const { data, response } = await CollectionService.collectionCollectionsRetrieve({ path: { id } });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(response, "Error fetching collection details");
  }
  return data;
};

export type CollectionCollectionsCreateDataBody = CollectionCollectionsCreateData["body"];

export const createCollection = async (body: CollectionCollectionsCreateDataBody) => {
  const { data, response } = await CollectionService.collectionCollectionsCreate({ body });
  if (response?.status !== StatusCode.CREATED || !data) {
    return await handleApiError(response, "Error creating collection");
  }
  return data;
};

export type CollectionCollectionsPartialUpdateDataBody = CollectionCollectionsPartialUpdateData["body"];

export const updateCollection = async (id: number, body: CollectionCollectionsPartialUpdateDataBody) => {
  const { data, response } = await CollectionService.collectionCollectionsPartialUpdate({ path: { id }, body });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(response, "Error updating collection");
  }
  return data;
};

export const deleteCollection = async (id: number) => {
  const { response } = await CollectionService.collectionCollectionsDestroy({ path: { id } });
  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(response, "Error deleting collection");
  }
};

export type CollectionCollectionItemsListDataQuery = CollectionCollectionItemsListData["query"];

export const getCollectionItems = async (query?: CollectionCollectionItemsListDataQuery) => {
  const { data, response } = await CollectionService.collectionCollectionItemsList({ query });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(response, "Error fetching collection items");
  }
  return data;
};

export type CollectionCollectionItemsCreateDataBody = CollectionCollectionItemsCreateData["body"];

export const addCollectionItem = async (body: CollectionCollectionItemsCreateDataBody) => {
  const { data, response } = await CollectionService.collectionCollectionItemsCreate({ body });
  if (response?.status !== StatusCode.CREATED || !data) {
    return await handleApiError(response, "Error adding item to collection");
  }
  return data;
};

export const removeCollectionItem = async (id: number) => {
  const { response } = await CollectionService.collectionCollectionItemsDestroy({ path: { id } });
  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(response, "Error removing item from collection");
  }
};

export type CollectionCollectionItemsPartialUpdateDataBody = CollectionCollectionItemsPartialUpdateData["body"];

export const updateCollectionItem = async (id: number, body: CollectionCollectionItemsPartialUpdateDataBody) => {
  const { data, response } = await CollectionService.collectionCollectionItemsPartialUpdate({ path: { id }, body });
  if (response?.status !== StatusCode.OK || !data) {
    return await handleApiError(response, "Error updating collection item");
  }
  return data;
};

export const bulkReorderCollectionItems = async (collectionId: number, items: CollectionItemPosition[]) => {
  const { data, response } = await CollectionService.collectionCollectionsBulkReorderCreate({
    path: { id: collectionId },
    body: { items },
  });

  if (response?.status !== StatusCode.NO_CONTENT) {
    return await handleApiError(response, "Error bulk-reordering collection items");
  }

  return data;
};

export const reorderCollectionItem = async (collectionId: number, itemId: number, position: number) => {
  const { data, response } = await CollectionService.collectionCollectionsItemsReorderCreate({
    path: { id: collectionId, item_id: String(itemId) },
    body: { position },
  });

  if (response?.status !== StatusCode.OK) {
    return await handleApiError(response, "Error reordering collection item");
  }

  return data;
};

export const updateCollectionItemTier = async (
  collectionId: number,
  itemId: number,
  tier: TierEnum | BlankEnum,
  position?: number,
) => {
  const body: CollectionItemTierUpdate = { tier };
  if (position !== undefined) {
    body.position = position;
  }

  const { data, response } = await CollectionService.collectionCollectionsItemsUpdateTierCreate({
    path: { id: collectionId, item_id: String(itemId) },
    body: body,
  });

  if (response?.status !== StatusCode.OK) {
    return await handleApiError(response, "Error updating collection item tier");
  }

  return data;
};
