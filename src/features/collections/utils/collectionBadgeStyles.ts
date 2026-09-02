import type React from "react";

import { ModeEnum, TypeEnum, VisibilityEnum } from "@/client";

/** Shared pill shape for the visibility / mode / type badges. */
export const COLLECTION_BADGE_STYLE: React.CSSProperties = {
  padding: "2px 10px",
  borderRadius: "9999px",
  fontSize: "10px",
  fontWeight: 900,
  textTransform: "uppercase",
  letterSpacing: "0.05em",
};

export function getVisibilityBadgeStyle(visibility: VisibilityEnum | string | undefined): React.CSSProperties {
  if (visibility === VisibilityEnum.PUB) {
    return {
      background: "var(--color-visibility-public-bg)",
      color: "var(--color-visibility-public-text)",
      border: "1px solid var(--color-visibility-public-border)",
    };
  }
  if (visibility === VisibilityEnum.FRI) {
    return {
      background: "var(--color-visibility-friends-bg)",
      color: "var(--color-visibility-friends-text)",
      border: "1px solid var(--color-visibility-friends-border)",
    };
  }
  return {
    background: "var(--color-visibility-private-bg)",
    color: "var(--color-visibility-private-text)",
    border: "1px solid var(--color-visibility-private-border)",
  };
}

export function getModeBadgeStyle(mode: ModeEnum | string | undefined): React.CSSProperties {
  return mode === ModeEnum.S
    ? {
        background: "var(--color-collection-mode-solo-bg)",
        color: "var(--color-collection-mode-solo-text)",
        border: "1px solid var(--color-collection-mode-solo-border)",
      }
    : {
        background: "var(--color-collection-mode-collab-bg)",
        color: "var(--color-collection-mode-collab-text)",
        border: "1px solid var(--color-collection-mode-collab-border)",
      };
}

export function getTypeBadgeStyle(type: TypeEnum | string | undefined): React.CSSProperties {
  switch (type) {
    case TypeEnum.RNK: {
      return {
        background: "var(--color-type-ranking-bg)",
        color: "var(--color-type-ranking-text)",
        border: "1px solid var(--color-type-ranking-border)",
      };
    }
    case TypeEnum.TIE: {
      return {
        background: "var(--color-type-tierlist-bg)",
        color: "var(--color-type-tierlist-text)",
        border: "1px solid var(--color-type-tierlist-border)",
      };
    }
    default: {
      return {
        background: "var(--color-type-normal-bg)",
        color: "var(--color-type-normal-text)",
        border: "1px solid var(--color-type-normal-border)",
      };
    }
  }
}
