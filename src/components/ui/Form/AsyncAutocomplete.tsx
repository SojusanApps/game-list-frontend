import * as React from "react";
import { Select, Loader, ComboboxProps } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { InfiniteData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

type PaginatedResponse<T> = {
  results: T[];
  next?: string | null;
  count: number;
};

type AsyncAutocompleteProps<T> = {
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
  getOptionLabel: (item: T) => string;
  getOptionValue: (item: T) => string | number;
  value?: string | null;
  onChange?: (value: string | null) => void;
  error?: React.ReactNode;
  comboboxProps?: ComboboxProps;
};

export default function AsyncAutocomplete<T>({
  id,
  name,
  required = false,
  label,
  placeholder,
  useInfiniteQueryHook,
  className,
  getOptionLabel,
  getOptionValue,
  value,
  onChange,
  error,
  comboboxProps,
}: Readonly<AsyncAutocompleteProps<T>>) {
  const [searchTerm, setSearchTerm] = React.useState("");
  const [debouncedSearch] = useDebouncedValue(searchTerm, 300);
  const { t } = useTranslation("common");

  const { data, isLoading, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQueryHook(debouncedSearch);

  const allOptions = React.useMemo(() => data?.pages.flatMap(page => page.results) || [], [data]);

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
    <Select
      id={id}
      name={name}
      label={label}
      placeholder={placeholder}
      required={required}
      className={className}
      data={selectData}
      value={value}
      onChange={onChange}
      error={error}
      searchable
      clearable
      filter={({ options }) => options}
      searchValue={searchTerm}
      onSearchChange={setSearchTerm}
      scrollAreaProps={{ viewportRef: dropdownRef, onScrollPositionChange: handleDropdownScroll }}
      rightSection={isLoading || isFetchingNextPage ? <Loader size="xs" /> : undefined}
      nothingFoundMessage={isLoading ? t("searching") : t("noResults")}
      comboboxProps={{
        withinPortal: false,
        position: "bottom",
        middlewares: { flip: false, shift: false },
        ...comboboxProps,
      }}
    />
  );
}
