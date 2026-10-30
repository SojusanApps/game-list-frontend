import type { TFunction } from "i18next";
import type React from "react";

// Shared by the notifications table and the phone list so a category or level looks the same in both.

export function getLevelColor(level?: string) {
  switch (level?.toLowerCase()) {
    case "info":
    case "informacja": {
      return "blue";
    }
    case "warning":
    case "ostrzeżenie": {
      return "yellow";
    }
    case "success":
    case "sukces": {
      return "green";
    }
    case "error":
    case "błąd": {
      return "red";
    }
    default: {
      return "gray";
    }
  }
}

export function getCategoryStyle(category?: string): React.CSSProperties {
  const hue = (() => {
    switch (category?.toLowerCase()) {
      case "system": {
        return "system";
      }
      case "friendship":
      case "znajomość": {
        return "friendship";
      }
      case "game release":
      case "premiera gry": {
        return "gamerelease";
      }
      case "translation":
      case "tłumaczenie": {
        return "translation";
      }
      default: {
        return "default";
      }
    }
  })();

  return {
    background: `var(--color-category-${hue}-bg)`,
    color: `var(--color-category-${hue}-text)`,
    borderColor: `var(--color-category-${hue}-border)`,
  };
}

export function formatText(t: TFunction<"notifications">, text?: string) {
  if (!text) {
    return t("page.unknown");
  }
  return text
    .split("_")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}
