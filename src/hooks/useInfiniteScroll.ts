import { useIntersection } from "@mantine/hooks";
import { useEffect } from "react";

interface UseInfiniteScrollOptions {
  hasNextPage?: boolean;
  isFetchingNextPage?: boolean;
  isLoading?: boolean;
  threshold?: number;
  rootMargin?: string;
}

/**
 * Custom hook to abstract the logic for triggering the fetch of the next page
 * in an infinite scroll scenario.
 */
export function useInfiniteScroll(fetchNextPage: () => void, options: UseInfiniteScrollOptions = {}) {
  const { hasNextPage, isFetchingNextPage, isLoading, threshold = 0, rootMargin } = options;

  const { ref, entry } = useIntersection({
    threshold,
    rootMargin,
  });

  const inView = !!entry?.isIntersecting;

  useEffect(() => {
    if (inView && hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  }, [inView, hasNextPage, isFetchingNextPage, isLoading, fetchNextPage]);

  // Support for manual trigger based on virtual item index
  const checkTrigger = (currentIndex: number, totalCount: number) => {
    if (currentIndex >= totalCount - 5 && hasNextPage && !isFetchingNextPage && !isLoading) {
      fetchNextPage();
    }
  };

  return { ref, inView, checkTrigger };
}
