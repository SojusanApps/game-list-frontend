/**
 * Starts a promise the caller has nothing to wait for (navigation, cache invalidation). A rejection is
 * swallowed deliberately: these calls report failures through their own UI (error pages, query state).
 */
export function fireAndForget(promise: Promise<unknown>): void {
  promise.catch(() => {});
}
