import {
  IconCalendarClock,
  IconCircleX,
  IconDeviceGamepad2,
  IconPlayerPause,
  IconTrophy,
  type TablerIcon,
} from "@tabler/icons-react";
import type React from "react";

import { GameListStatusEnum } from "@/client";
import i18n from "@/lib/i18n";

export interface StatusConfig {
  label: string;
  icon: TablerIcon;
  badgeStyle: React.CSSProperties;
  /** Saturated hue + matching glow for a "neon sign" rendering of the icon. */
  neonStyle: React.CSSProperties;
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

/**
 * Doubling the glow token stacks it to roughly 0.65 alpha — a visible halo on
 * the dark theme, a soft tint on the light one. Hues mirror BADGE_STYLES:
 * playing→success, completed→primary, on-hold→secondary, dropped→error,
 * plan-to-play→achromatic (a "white neon" tube).
 */
const NEON_STYLES: Record<GameListStatusEnum, React.CSSProperties> = {
  [GameListStatusEnum.P]: {
    color: "var(--color-success-500)",
    filter: "drop-shadow(var(--shadow-glow-success)) drop-shadow(var(--shadow-glow-success))",
  },
  [GameListStatusEnum.C]: {
    color: "var(--color-primary-500)",
    filter: "drop-shadow(var(--shadow-glow-primary)) drop-shadow(var(--shadow-glow-primary))",
  },
  [GameListStatusEnum.PTP]: {
    color: "var(--color-text-500)",
    filter: "drop-shadow(var(--shadow-glow-background)) drop-shadow(var(--shadow-glow-background))",
  },
  [GameListStatusEnum.OH]: {
    color: "var(--color-secondary-500)",
    filter: "drop-shadow(var(--shadow-glow-secondary)) drop-shadow(var(--shadow-glow-secondary))",
  },
  [GameListStatusEnum.D]: {
    color: "var(--color-error-500)",
    filter: "drop-shadow(var(--shadow-glow-error)) drop-shadow(var(--shadow-glow-error))",
  },
};

const STATUS_ICONS: Record<GameListStatusEnum, TablerIcon> = {
  [GameListStatusEnum.P]: IconDeviceGamepad2,
  [GameListStatusEnum.C]: IconTrophy,
  [GameListStatusEnum.PTP]: IconCalendarClock,
  [GameListStatusEnum.OH]: IconPlayerPause,
  [GameListStatusEnum.D]: IconCircleX,
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
    icon: STATUS_ICONS[key],
    badgeStyle: BADGE_STYLES[key],
    neonStyle: NEON_STYLES[key],
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
