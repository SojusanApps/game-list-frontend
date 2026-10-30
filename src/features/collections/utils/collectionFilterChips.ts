import type { TFunction } from "i18next";

import type { FilterChip } from "@/components/ui/FilterChips";

interface Option {
  value: string;
  label: string;
}

export function getCollectionFilterOptions(t: TFunction<"collections">) {
  return {
    visibilityOptions: [
      { value: "PUB", label: t("visibility.public") },
      { value: "FRI", label: t("visibility.friends") },
      { value: "PRI", label: t("visibility.private") },
    ] satisfies Option[],
    modeOptions: [
      { value: "S", label: t("mode.solo") },
      { value: "C", label: t("mode.collaborative") },
    ] satisfies Option[],
    typeOptions: [
      { value: "NOR", label: t("type.normal") },
      { value: "RNK", label: t("type.ranking") },
      { value: "TIE", label: t("type.tierList") },
    ] satisfies Option[],
  };
}

interface CollectionFilterValues {
  name: string;
  favorites: boolean;
  shared: boolean;
  visibility: string | null;
  mode: string | null;
  type: string | null;
}

/** A chip for a select-style filter, or none when nothing (or an unknown value) is selected. */
function selectChip(key: string, name: string, value: string | null, options: Option[]): FilterChip[] {
  const label = options.find(option => option.value === value)?.label;
  return label ? [{ key, name, label: `${name}: ${label}` }] : [];
}

/** The removable chips summarizing the active filters on the collections list. */
export function buildCollectionFilterChips(t: TFunction<"collections">, values: CollectionFilterValues): FilterChip[] {
  const { visibilityOptions, modeOptions, typeOptions } = getCollectionFilterOptions(t);
  return [
    ...(values.name
      ? [{ key: "name", name: t("list.namePlaceholder"), label: t("list.activeName", { value: values.name }) }]
      : []),
    ...(values.favorites ? [{ key: "favorites", name: t("list.filterShow"), label: t("list.filterFavorites") }] : []),
    ...(values.shared ? [{ key: "shared", name: t("list.filterScope"), label: t("list.filterIncludeShared") }] : []),
    ...selectChip("visibility", t("list.filterVisibility"), values.visibility, visibilityOptions),
    ...selectChip("mode", t("list.filterMode"), values.mode, modeOptions),
    ...selectChip("type", t("list.filterType"), values.type, typeOptions),
  ];
}
