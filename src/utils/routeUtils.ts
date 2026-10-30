import { notFound } from "@tanstack/react-router";

import { ApiError } from "./apiUtils";

/**
 * For route loaders: turns only a 404 from the API into the router's not-found page. Anything else
 * (timeout, 5xx, offline) is rethrown so the route's error component can offer a retry instead of
 * claiming the page doesn't exist.
 */
export function rethrowAsNotFound(error: unknown): never {
  if (error instanceof ApiError && error.status === 404) {
    throw notFound();
  }
  throw error;
}
