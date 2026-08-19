import { Box, Text, SegmentedControl, Select, useMantineColorScheme } from "@mantine/core";
import { IconSun, IconMoon, IconMoonStars } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import AppLogo from "@/components/ui/AppLogo";
import { mantineSchemeFor, useAppThemeStore, type AppTheme } from "@/lib/appThemeStore";
import i18n from "@/lib/i18n";
import { useLanguageStore, type Language } from "@/lib/languageStore";

import styles from "./Footer.module.css";

const themeIcons: Record<AppTheme, React.JSX.Element> = {
  light: <IconSun size={14} stroke={1.75} />,
  dark: <IconMoon size={14} stroke={1.75} />,
  "pitch-black": <IconMoonStars size={14} stroke={1.75} />,
};

const Footer = (): React.JSX.Element => {
  const currentYear = new Date().getFullYear();
  const { language, setLanguage } = useLanguageStore();
  const { theme, setTheme } = useAppThemeStore();
  const { setColorScheme } = useMantineColorScheme();
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleLanguageChange = (value: string) => {
    const lang = value as Language;
    setLanguage(lang);
    void i18n.changeLanguage(lang);
    queryClient.invalidateQueries().catch(() => {});
  };

  const handleThemeChange = (value: string) => {
    const nextTheme = value as AppTheme;
    setTheme(nextTheme);
    setColorScheme(mantineSchemeFor(nextTheme));
  };

  return (
    <Box
      component="footer"
      style={{
        background: theme === "pitch-black" ? "#000000" : "var(--color-background-100)",
        borderTop: "1px solid var(--color-background-400)",
        paddingBlock: "24px",
        marginTop: "auto",
      }}
    >
      <div className={styles.footerInner}>
        <div className={styles.leftSection}>
          <Link to="/home" className={styles.logoLink}>
            <AppLogo size="md" onDark={theme !== "light"} />
          </Link>
          <Text size="xs" c="var(--color-text-400)">
            {t("footer.copyright", { year: currentYear })}{" "}
            <a href="https://www.igdb.com/" target="_blank" rel="noopener noreferrer" className={styles.footerExtLink}>
              IGDB
            </a>
          </Text>
        </div>

        <div className={styles.rightSection}>
          <nav>
            <ul className={styles.navGroup}>
              <li>
                <Link to="/home" className={styles.footerLink}>
                  {t("footer.home")}
                </Link>
              </li>
              <li>
                <Link to="/search" className={styles.footerLink}>
                  {t("footer.search")}
                </Link>
              </li>
              <li>
                <Link to="/home" className={styles.footerLink}>
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </nav>
          <SegmentedControl
            value={language}
            onChange={handleLanguageChange}
            size="xs"
            data={[
              { label: "EN", value: "en" },
              { label: "PL", value: "pl" },
            ]}
          />
          <Select
            value={theme}
            onChange={value => value && handleThemeChange(value)}
            size="xs"
            w={132}
            allowDeselect={false}
            aria-label={t("footer.colorScheme")}
            leftSection={themeIcons[theme]}
            data={[
              {
                group: <IconSun size={14} stroke={1.75} aria-label={t("footer.lightMode")} />,
                items: [{ value: "light", label: t("footer.lightMode") }],
              },
              {
                group: <IconMoon size={14} stroke={1.75} aria-label={t("footer.darkMode")} />,
                items: [
                  { value: "dark", label: t("footer.darkMode") },
                  { value: "pitch-black", label: t("footer.pitchBlackMode") },
                ],
              },
            ]}
          />
        </div>
      </div>
    </Box>
  );
};

export default Footer;
