import { Box, Text, SegmentedControl, useMantineColorScheme, useComputedColorScheme } from "@mantine/core";
import { IconSun, IconMoon } from "@tabler/icons-react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import AppLogo from "@/components/ui/AppLogo";
import i18n from "@/lib/i18n";
import { useLanguageStore, type Language } from "@/lib/languageStore";

import styles from "./Footer.module.css";

const Footer = (): React.JSX.Element => {
  const currentYear = new Date().getFullYear();
  const { language, setLanguage } = useLanguageStore();
  const { setColorScheme } = useMantineColorScheme();
  const colorScheme = useComputedColorScheme("light");
  const { t } = useTranslation();
  const queryClient = useQueryClient();

  const handleLanguageChange = (value: string) => {
    const lang = value as Language;
    setLanguage(lang);
    void i18n.changeLanguage(lang);
    queryClient.invalidateQueries().catch(() => {});
  };

  return (
    <Box
      component="footer"
      style={{
        background: colorScheme === "dark" ? "#000000" : "var(--color-background-100)",
        borderTop: "1px solid var(--color-background-400)",
        paddingBlock: "24px",
        marginTop: "auto",
      }}
    >
      <div className={styles.footerInner}>
        <div className={styles.leftSection}>
          <Link to="/home" className={styles.logoLink}>
            <AppLogo size="md" onDark={colorScheme === "dark"} />
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
          <SegmentedControl
            value={colorScheme}
            onChange={value => setColorScheme(value as "light" | "dark")}
            size="xs"
            aria-label={t("footer.colorScheme")}
            data={[
              { value: "light", label: <IconSun size={14} stroke={1.75} aria-label={t("footer.lightMode")} /> },
              { value: "dark", label: <IconMoon size={14} stroke={1.75} aria-label={t("footer.darkMode")} /> },
            ]}
          />
        </div>
      </div>
    </Box>
  );
};

export default Footer;
