import { MultiSelect, Loader, ComboboxProps, Group, Box } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconCheck } from "@tabler/icons-react";
import { InfiniteData } from "@tanstack/react-query";
import * as React from "react";
import { useTranslation } from "react-i18next";

type PaginatedResponse<T> = {
  results: T[];
  next?: string | null;
  count: number;
};

type AsyncMultiSelectAutocompleteProps<T> = {
  id: string;
  name: string;
  required?: boolean;
  label: string;
  placeholder: string;
  useInfiniteQueryHook: (searchTerm: string) => {
    data: InfiniteData<PaginatedResponse<T>> | undefined;
    isLoading: boolean;
    fetchNextPage: () => void;
    hasNextPage: boolean;
    isFetchingNextPage: boolean;
  };
  className?: string;
  style?: React.CSSProperties;
  getOptionLabel: (item: T) => string;
  getOptionValue: (item: T) => string | number;
  renderOption?: (item: T) => React.ReactNode;
  hideTags?: boolean;
  onAdd?: (item: T) => void;
  onRemove?: (item: T) => void;
  /**
   * Items already selected (e.g. when editing). Seeds the internal lookup so
   * `renderOption` / `onRemove` can resolve values that were never in a search result.
   */
  selectedItems?: T[];
  value?: string[];
  onChange?: (value: string[]) => void;
  error?: React.ReactNode;
  comboboxProps?: ComboboxProps;
};

export default function AsyncMultiSelectAutocomplete<T>({
  id,
  name,
  required = false,
  label,
  placeholder,
  useInfiniteQueryHook,
  className,
  style,
  getOptionLabel,
  getOptionValue,
  renderOption,
  hideTags = false,
  onAdd,
  onRemove,
  selectedItems,
  value,
  onChange,
  error,
  comboboxProps,
}: Readonly<AsyncMultiSelectAutocompleteProps<T>>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const { t } = useTranslation("common");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQueryHook(debouncedSearch);

  const allOptions = React.useMemo(() => data?.pages.flatMap(page => page.results) || [], [data]);

  // Remember every item we've seen across searches, so `renderOption` and the
  // add/remove callbacks can resolve an option value back to its full item even
  // after the search term (and `allOptions`) has moved on.
  const seenItemsRef = React.useRef(new Map<string, T>());
  React.useEffect(() => {
    for (const item of [...(selectedItems ?? []), ...allOptions]) {
      seenItemsRef.current.set(getOptionValue(item).toString(), item);
    }
  }, [allOptions, selectedItems, getOptionValue]);

  // Fire `callback` for every value in `source` that is missing from `other`,
  // resolving each value back to its full item via the seen-items lookup.
  const notifyMissing = (source: string[], other: string[], callback?: (item: T) => void) => {
    if (!callback) {
      return;
    }
    const others = new Set(other);
    for (const v of source) {
      const item = others.has(v) ? undefined : seenItemsRef.current.get(v);
      if (item !== undefined) {
        callback(item);
      }
    }
  };

  const handleChange = (next: string[]) => {
    const prev = value ?? [];
    notifyMissing(next, prev, onAdd);
    notifyMissing(prev, next, onRemove);
    onChange?.(next);
  };

  const selectData = React.useMemo(() => {
    const seen = new Set<string>();
    const options = allOptions
      .map(item => ({
        value: getOptionValue(item).toString(),
        label: getOptionLabel(item),
      }))
      .filter(option => {
        if (seen.has(option.value)) {
          return false;
        }
        seen.add(option.value);
        return true;
      });
    if (!hasNextPage && !isLoading && options.length > 0) {
      options.push({
        value: "__all_results_loaded__",
        label: t("allResultsLoaded"),
        disabled: true,
      } as (typeof options)[number]);
    }
    return options;
  }, [allOptions, getOptionLabel, getOptionValue, hasNextPage, isLoading, t]);

  const dropdownRef = React.useRef<HTMLDivElement>(null);

  const handleDropdownScroll = React.useCallback(() => {
    const viewport = dropdownRef.current;
    if (!viewport) return;
    const { scrollTop, scrollHeight, clientHeight } = viewport;
    if (scrollHeight - scrollTop - clientHeight < 50 && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [fetchNextPage, hasNextPage, isFetchingNextPage]);

  return (
    <MultiSelect
      id={id}
      name={name}
      label={label}
      placeholder={placeholder}
      required={required}
      className={className}
      style={style}
      data={selectData}
      value={value}
      onChange={handleChange}
      error={error}
      searchable
      clearable
      // Filtering is done server-side by the backing endpoint; keep every fetched option.
      filter={({ options }) => options}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      scrollAreaProps={{ viewportRef: dropdownRef, onScrollPositionChange: handleDropdownScroll }}
      rightSection={isLoading || isFetchingNextPage ? <Loader size="xs" /> : undefined}
      nothingFoundMessage={isLoading ? t("searching") : t("noResults")}
      styles={hideTags ? { pill: { display: "none" } } : undefined}
      renderOption={
        renderOption
          ? ({ option, checked }) => {
              const item = seenItemsRef.current.get(option.value);
              const content = item === undefined ? option.label : renderOption(item);
              return (
                <Group wrap="nowrap" gap="sm" style={{ flex: 1, minWidth: 0 }}>
                  <Box style={{ flex: 1, minWidth: 0 }}>{content}</Box>
                  {checked && <IconCheck size={16} style={{ flexShrink: 0, color: "var(--color-primary-600)" }} />}
                </Group>
              );
            }
          : undefined
      }
      comboboxProps={{
        withinPortal: false,
        position: "bottom",
        middlewares: { flip: false, shift: false },
        ...comboboxProps,
      }}
    />
  );
}
