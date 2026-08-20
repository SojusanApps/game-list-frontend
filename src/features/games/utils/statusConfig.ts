import type React from "react";

import { GameListStatusEnum } from "@/client";
import i18n from "@/lib/i18n";

export interface StatusConfig {
  label: string;
  emoji: string;
  badgeStyle: React.CSSProperties;
}

const BADGE_STYLES: Record<GameListStatusEnum, React.CSSProperties> = {
  [GameListStatusEnum.P]: {
    background: "var(--color-status-playing-bg)",
    color: "var(--color-status-playing-text)",
    borderColor: "var(--color-status-playing-border)",
  },
  [GameListStatusEnum.C]: {
    background: "var(--color-status-completed-bg)",
    color: "var(--color-status-completed-text)",
    borderColor: "var(--color-status-completed-border)",
  },
  [GameListStatusEnum.PTP]: {
    background: "var(--color-status-plantoplay-bg)",
    color: "var(--color-status-plantoplay-text)",
    borderColor: "var(--color-status-plantoplay-border)",
  },
  [GameListStatusEnum.OH]: {
    background: "var(--color-status-onhold-bg)",
    color: "var(--color-status-onhold-text)",
    borderColor: "var(--color-status-onhold-border)",
  },
  [GameListStatusEnum.D]: {
    background: "var(--color-status-dropped-bg)",
    color: "var(--color-status-dropped-text)",
    borderColor: "var(--color-status-dropped-border)",
  },
};

const STATUS_EMOJIS: Record<GameListStatusEnum, string> = {
  [GameListStatusEnum.P]: "🎮",
  [GameListStatusEnum.C]: "🏆",
  [GameListStatusEnum.PTP]: "🗓️",
  [GameListStatusEnum.OH]: "⏸️",
  [GameListStatusEnum.D]: "🗑️",
};

const STATUS_TRANSLATION_KEYS: Record<GameListStatusEnum, string> = {
  [GameListStatusEnum.P]: "games:status.playing",
  [GameListStatusEnum.C]: "games:status.completed",
  [GameListStatusEnum.PTP]: "games:status.planToPlay",
  [GameListStatusEnum.OH]: "games:status.onHold",
  [GameListStatusEnum.D]: "games:status.dropped",
};

/** Returns a fresh StatusConfig reading the current i18n language at call time. */
export const getStatusConfig = (status: GameListStatusEnum | string | undefined): StatusConfig | undefined => {
  if (!status || !(status in STATUS_TRANSLATION_KEYS)) {
    return undefined;
  }
  const key = status as GameListStatusEnum;
  return {
    label: i18n.t(STATUS_TRANSLATION_KEYS[key] as any),
    emoji: STATUS_EMOJIS[key],
    badgeStyle: BADGE_STYLES[key],
  };
};

/** Convenience record for places that iterate all statuses — reads translations fresh each access. */
export const STATUS_CONFIG: Record<GameListStatusEnum, StatusConfig> = new Proxy(
  {} as Record<GameListStatusEnum, StatusConfig>,
  {
    get(_target, prop: string) {
      return getStatusConfig(prop);
    },
  },
);
