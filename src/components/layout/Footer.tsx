import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Box, Text, SegmentedControl } from "@mantine/core";
import AppLogo from "@/components/ui/AppLogo";
import styles from "./Footer.module.css";
import { useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { useLanguageStore, type Language } from "@/lib/languageStore";
import { useQueryClient } from "@tanstack/react-query";

const Footer = (): React.JSX.Element => {
  const currentYear = new Date().getFullYear();
  const { language, setLanguage } = useLanguageStore();
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
        background: "white",
        borderTop: "1px solid var(--color-background-400)",
        paddingBlock: "24px",
        marginTop: "auto",
      }}
    >
      <div className={styles.footerInner}>
        <div className={styles.leftSection}>
          <Link to="/home" className={styles.logoLink}>
            <AppLogo size="md" />
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
        </div>
      </div>
    </Box>
  );
};

export default Footer;
