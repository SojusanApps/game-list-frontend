import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { RankingProfile } from "../types";

interface RankingState {
  profiles: Record<number, RankingProfile>;
  saveProfile: (collectionId: number, profile: RankingProfile) => void;
  loadProfile: (collectionId: number) => RankingProfile | null;
  deleteProfile: (collectionId: number) => void;
}

export const useRankingStore = create<RankingState>()(
  persist(
    (set, get) => ({
      profiles: {},
      saveProfile: (collectionId, profile) =>
        set(state => ({ profiles: { ...state.profiles, [collectionId]: profile } })),
      loadProfile: collectionId => get().profiles[collectionId] ?? null,
      deleteProfile: collectionId =>
        set(state => ({
          profiles: Object.fromEntries(Object.entries(state.profiles).filter(([key]) => Number(key) !== collectionId)),
        })),
    }),
    {
      name: "ranking-profiles",
    },
  ),
);
