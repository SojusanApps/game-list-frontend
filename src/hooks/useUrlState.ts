import { useNavigate, useSearch } from "@tanstack/react-router";
import * as React from "react";

import { fireAndForget } from "@/utils/promiseUtils";

type SearchPatch = Record<string, unknown>;
type LooseNavigate = (options: {
  replace?: boolean;
  search: (previous: Record<string, unknown>) => Record<string, unknown>;
}) => Promise<void>;

/**
 * View state (page, filters, sort, tab) lives in the URL so Back/refresh restore it and links can be shared.
 * Reads the current route's validated search params and writes patches to them.
 *
 * Undefined values are removed from the URL. By default a patch also resets `page`, since changing a
 * filter or sort restarts pagination; pass `{ keepPage: true }` when the patch is the page change itself.
 */
export function useUrlState() {
  const search = useSearch({ strict: false }) as SearchPatch;
  const navigate = useNavigate() as unknown as LooseNavigate;

  // Fire-and-forget: callers are event handlers and have nothing to await.
  const update = React.useCallback(
    (patch: SearchPatch, options: { keepPage?: boolean } = {}): void => {
      fireAndForget(
        navigate({
          replace: true,
          search: previous => ({ ...previous, ...(options.keepPage ? {} : { page: undefined }), ...patch }),
        }),
      );
    },
    [navigate],
  );

  return { search, update };
}
