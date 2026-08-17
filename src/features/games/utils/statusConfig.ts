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
    background: "var(--color-success-200)",
    color: "var(--color-success-900)",
    borderColor: "var(--color-success-300)",
  },
  [GameListStatusEnum.C]: {
    background: "var(--color-primary-200)",
    color: "var(--color-primary-900)",
    borderColor: "var(--color-primary-300)",
  },
  [GameListStatusEnum.PTP]: {
    background: "var(--color-background-400)",
    color: "var(--color-text-900)",
    borderColor: "var(--color-background-500)",
  },
  [GameListStatusEnum.OH]: {
    background: "var(--color-secondary-200)",
    color: "var(--color-secondary-900)",
    borderColor: "var(--color-secondary-300)",
  },
  [GameListStatusEnum.D]: {
    background: "var(--color-error-200)",
    color: "var(--color-error-900)",
    borderColor: "var(--color-error-300)",
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
