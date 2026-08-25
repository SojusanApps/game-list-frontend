import { Box, Text, useComputedColorScheme } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import * as React from "react";
import { useTranslation } from "react-i18next";

import AppLogo from "@/components/ui/AppLogo";

import styles from "./Footer.module.css";

const Footer = (): React.JSX.Element => {
  const currentYear = new Date().getFullYear();
  const colorScheme = useComputedColorScheme("light");
  const { t } = useTranslation();

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
          <Link to="/" className={styles.logoLink}>
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
                <Link to="/" className={styles.footerLink}>
                  {t("footer.home")}
                </Link>
              </li>
              <li>
                <Link to="/search" className={styles.footerLink}>
                  {t("footer.search")}
                </Link>
              </li>
              <li>
                <Link to="/faq" className={styles.footerLink}>
                  {t("footer.faq")}
                </Link>
              </li>
              <li>
                <Link to="/terms" className={styles.footerLink}>
                  {t("footer.terms")}
                </Link>
              </li>
              <li>
                <Link to="/privacy" className={styles.footerLink}>
                  {t("footer.privacy")}
                </Link>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </Box>
  );
};

export default Footer;
