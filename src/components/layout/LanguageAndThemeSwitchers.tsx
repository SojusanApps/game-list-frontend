import { Group, SegmentedControl, Tooltip, useMantineColorScheme, VisuallyHidden } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconDeviceDesktop, IconMoon, IconSun } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import * as React from "react";
import { useTranslation } from "react-i18next";

import i18n from "@/lib/i18n";
import { useLanguageStore, type Language } from "@/lib/languageStore";
import { fireAndForget } from "@/utils/promiseUtils";

/** Data that doesn't depend on the interface language, so a language switch doesn't need to refetch it. */
const LANGUAGE_INDEPENDENT_QUERY_ROOTS = new Set(["users", "friendships", "friendship-requests", "game-follows"]);

/** A segment's content with the option's full name shown on hover/focus; the span fills the segment. */
function withTooltip(name: string, content: React.ReactNode): React.JSX.Element {
  return (
    <Tooltip label={name} withArrow>
      <span
        style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4, height: 18, lineHeight: 1 }}
      >
        {content}
      </span>
    </Tooltip>
  );
}

export function LanguageAndThemeSwitchers(): React.JSX.Element {
  const { language, setLanguage } = useLanguageStore();
  const { colorScheme, setColorScheme } = useMantineColorScheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const isTouch = useMediaQuery("(hover: none)");
  const size = isTouch ? "md" : "xs";
  // Same box for both controls, whatever their number of segments or kind of content.
  const width = isTouch ? 132 : 96;

  const handleLanguageChange = (value: string) => {
    const lang = value as Language;
    setLanguage(lang);
    fireAndForget(i18n.changeLanguage(lang));
    queryClient
      .invalidateQueries({
        predicate: query => !LANGUAGE_INDEPENDENT_QUERY_ROOTS.has(String(query.queryKey[0])),
        refetchType: "active",
      })
      .catch(() => {});
  };

  return (
    <Group gap={12}>
      <SegmentedControl
        value={language}
        onChange={handleLanguageChange}
        size={size}
        w={width}
        aria-label={t("nav.language")}
        data={[
          { label: withTooltip(t("nav.languageEn"), "EN"), value: "en" },
          { label: withTooltip(t("nav.languagePl"), "PL"), value: "pl" },
        ]}
      />
      <SegmentedControl
        value={colorScheme}
        onChange={value => setColorScheme(value as "light" | "dark" | "auto")}
        size={size}
        w={width}
        aria-label={t("nav.colorScheme")}
        data={[
          {
            value: "light",
            label: withTooltip(
              t("nav.lightMode"),
              <>
                <IconSun size={14} stroke={1.75} aria-hidden />
                <VisuallyHidden>{t("nav.lightMode")}</VisuallyHidden>
              </>,
            ),
          },
          {
            value: "auto",
            label: withTooltip(
              t("nav.themeSystem"),
              <>
                <IconDeviceDesktop size={14} stroke={1.75} aria-hidden />
                <VisuallyHidden>{t("nav.themeSystem")}</VisuallyHidden>
              </>,
            ),
          },
          {
            value: "dark",
            label: withTooltip(
              t("nav.darkMode"),
              <>
                <IconMoon size={14} stroke={1.75} aria-hidden />
                <VisuallyHidden>{t("nav.darkMode")}</VisuallyHidden>
              </>,
            ),
          },
        ]}
      />
    </Group>
  );
}
