export const gameKeys = {
  all: ["games"] as const,
  lists: () => [...gameKeys.all, "list"] as const,
  list: (query: object | undefined) => [...gameKeys.lists(), query] as const,
  details: () => [...gameKeys.all, "detail"] as const,
  detail: (id: number) => [...gameKeys.details(), id] as const,
  releaseCalendar: (params: object) => [...gameKeys.all, "release-calendar", params] as const,
  genres: ["genres", "all-values"] as const,
  genresInfinite: (name?: string) => ["genres", "infinite", name] as const,
  medias: ["game-medias", "all-values"] as const,
  mediasInfinite: (name?: string) => ["game-medias", "infinite", name] as const,
  platforms: ["platforms", "all-values"] as const,
  platformsInfinite: (name?: string) => ["platforms", "infinite", name] as const,
  enginesInfinite: (name?: string) => ["game-engines", "infinite", name] as const,
  modesInfinite: (name?: string) => ["game-modes", "infinite", name] as const,
  statusesInfinite: (status?: string) => ["game-statuses", "infinite", status] as const,
  typesInfinite: (type?: string) => ["game-types", "infinite", type] as const,
  perspectivesInfinite: (name?: string) => ["player-perspectives", "infinite", name] as const,
  companies: ["companies", "list"] as const,
  companiesInfinite: (name?: string) => ["companies", "infinite", name] as const,
  companyList: (query: object | undefined) => [...gameKeys.companies, query] as const,
  companyDetail: (id: number) => ["companies", "detail", id] as const,
};

export const gameReviewKeys = {
  all: ["game-reviews"] as const,
  lists: () => [...gameReviewKeys.all, "list"] as const,
  list: (query: object | undefined) => [...gameReviewKeys.lists(), query] as const,
  details: () => [...gameReviewKeys.all, "detail"] as const,
  detail: (id: number) => [...gameReviewKeys.details(), id] as const,
};

export const gameListKeys = {
  all: ["game-lists"] as const,
  lists: () => [...gameListKeys.all, "list"] as const,
  list: (query: object | undefined) => [...gameListKeys.lists(), query] as const,
  byFilters: (query: object | undefined) => [...gameListKeys.all, "by-filters", query] as const,
  infinite: (userId: number, status: string | null, filters?: object) =>
    [...gameListKeys.all, "infinite", userId, status, filters] as const,
  randomPtp: (userId: number) => [...gameListKeys.all, "random-ptp", userId] as const,
  export: () => [...gameListKeys.all, "export"] as const,
  compare: (firstUserId: number, secondUserId: number) =>
    [...gameListKeys.all, "compare", firstUserId, secondUserId] as const,
};

export const gameFollowKeys = {
  all: ["game-follows"] as const,
  lists: () => [...gameFollowKeys.all, "list"] as const,
  list: (query: object | undefined) => [...gameFollowKeys.lists(), query] as const,
};

export const userKeys = {
  all: ["users"] as const,
  details: () => [...userKeys.all, "detail"] as const,
  detail: (id: number) => [...userKeys.details(), id] as const,
  me: () => [...userKeys.all, "me"] as const,
};

export const friendshipKeys = {
  all: ["friendships"] as const,
  requests: ["friendship-requests"] as const,
  requestList: (query: object | undefined) => [...friendshipKeys.requests, query] as const,
  list: (query: object | undefined) => [...friendshipKeys.all, query] as const,
  listInfinite: (query: object | undefined) => [...friendshipKeys.all, "infinite", query] as const,
};

export const notificationKeys = {
  all: ["notifications"] as const,
  list: (query: object | undefined) => [...notificationKeys.all, query] as const,
  unreadCount: ["notifications", "unread-count"] as const,
};

export const collectionKeys = {
  all: ["collections"] as const,
  lists: () => [...collectionKeys.all, "list"] as const,
  list: (query: object | undefined) => [...collectionKeys.lists(), query] as const,
  infinite: (userId: number, filters: object, useMember: boolean) =>
    [...collectionKeys.all, "infinite", userId, filters, useMember] as const,
  details: () => [...collectionKeys.all, "detail"] as const,
  detail: (id: number) => [...collectionKeys.details(), id] as const,
  items: (collectionId: number, filters: object) => [...collectionKeys.all, "items", collectionId, filters] as const,
};

export const searchKeys = {
  all: ["search-results"] as const,
  results: (category: string | null, filters: object) => [...searchKeys.all, category, filters] as const,
  paginated: (category: string | null, filters: object, page: number) =>
    [...searchKeys.all, "paginated", category, filters, page] as const,
};

export const versionKeys = {
  apiVersion: ["version", "api"] as const,
};

export const translationSuggestionKeys = {
  all: ["translation-suggestions"] as const,
  lists: () => [...translationSuggestionKeys.all, "list"] as const,
  list: (query: object | undefined) => [...translationSuggestionKeys.lists(), query] as const,
};

export const reportKeys = {
  all: ["reports"] as const,
  lists: () => [...reportKeys.all, "list"] as const,
  list: (query: object | undefined) => [...reportKeys.lists(), query] as const,
};
