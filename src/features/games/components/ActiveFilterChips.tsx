import { useTranslation } from "react-i18next";

import { FilterChips } from "@/components/ui/FilterChips";

import type { GameListGameFilters } from "../hooks/useGameListQueries";

interface ActiveFilterChipsProps {
  filters: GameListGameFilters;
  onRemove: (key: keyof GameListGameFilters) => void;
  onClearAll: () => void;
}

/** Removable summary of the filters applied from the drawer; ordering is a sort, not a filter. */
export function ActiveFilterChips({ filters, onRemove, onClearAll }: Readonly<ActiveFilterChipsProps>) {
  const { t } = useTranslation("games");

  const labels: Partial<Record<keyof GameListGameFilters, string>> = {
    developer: t("filter.developer"),
    publisher: t("filter.publisher"),
    platforms: t("filter.platforms"),
    genres: t("filter.genres"),
    game_engines: t("filter.gameEngines"),
    game_modes: t("filter.gameModes"),
    game_status: t("filter.gameStatuses"),
    game_type: t("filter.gameTypes"),
    player_perspectives: t("filter.playerPerspectives"),
    release_date_after: t("filter.releaseAfter"),
    release_date_before: t("filter.releaseBefore"),
  };

  const chips = (Object.keys(labels) as (keyof GameListGameFilters)[])
    .filter(key => {
      const value = filters[key];
      return Array.isArray(value) ? value.length > 0 : Boolean(value);
    })
    .map(key => {
      const value = filters[key];
      return {
        key,
        name: labels[key] ?? key,
        label: Array.isArray(value) ? `${labels[key]} (${value.length})` : `${labels[key]}: ${String(value)}`,
      };
    });

  return (
    <FilterChips chips={chips} onRemove={key => onRemove(key as keyof GameListGameFilters)} onClearAll={onClearAll} />
  );
}
