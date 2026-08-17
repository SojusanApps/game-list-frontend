import { useCallback, useMemo } from "react";

import { useRankingStore } from "../store/rankingStore";
import type { RankingProfile } from "../types";

/**
 * Hook providing read/write access to a pairwise ranking profile for a collection.
 * Uses the Zustand ranking store under the hood via an adapter that can be swapped later.
 */
export function useRankingStorage(collectionId: number) {
  const loadProfile = useCallback((): RankingProfile | null => {
    return useRankingStore.getState().loadProfile(collectionId);
  }, [collectionId]);

  const saveProfile = useCallback(
    (profile: RankingProfile): void => {
      useRankingStore.getState().saveProfile(collectionId, { ...profile, updatedAt: new Date().toISOString() });
    },
    [collectionId],
  );

  const deleteProfile = useCallback((): void => {
    useRankingStore.getState().deleteProfile(collectionId);
  }, [collectionId]);

  const hasExistingProfile = useMemo((): boolean => {
    return useRankingStore.getState().loadProfile(collectionId) !== null;
  }, [collectionId]);

  return { loadProfile, saveProfile, deleteProfile, hasExistingProfile };
}
