import { Box, Kbd, ScrollArea, Skeleton, Stack, Text, UnstyledButton, VisuallyHidden } from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import { IconSearch, IconX } from "@tabler/icons-react";
import { Link, useNavigate } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import { GameSimpleList } from "@/client";
import { SafeImage } from "@/components/ui/SafeImage";
import { TruncatedText } from "@/components/ui/TruncatedText";
import { useGetGamesList } from "@/features/games/hooks/gameQueries";
import IGDBImageSize, { getIGDBImageURL } from "@/features/games/utils/IGDBIntegration";

interface SearchBarProps {
  variant?: "light" | "dark";
}

export default function SearchBar({ variant = "dark" }: Readonly<SearchBarProps>): React.JSX.Element {
  const { t } = useTranslation("games");
  const [search, setSearch] = React.useState<string>("");
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const navigate = useNavigate();
  const [activeIndex, setActiveIndex] = React.useState(-1);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const [debouncedSearch] = useDebouncedValue(search, 300);
  const listboxId = React.useId();
  const optionId = (index: number) => `${listboxId}-option-${index}`;

  const { data: gamesDetails, isLoading } = useGetGamesList(
    { title: debouncedSearch },
    { enabled: debouncedSearch.length > 1 },
  );

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const results = gamesDetails?.results ?? [];

  // "/" or Ctrl/Cmd+K focuses the search from anywhere outside a text field.
  React.useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target?.matches("input, textarea, select, [contenteditable='true']");
      if ((event.key === "k" && (event.ctrlKey || event.metaKey)) || (event.key === "/" && !typing)) {
        event.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("keydown", handleShortcut);
    return () => document.removeEventListener("keydown", handleShortcut);
  }, []);

  const handleClose = () => {
    setSearch("");
    setIsOpen(false);
    setActiveIndex(-1);
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
    setActiveIndex(-1);
    setIsOpen(event.target.value.length > 1);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      setIsOpen(false);
    } else if (event.key === "ArrowDown" || event.key === "ArrowUp") {
      if (results.length === 0) {
        return;
      }
      event.preventDefault();
      setIsOpen(true);
      const step = event.key === "ArrowDown" ? 1 : -1;
      setActiveIndex(prev => (prev + step + results.length) % results.length);
    } else if (event.key === "Enter" && search.trim().length > 0) {
      event.preventDefault();
      const active = isOpen ? results[activeIndex] : undefined;
      if (active) {
        void navigate({ to: "/game/$id/$slug", params: { id: String(active.id), slug: active.slug || "" } });
      } else {
        void navigate({ to: "/search", search: { q: search.trim(), category: "games" } });
      }
      handleClose();
    }
  };

  const handleInputFocus = () => {
    if (search.length > 1) {
      setIsOpen(true);
    }
  };

  const renderResults = () => {
    if (isLoading) {
      return [0, 1, 2].map(i => (
        <Box component="li" role="presentation" key={`search-skeleton-${i}`} style={{ padding: "12px" }}>
          <Skeleton h={56} radius="md" />
        </Box>
      ));
    }

    if (gamesDetails?.results && gamesDetails.results.length > 0) {
      return gamesDetails.results.map((game: GameSimpleList, index) => (
        <Box
          component="li"
          key={game.id}
          id={optionId(index)}
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- ARIA combobox pattern
          role="option"
          aria-selected={index === activeIndex}
          style={{ width: "100%" }}
        >
          <Link
            to={"/game/$id/$slug"}
            params={{ id: game.id.toString(), slug: game.slug || "" }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "16px",
              padding: "12px",
              borderRadius: "8px",
              transition: "all 200ms",
              background: index === activeIndex ? "var(--color-background-300)" : undefined,
            }}
            onClick={handleClose}
          >
            <Box
              style={{
                position: "relative",
                overflow: "hidden",
                borderRadius: "6px",
                boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                flexShrink: 0,
              }}
            >
              <SafeImage
                style={{ width: 40, height: 56, objectFit: "cover" }}
                src={game.cover_image_id ? getIGDBImageURL(game.cover_image_id, IGDBImageSize.THUMB_90_90) : undefined}
                alt={game.title}
              />
            </Box>
            <Stack gap={0} style={{ overflow: "hidden" }}>
              <TruncatedText
                span
                fw={700}
                c="var(--color-text-900)"
                fz="sm"
                style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}
              >
                {game.title}
              </TruncatedText>
              {game.release_date && (
                <Text component="span" fz="xs" c="var(--color-text-500)" fw={500}>
                  {new Date(game.release_date).getFullYear()}
                </Text>
              )}
            </Stack>
          </Link>
        </Box>
      ));
    }

    return (
      <Box
        component="li"
        role="presentation"
        style={{
          padding: "32px",
          textAlign: "center",
          color: "var(--color-text-500)",
          fontStyle: "italic",
          fontSize: "14px",
        }}
      >
        {t("searchBar.noResults")}
      </Box>
    );
  };

  return (
    <Box component="section" ref={containerRef} style={{ position: "relative", width: "100%", maxWidth: "448px" }}>
      <Box style={{ position: "relative" }}>
        <Box
          component="input"
          ref={inputRef}
          type="text"
          placeholder={t("searchBar.placeholder")}
          style={{
            width: "100%",
            background: variant === "dark" ? "rgba(255,255,255,0.1)" : "var(--color-background-200)",
            border: variant === "dark" ? "1px solid rgba(255,255,255,0.2)" : "1px solid var(--color-background-300)",
            color: variant === "dark" ? "white" : "var(--color-text-900)",
            borderRadius: "9999px",
            padding: "8px 40px 8px 16px",
            fontSize: "14px",
          }}
          autoComplete="off"
          // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- ARIA combobox pattern
          role="combobox"
          aria-autocomplete="list"
          aria-expanded={isOpen && search.length > 1}
          aria-controls={listboxId}
          aria-activedescendant={isOpen && activeIndex >= 0 ? optionId(activeIndex) : undefined}
          aria-label={t("searchBar.placeholder")}
          onKeyDown={handleKeyDown}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          value={search}
        />
        <Box
          style={{
            position: "absolute",
            right: "12px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
          }}
        >
          {search.length > 0 ? (
            <UnstyledButton
              onClick={handleClose}
              aria-label={t("searchBar.clear")}
              style={{ color: variant === "dark" ? "var(--color-primary-300)" : "var(--color-text-500)" }}
            >
              <IconX style={{ width: 20, height: 20 }} />
            </UnstyledButton>
          ) : (
            <>
              <Kbd size="xs" visibleFrom="lg" mr={8} aria-hidden>
                /
              </Kbd>
              <IconSearch
                style={{
                  width: 20,
                  height: 20,
                  color: variant === "dark" ? "var(--color-primary-400)" : "var(--color-text-500)",
                }}
              />
            </>
          )}
        </Box>
      </Box>

      {/* oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- ARIA combobox pattern */}
      <VisuallyHidden role="status" aria-live="polite">
        {isOpen && !isLoading && debouncedSearch.length > 1 && results.length > 0
          ? t("searchBar.resultsCount", { count: results.length })
          : ""}
      </VisuallyHidden>

      {isOpen && search.length > 1 && (
        <Box
          style={{
            position: "absolute",
            zIndex: 50,
            marginTop: "8px",
            width: "100%",
            background: "var(--color-background-100)",
            borderRadius: "12px",
            boxShadow: "0 25px 50px rgba(0,0,0,0.25)",
            border: "1px solid var(--color-background-200)",
            overflow: "hidden",
          }}
        >
          <ScrollArea
            component="ul"
            id={listboxId}
            // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- ARIA combobox pattern
            role="listbox"
            aria-label={t("searchBar.placeholder")}
            style={{ maxHeight: "60vh", display: "flex", flexDirection: "column" }}
            viewportProps={{
              style: {
                flex: 1,
                height: "auto",
                minHeight: 0,
                padding: "4px",
                display: "flex",
                flexDirection: "column",
                gap: "4px",
              },
            }}
          >
            {renderResults()}
            <Box component="li" role="presentation" style={{ padding: "4px" }}>
              <Link
                to="/search"
                search={{ q: debouncedSearch || undefined, category: "games" }}
                onClick={handleClose}
                style={{
                  display: "block",
                  textAlign: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                  color: "var(--color-primary-600)",
                  borderRadius: "8px",
                  padding: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {t("searchBar.advancedSearch")}
              </Link>
            </Box>
          </ScrollArea>
        </Box>
      )}
    </Box>
  );
}
