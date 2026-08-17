import { useState, useCallback, useMemo } from "react";

import type { CollectionItem } from "@/client";

import type {
  RankedItem,
  CurrentDuel,
  DuelChoice,
  DuelResult,
  RankingProfile,
  RankingSessionState,
  RankingProgress,
} from "../types";
import { DEFAULT_RATING, updateEloRatings } from "../utils/eloRating";
import { sortByRating } from "../utils/rankingSort";
import { buildRoundPairings, getTotalRounds, getTotalDuels, getByeItemId, pairKey } from "../utils/swissTournament";
import { useRankingStorage } from "./useRankingStorage";

// ---------------------------------------------------------------------------
// Internal session data (not persisted separately — serialized into profile)
// ---------------------------------------------------------------------------

interface SessionData {
  rankedItems: RankedItem[];
  duelHistory: DuelResult[];
  currentRound: number;
  totalRounds: number;
  roundPairings: Array<[number, number]>;
  currentPairIndex: number;
  seenPairs: string[];
  byeHistory: number[];
}

// ---------------------------------------------------------------------------
// Pure helpers
// ---------------------------------------------------------------------------

function buildRankedItems(collectionItems: CollectionItem[]): RankedItem[] {
  return collectionItems.map(ci => ({
    itemId: ci.id,
    gameId: ci.game.id,
    title: ci.game.title,
    coverImageId: ci.game.cover_image_id ?? undefined,
    rating: DEFAULT_RATING,
    matchesPlayed: 0,
    wins: 0,
    losses: 0,
    draws: 0,
  }));
}

function reconcileItems(stored: RankedItem[], current: CollectionItem[]): RankedItem[] {
  const storedMap = new Map(stored.map(si => [si.itemId, si]));
  return current.map(ci => {
    const existing = storedMap.get(ci.id);
    if (existing) {
      return { ...existing, title: ci.game.title, coverImageId: ci.game.cover_image_id ?? undefined };
    }
    return {
      itemId: ci.id,
      gameId: ci.game.id,
      title: ci.game.title,
      coverImageId: ci.game.cover_image_id ?? undefined,
      rating: DEFAULT_RATING,
      matchesPlayed: 0,
      wins: 0,
      losses: 0,
      draws: 0,
    };
  });
}

/** Build a fresh next-round session snapshot. */
function buildNextRound(s: SessionData): SessionData {
  const nextRound = s.currentRound + 1;
  const seenSet = new Set(s.seenPairs);
  const newPairings = buildRoundPairings(s.rankedItems, seenSet, s.byeHistory);
  const byeId = getByeItemId(s.rankedItems, newPairings);
  return {
    ...s,
    currentRound: nextRound,
    roundPairings: newPairings,
    currentPairIndex: 0,
    seenPairs: [...s.seenPairs, ...newPairings.map(([a, b]) => pairKey(a, b))],
    byeHistory: byeId === null ? s.byeHistory : [...s.byeHistory, byeId],
  };
}

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/**
 * Core hook orchestrating the Swiss-Tournament pairwise ranking session.
 *
 * Session structure:
 * - totalRounds = ceil(log₂(n)),  totalDuels = floor(n/2) * totalRounds
 * - Each round pairs items by current Elo standing (top vs. 2nd, etc.)
 * - After all rounds complete the session automatically transitions to "results"
 * - "Continue Dueling" starts a bonus round using the same Swiss pairing logic
 */
export function useRankingSession(collectionId: number, collectionItems: CollectionItem[]) {
  const { loadProfile, saveProfile, deleteProfile, hasExistingProfile } = useRankingStorage(collectionId);

  const [state, setState] = useState<RankingSessionState>("idle");
  const [session, setSession] = useState<SessionData | null>(null);

  // ----- persistence -----

  const persist = useCallback(
    (s: SessionData) => {
      const profile: RankingProfile = {
        collectionId,
        items: s.rankedItems,
        duelHistory: s.duelHistory,
        currentRound: s.currentRound,
        totalRounds: s.totalRounds,
        roundPairings: s.roundPairings,
        currentPairIndex: s.currentPairIndex,
        seenPairs: s.seenPairs,
        byeHistory: s.byeHistory,
        createdAt: loadProfile()?.createdAt ?? new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      saveProfile(profile);
    },
    [collectionId, loadProfile, saveProfile],
  );

  // ----- round advancement -----

  /**
   * Move the session to the next state after a duel (or skip) completes.
   * Called with an already-updated session snapshot.
   */
  const advance = useCallback(
    (s: SessionData) => {
      const nextIdx = s.currentPairIndex + 1;

      if (nextIdx < s.roundPairings.length) {
        // More duels remain in this round
        const next = { ...s, currentPairIndex: nextIdx };
        setSession(next);
        persist(next);
      } else if (s.currentRound < s.totalRounds) {
        // Round finished → build next round
        const next = buildNextRound({ ...s, currentPairIndex: nextIdx });
        setSession(next);
        persist(next);
      } else {
        // All rounds done → move to results
        const next = { ...s, currentPairIndex: nextIdx };
        setSession(next);
        persist(next);
        setState("results");
      }
    },
    [persist],
  );

  // ----- actions -----

  /** Start a fresh ranking session, discarding any stored data. */
  const startNew = useCallback(() => {
    const items = buildRankedItems(collectionItems);
    const n = items.length;
    const totalRounds = getTotalRounds(n);
    const roundPairings = buildRoundPairings(items, new Set(), []);
    const byeId = getByeItemId(items, roundPairings);

    const s: SessionData = {
      rankedItems: items,
      duelHistory: [],
      currentRound: 1,
      totalRounds,
      roundPairings,
      currentPairIndex: 0,
      seenPairs: roundPairings.map(([a, b]) => pairKey(a, b)),
      byeHistory: byeId === null ? [] : [byeId],
    };

    setSession(s);
    persist(s);
    setState("dueling");
  }, [collectionItems, persist]);

  /** Resume an existing ranking session from storage. */
  const resume = useCallback(() => {
    const profile = loadProfile();
    if (!profile) {
      startNew();
      return;
    }

    const items = reconcileItems(profile.items, collectionItems);
    const s: SessionData = {
      rankedItems: items,
      duelHistory: profile.duelHistory,
      currentRound: profile.currentRound ?? 1,
      totalRounds: profile.totalRounds ?? getTotalRounds(items.length),
      roundPairings: profile.roundPairings ?? [],
      currentPairIndex: profile.currentPairIndex ?? 0,
      seenPairs: profile.seenPairs ?? [],
      byeHistory: profile.byeHistory ?? [],
    };

    setSession(s);
    persist(s);
    setState("dueling");
  }, [loadProfile, collectionItems, startNew, persist]);

  /** Submit the user's choice for the current duel and advance. */
  const submitChoice = useCallback(
    (choice: DuelChoice) => {
      if (!session) {
        return;
      }

      const pairing = session.roundPairings[session.currentPairIndex];
      if (!pairing) {
        return;
      }

      const itemMap = new Map(session.rankedItems.map(i => [i.itemId, i]));
      const itemA = itemMap.get(pairing[0]);
      const itemB = itemMap.get(pairing[1]);
      if (!itemA || !itemB) {
        return;
      }

      const { newRatingA, newRatingB } = updateEloRatings(itemA.rating, itemB.rating, choice);

      const updatedItems = session.rankedItems.map(item => {
        if (item.itemId === itemA.itemId) {
          return {
            ...item,
            rating: newRatingA,
            matchesPlayed: item.matchesPlayed + 1,
            wins: item.wins + (choice === "A" ? 1 : 0),
            losses: item.losses + (choice === "B" ? 1 : 0),
            draws: item.draws + (choice === "tie" ? 1 : 0),
          };
        }
        if (item.itemId === itemB.itemId) {
          return {
            ...item,
            rating: newRatingB,
            matchesPlayed: item.matchesPlayed + 1,
            wins: item.wins + (choice === "B" ? 1 : 0),
            losses: item.losses + (choice === "A" ? 1 : 0),
            draws: item.draws + (choice === "tie" ? 1 : 0),
          };
        }
        return item;
      });

      const duelResult: DuelResult = {
        itemAId: itemA.itemId,
        itemBId: itemB.itemId,
        choice,
        timestamp: Date.now(),
      };

      advance({
        ...session,
        rankedItems: updatedItems,
        duelHistory: [...session.duelHistory, duelResult],
      });
    },
    [session, advance],
  );

  /** Skip the current duel without recording a result. */
  const skipDuel = useCallback(() => {
    if (!session) {
      return;
    }
    advance(session);
  }, [session, advance]);

  /** Switch to results view. */
  const viewResults = useCallback(() => {
    setState("results");
  }, []);

  /**
   * Continue dueling after reaching results — starts a bonus round.
   * Total rounds is extended by 1; Swiss pairing used as normal.
   */
  const continueDueling = useCallback(() => {
    if (!session) {
      return;
    }
    const extended: SessionData = {
      ...session,
      totalRounds: session.currentRound + 1, // bonus round becomes the new target
    };
    const next = buildNextRound(extended);
    setSession(next);
    persist(next);
    setState("dueling");
  }, [session, persist]);

  /** Reset everything — delete stored profile and return to idle. */
  const reset = useCallback(() => {
    deleteProfile();
    setSession(null);
    setState("idle");
  }, [deleteProfile]);

  // ----- derived data -----

  const currentDuel = useMemo<CurrentDuel | null>(() => {
    if (state !== "dueling" || !session) {
      return null;
    }
    const pairing = session.roundPairings[session.currentPairIndex];
    if (!pairing) {
      return null;
    }
    const itemMap = new Map(session.rankedItems.map(i => [i.itemId, i]));
    const itemA = itemMap.get(pairing[0]);
    const itemB = itemMap.get(pairing[1]);
    if (!itemA || !itemB) {
      return null;
    }
    return { itemA, itemB };
  }, [state, session]);

  const sortedItems = useMemo(() => sortByRating(session?.rankedItems ?? []), [session?.rankedItems]);

  const progress = useMemo<RankingProgress>(() => {
    if (!session) {
      return {
        duelsCompleted: 0,
        totalDuels: 0,
        completionPercent: 0,
        currentRound: 0,
        totalRounds: 0,
        duelInRound: 0,
        duelsInRound: 0,
      };
    }
    const duelsCompleted = session.duelHistory.length;
    const totalDuels = getTotalDuels(session.rankedItems.length);
    const completionPercent = totalDuels > 0 ? Math.min(100, Math.round((duelsCompleted / totalDuels) * 100)) : 0;
    return {
      duelsCompleted,
      totalDuels,
      completionPercent,
      currentRound: session.currentRound,
      totalRounds: session.totalRounds,
      duelInRound: session.currentPairIndex,
      duelsInRound: session.roundPairings.length,
    };
  }, [session]);

  return {
    state,
    currentDuel,
    rankedItems: sortedItems,
    progress,
    hasExistingProfile,
    startNew,
    resume,
    submitChoice,
    skipDuel,
    viewResults,
    continueDueling,
    reset,
  };
}
